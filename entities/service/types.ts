export type ServiceCardItem = {
  id: string;
  title: string;
  /** URL or path to image; if not set, placeholder is shown */
  image?: string;
  /** Badge overlapping image bottom, e.g. "Осталось 8 шт" */
  stockBadge?: string;
  /** Price or cost label, e.g. "1004 ₽" or "от 15 000 ₽" */
  price: string;
  /** 1–5 */
  rating?: number;
  /** Review count for label "N отзыв(ов)" */
  reviewCount?: number;
  /** CTA button text, e.g. "3 марта" or "Записаться" */
  ctaText: string;
  ctaHref?: string;
};

export type ServicePaletteColor =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error";

/** Icon key for main services (maps to MUI icon in widget) */
export type ServiceIconKey = "map" | "electric" | "architecture";

/** Full service record — single source of truth for API and pages */
export type ServiceRecord = ServiceCardItem & {
  category: "main" | "legal";
  /** For main services: full description (about page) */
  description?: string;
  /** Substring to highlight in description */
  highlight?: string;
  /** For main: badge text (e.g. "90% выгода") — may duplicate stockBadge */
  badge?: string;
  paletteColor?: ServicePaletteColor;
  icon?: ServiceIconKey;
};
