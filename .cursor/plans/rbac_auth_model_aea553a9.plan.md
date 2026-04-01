---
name: rbac auth model
overview: "Спроектирована профессиональная ролевая модель для текущего Next.js + Prisma проекта: отдельно для системных ролей, ролей внутри организации продавца и гостевого доступа. План рекомендует изменения в Prisma-схеме и стек авторизации/авторизации, который лучше всего встраивается в уже используемый Auth.js."
todos:
  - id: design-role-model
    content: "Спроектировать целевую модель ролей: системные роли, роли внутри организации и гостевой доступ"
    status: completed
  - id: update-prisma-schema
    content: Подготовить изменения в `prisma/schema.prisma` для `User`, `Organization`, `OrganizationMember` и привязки `Service` к организации
    status: completed
  - id: extend-auth-session
    content: Спланировать расширение `lib/auth.ts` и `core/types/next-auth.d.ts`, чтобы роли и контекст организации попадали в JWT/Session
    status: completed
  - id: add-permission-layer
    content: Выбрать и встроить authorization-библиотеку, рекомендованно CASL поверх существующего Auth.js
    status: completed
isProject: false
---

# План ролевой модели и прав

## Что есть сейчас

Сейчас в [prisma/schema.prisma](/Users/pavelusov/Projects/lera/new-gorisons/prisma/schema.prisma) модель `User` хранит только базовые auth-данные, а в [lib/auth.ts](/Users/pavelusov/Projects/lera/new-gorisons/lib/auth.ts) в JWT/Session передаются только `id`, `name`, `email`, `image`. Это подходит для входа в систему, но не для разграничения доступа по ролям и организациям.

## Рекомендованная модель

Рекомендую разделить доступ на 2 уровня:

1. Системный уровень:

- `PLATFORM_ADMIN`
- `CUSTOMER`
- `GUEST` не хранить в БД, а трактовать как `unauthenticated`

1. Уровень продавца/исполнителя:

- отдельная сущность организации продавца
- членство пользователя в организации
- роль внутри организации: `OWNER` или `MANAGER`

Это лучше, чем одно поле `user.role`, потому что:

- один пользователь может быть покупателем и одновременно владельцем/менеджером продавца
- менеджеры должны принадлежать конкретному продавцу, а не существовать глобально
- права потом проще расширять без перелома схемы

## Варианты БД

### Вариант A: быстрый и простой

Добавить в `User` enum `role`:

- `PLATFORM_ADMIN`
- `SELLER`
- `SELLER_MANAGER`
- `CUSTOMER`

Плюсы:

- минимальные изменения
- быстро запустить

Минусы:

- плохо масштабируется
- менеджер не привязан к конкретному продавцу
- нельзя легко поддержать несколько организаций на одного пользователя

Использовать только если проект маленький и B2B-структура еще не определена.

### Вариант B: рекомендуемый

Добавить 3 сущности:

- `User`
- `Organization` или `ProviderProfile`
- `OrganizationMember`

Примерно так на уровне модели:

- `User.systemRole`: `PLATFORM_ADMIN | CUSTOMER`
- `Organization.type`: `SELLER`
- `OrganizationMember.role`: `OWNER | MANAGER`
- `Service.organizationId`

Плюсы:

- правильно отражает бизнес-домен
- менеджер всегда относится к конкретному продавцу
- можно дать одному пользователю доступ к нескольким организациям
- удобно строить scoped-доступ к услугам, заказам, кабинетам

Минусы:

- чуть больше таблиц и логики

Это основной рекомендованный вариант.

### Вариант C: enterprise-путь

Поверх варианта B добавить таблицы `Role`, `Permission`, `UserPermission` или `OrganizationRolePermission`.

Плюсы:

- очень гибко
- можно строить кастомные права вроде `service.update`, `staff.invite`, `billing.read`

Минусы:

- лишняя сложность на раннем этапе
- возрастает цена поддержки

Использовать только если вы заранее знаете, что роли будут сильно различаться по доступам и их нужно настраивать без деплоя.

## Что я бы изменил в текущей Prisma-схеме

### 1. Добавить системную роль пользователю

В [prisma/schema.prisma](/Users/pavelusov/Projects/lera/new-gorisons/prisma/schema.prisma):

- enum `SystemRole { PLATFORM_ADMIN CUSTOMER }`
- поле `User.systemRole SystemRole @default(CUSTOMER)`

`GUEST` в БД не хранить.

### 2. Добавить организацию продавца

Новая модель, например `Organization`:

- `id`
- `name`
- `slug`
- `type`
- `ownerUserId` если нужен быстрый доступ к владельцу
- `createdAt`, `updatedAt`

### 3. Добавить членство в организации

Новая модель `OrganizationMember`:

- `id`
- `organizationId`
- `userId`
- `role` enum: `OWNER | MANAGER`
- `status` enum: `ACTIVE | INVITED | SUSPENDED`
- уникальность `@@unique([organizationId, userId])`

### 4. Привязать бизнес-сущности к организации

У вас уже есть `Service` в [prisma/schema.prisma](/Users/pavelusov/Projects/lera/new-gorisons/prisma/schema.prisma) и репозиторий в [entities/service/api/service.repository.ts](/Users/pavelusov/Projects/lera/new-gorisons/entities/service/api/service.repository.ts), но услуга пока ничья. Для прав доступа нужно добавить:

- `Service.organizationId`
- relation `Service -> Organization`
- при необходимости `createdByUserId`, `updatedByUserId`

Без этого менеджеру/продавцу нечем будет ограничивать доступ на уровне данных.

### 5. Передавать роли в session/JWT

В [lib/auth.ts](/Users/pavelusov/Projects/lera/new-gorisons/lib/auth.ts) и [core/types/next-auth.d.ts](/Users/pavelusov/Projects/lera/new-gorisons/core/types/next-auth.d.ts):

- расширить `JWT` и `Session.user`
- добавить `systemRole`
- добавить `memberships` или `activeOrganizationId`

Это нужно, чтобы UI и серверные guard-проверки знали контекст текущего пользователя.

## Как трактовать ваши роли

- `администратор платформы`: `User.systemRole = PLATFORM_ADMIN`
- `продавец/исполнитель`: пользователь, у которого есть `OrganizationMember(role=OWNER)`
- `менеджер`: пользователь, у которого есть `OrganizationMember(role=MANAGER)`
- `покупатель`: `User.systemRole = CUSTOMER` и нет обязательного membership
- `гость`: отсутствует session

## Рекомендуемая модель прав

Не делать авторизацию только через `if (role === ...)`. Лучше завести permission-слой:

- `platform.manage`
- `organization.read`
- `organization.update`
- `service.create`
- `service.update`
- `service.delete`
- `staff.invite`
- `staff.manage`
- `booking.read`
- `booking.manage`

Тогда роли становятся просто наборами permission-прав:

- `PLATFORM_ADMIN`: все platform/global permissions
- `OWNER`: все permissions внутри своей организации
- `MANAGER`: ограниченный набор внутри своей организации
- `CUSTOMER`: только customer/self actions
- `GUEST`: только public read actions

## Библиотека для Next.js

### Основная рекомендация: Auth.js + CASL

Для вашего проекта я бы рекомендовал:

- оставить `next-auth`/Auth.js для аутентификации
- добавить `@casl/ability` и при необходимости `@casl/react` для авторизации

Почему это подходит:

- хорошо работает и на сервере, и в React UI
- удобно описывать права на уровне действий и сущностей
- можно учитывать ownership и scope, например: менеджер может редактировать только `Service` своей организации
- не заставляет сразу тащить таблицы `permissions`, если пока хватает кода

Пример направления правил:

- admin can `manage` `all`
- owner can `manage` `Organization`, `Service`, `OrganizationMember` в пределах своей `organizationId`
- manager can `read/create/update` `Service` в пределах своей `organizationId`, но не `delete organization`
- customer can `read` public data и управлять только своими сущностями
- guest can `read` public pages/services

### Когда вместо CASL взять Casbin

Выбрать `casbin`, если:

- политики нужно хранить отдельно и менять почти как конфигурацию
- ожидается сложная policy-модель уровня ACL/RBAC/ABAC
- доступы будут настраиваться администраторами системы

Для текущего этапа это, скорее всего, преждевременно. Начал бы с CASL.

## Предлагаемая последовательность внедрения

1. Перестроить Prisma-схему под `User + Organization + OrganizationMember + Service.organizationId`.
2. Обновить Auth.js callbacks в [lib/auth.ts](/Users/pavelusov/Projects/lera/new-gorisons/lib/auth.ts), чтобы роли и активная организация попадали в session/JWT.
3. Добавить слой `ability`/`permissions` в приложении.
4. Проверять права не только в UI, но и в server actions / route handlers / repositories.
5. Ограничить выборки Prisma по `organizationId`, чтобы менеджер физически не видел чужие данные.

## Практический вывод

Для вас профессиональный минимум сейчас такой:

- не хранить `GUEST` в БД
- не кодировать все в одном `User.role`
- ввести `Organization` и `OrganizationMember`
- хранить у пользователя только системную роль
- использовать `Auth.js` для login/session и `CASL` для permission-слоя

Если потом захотите, следующий шаг после утверждения плана — подготовить конкретную Prisma-схему с enum'ами и моделями именно под ваш проект.