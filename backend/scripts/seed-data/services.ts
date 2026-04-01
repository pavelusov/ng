type ServiceSeed = {
  category: 'main' | 'legal';
  title: string;
  price: string;
  ctaText: string;
  ctaHref?: string | null;
  image?: string | null;
  stockBadge?: string | null;
  description?: string | null;
  highlight?: string | null;
  badge?: string | null;
  paletteColor?: string | null;
  icon?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
};

export const SERVICES_SEED: ServiceSeed[] = [
  {
    category: 'main',
    title:
      'Перераспределение земельного участка. Увеличение площади за счёт прилегающей территории.',
    description:
      'Увеличение площади земельного участка за счет прилегающей территории.',
    highlight: 'за счет прилегающей территории',
    image: '/hero-bg-house_static_day.jpg',
    price: 'от 25 000 ₽',
    stockBadge: 'Популярно',
    rating: 5,
    reviewCount: 12,
    ctaText: 'Записаться',
    ctaHref: '#contacts',
    paletteColor: 'secondary',
    icon: 'map',
  },
  {
    category: 'main',
    title:
      'Подключение электричества. Подача заявок для физлиц и юрлиц, льготное подключение.',
    description:
      'Подача заявок на подключение электричества для физических и юридических лиц. Льготное подключение с выгодой до 90% от цены рынка.',
    highlight: 'выгодой до 90% от цены рынка',
    badge: '90% выгода',
    image: '/hero-bg-house_static_day.jpg',
    price: 'от 5 500 ₽',
    stockBadge: '90% выгода',
    rating: 5,
    reviewCount: 8,
    ctaText: 'Узнать стоимость',
    ctaHref: '#contacts',
    paletteColor: 'primary',
    icon: 'electric',
  },
  {
    category: 'main',
    title:
      'Кадастровые работы: межевание, техпланы, постановка на учёт и внесение изменений в ЕГРН.',
    description:
      'Межевание и подготовка технических/межевых планов, постановка на кадастровый учёт и внесение изменений в ЕГРН.',
    highlight: 'ЕГРН',
    image: '/hero-bg-house_static_day.jpg',
    price: 'от 15 000 ₽',
    rating: 4.9,
    reviewCount: 24,
    ctaText: 'Консультация',
    ctaHref: '#contacts',
    paletteColor: 'error',
    icon: 'architecture',
  },
  ...[
    { title: 'Изменение вида разрешённого использования земли', price: 'от 35 000 ₽' },
    { title: 'Признание права собственности', price: 'от 45 000 ₽' },
    { title: 'Оформление документов на землю', price: 'от 28 000 ₽' },
    { title: 'Оформление участка под домом', price: 'от 32 000 ₽' },
    { title: 'Оформление разрешений на строительство', price: 'от 40 000 ₽' },
    { title: 'Исправление кадастровой ошибки', price: 'от 25 000 ₽' },
    { title: 'Установление земельного сервитута', price: 'от 30 000 ₽' },
    { title: 'Сопровождение дачной амнистии', price: 'от 22 000 ₽' },
    { title: 'Установление границ земельного участка', price: 'от 38 000 ₽' },
    { title: 'Сопровождение сделок с недвижимостью', price: 'от 50 000 ₽' },
    { title: 'Представительство в суде', price: 'от 35 000 ₽' },
    { title: 'Составление исковых заявлений', price: 'от 15 000 ₽' },
    { title: 'Юридическая проверка недвижимости', price: 'от 18 000 ₽' },
    { title: 'Раздел имущества', price: 'от 42 000 ₽' },
  ].map((item, index) => ({
    category: 'legal' as const,
    title: item.title,
    price: item.price,
    image: '/hero-bg-house_static.jpg',
    rating: index % 3 === 0 ? 5 : undefined,
    reviewCount: index % 2 === 0 ? (index % 5) + 1 : undefined,
    ctaText: 'Записаться',
    ctaHref: '#contacts',
  })),
];
