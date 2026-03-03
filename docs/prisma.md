# Prisma + PostgreSQL (локально) — инструкции для `new-gorisons`

Этот документ описывает текущую настройку Prisma ORM (Prisma v7) + PostgreSQL **в этом репозитории**.

## Требования

- Node.js: **20.19+** (у нас ок)
- Prisma ORM: **7.x** (у нас ок)
- PostgreSQL локально через Docker Compose (порт **5421**)

## 1) Локальная база PostgreSQL (Docker)

В корне проекта есть `docker-compose.yml`, который поднимает Postgres:

- **наружный порт**: `5421`
- **внутри контейнера**: `5432`
- **db**: `new_gorisons`
- **user/pass**: `postgres / postgres`

### Запуск/остановка

```bash
docker compose up -d
docker compose down
```

### Остановка + удалить данные

```bash
docker compose down -v
```

### Логи

```bash
docker compose logs -f postgres
```

## 2) Переменные окружения

Файл `.env` в корне проекта должен содержать TCP-строку подключения:

```text
DATABASE_URL="postgres://postgres:postgres@localhost:5421/new_gorisons"
```

Важно: используем **обычный `postgres://...`**, не `prisma+postgres://...`.

## 3) Файлы Prisma в проекте

### `prisma/schema.prisma`

- generator:
  - `provider = "prisma-client"`
  - `output = "../app/generated/prisma"`
- datasource:
  - `provider = "postgresql"`
  - **без `url`** (URL задаётся через `prisma.config.ts`)

### `prisma.config.ts` (в корне проекта)

В Prisma v7 URL datasource хранится в конфиге Prisma:

- обязательно: `import "dotenv/config"`
- `datasource.url = env("DATABASE_URL")`

## 4) Prisma Client (важно для Next.js build)

Мы генерируем Prisma Client в `app/generated/prisma`.

В этом проекте **нужно запускать** не только `prisma generate`, но и дополнительную компиляцию, чтобы рядом появились `*.js` файлы, которые импортирует сгенерированный клиент.

### Команда генерации клиента (правильная)

```bash
npm run db:generate
```

Что делает:

- `prisma generate`
- `tsc -p tsconfig.prisma-client.json` (эмитит `*.js` рядом с `*.ts` внутри `app/generated/prisma`)

Если не запускать `db:generate`, `next build` может падать с ошибками `module not found` на `./enums.js` и подобные.

## 5) Применение схемы к базе (dev)

После изменений в `prisma/schema.prisma`:

```bash
npx prisma db push
npm run db:generate
```

### Важно про `migrate reset`

`prisma migrate reset` **не строит схему из `schema.prisma` напрямую** — он пересоздаёт БД и применяет **миграции** из `prisma/migrations`.

Если миграций **ещё нет**, то после `migrate reset` база может остаться пустой, и любые запросы (например сидинг) упадут с ошибками вида:

- `The table public.Service does not exist`

В таком случае:

- **быстро и просто (dev, данные не важны)**:

```bash
npx prisma db push --force-reset
npm run db:generate
npm run db:seed
```

- **если хочешь миграции “как правильно”** — сначала создай начальную миграцию:

```bash
npx prisma migrate dev --name init
npm run db:generate
npm run db:seed
```

## 5.1) Миграции (рекомендуется для продакшена)

В этом проекте можно работать двумя способами:

- **`prisma db push`**: быстро синхронизирует схему с базой (удобно в dev, без истории миграций)
- **`prisma migrate`**: создаёт/применяет миграции (нужно для контролируемых изменений и деплоя)

### Локальная разработка с миграциями

1) Правишь `prisma/schema.prisma`
2) Создаёшь миграцию и применяешь её к локальной БД:

```bash
npm run db:migrate:dev
```

3) После этого **обязательно** перегенерировать Prisma Client для Next.js:

```bash
npm run db:generate
```

Примечание: `migrate dev` попросит имя миграции — используй короткое и осмысленное (например `add_service_model`).

### Деплой миграций (production/CI)

На окружении, где уже есть миграции в репозитории:

```bash
npm run db:migrate:deploy
npm run db:generate
```

### Полный reset локальной БД

Если нужно полностью пересоздать схему (удаляет данные):

```bash
npm run db:migrate:reset
npm run db:generate
npm run db:seed
```

Если миграций ещё нет (папка `prisma/migrations` отсутствует), вместо `db:migrate:reset` используй:

```bash
npx prisma db push --force-reset
npm run db:generate
npm run db:seed
```

### Статус миграций

```bash
npm run db:migrate:status
```

## 6) Prisma singleton (обязательный паттерн)

Файл: `lib/prisma.ts`

- импорт PrismaClient **строго** из `../app/generated/prisma/client`
- используется `@prisma/adapter-pg` и опция `adapter` в `new PrismaClient({ adapter })`

## 7) Проверка подключения (db:test)

Тестовый скрипт: `scripts/test-database.ts`

Запуск:

```bash
npm run db:test
```

Скрипт идемпотентный: делает `upsert` demo-пользователя по email.

## 8) Данные услуг: сидинг

### Источник seed-данных

Seed-данные услуг хранятся **только** для сидинга:

- `scripts/seed-data/services.ts` → `SERVICES_SEED`

В рантайме приложение **не** использует моки.

### Сидинг в БД

```bash
npm run db:seed
```

Скрипт: `scripts/seed-services.ts` (очищает таблицу `Service` и создаёт записи заново; `Service.id` генерируется автоматически как UUID).

## 9) API

### Public API (используется UI)

- `GET /api/services` — список услуг из БД
- `GET /api/services/[id]` — услуга по id из БД

### Admin API (dev-only)

В production эти роуты возвращают 404.

- `GET /api/admin/services`
- `POST /api/admin/services`
- `PATCH /api/admin/services/[id]`
- `DELETE /api/admin/services/[id]`

## 10) Админка (dev-only)

UI для CRUD услуг:

- `/admin/services`

Запуск:

```bash
npm run dev
```

В production страница недоступна (404).

## 11) Prisma Studio

```bash
npm run db:studio
```

## Быстрый старт (с нуля)

```bash
docker compose up -d
npx prisma db push
npm run db:generate
npm run db:seed
npm run dev
```

