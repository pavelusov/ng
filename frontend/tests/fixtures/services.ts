import type { ServiceDto } from "@/entities/service";

export const mainService: ServiceDto = {
  id: "svc-main-1",
  category: "main",
  status: "PUBLISHED",
  title: "Межевание участка",
  price: "от 15 000 ₽",
  ctaText: "Записаться",
  ctaHref: "#contacts",
  image: null,
  stockBadge: null,
  description: "Описание",
  highlight: "участка",
  badge: "90% выгода",
  paletteColor: "primary",
  icon: "map",
  rating: 4.7,
  reviewCount: 18,
};

export const legalService: ServiceDto = {
  id: "svc-legal-1",
  category: "legal",
  status: "DRAFT",
  title: "Судебное сопровождение",
  price: "от 30 000 ₽",
  ctaText: "Оставить заявку",
  ctaHref: null,
  image: null,
  stockBadge: "Осталось 3 слота",
  description: null,
  highlight: null,
  badge: null,
  paletteColor: null,
  icon: null,
  rating: null,
  reviewCount: null,
};
