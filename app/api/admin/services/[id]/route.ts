import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

function ensureDevOnly() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const devOnly = ensureDevOnly();
  if (devOnly) return devOnly;

  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const category =
      body.category === undefined
        ? undefined
        : body.category === "main" || body.category === "legal"
          ? body.category
          : null;

    if (category === null) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        category,
        title: typeof body.title === "string" ? body.title : undefined,
        price: typeof body.price === "string" ? body.price : undefined,
        ctaText: typeof body.ctaText === "string" ? body.ctaText : undefined,
        image: typeof body.image === "string" ? body.image : body.image === null ? null : undefined,
        stockBadge:
          typeof body.stockBadge === "string"
            ? body.stockBadge
            : body.stockBadge === null
              ? null
              : undefined,
        rating:
          typeof body.rating === "number"
            ? body.rating
            : body.rating === null
              ? null
              : undefined,
        reviewCount:
          typeof body.reviewCount === "number"
            ? body.reviewCount
            : body.reviewCount === null
              ? null
              : undefined,
        ctaHref:
          typeof body.ctaHref === "string" ? body.ctaHref : body.ctaHref === null ? null : undefined,
        description:
          typeof body.description === "string"
            ? body.description
            : body.description === null
              ? null
              : undefined,
        highlight:
          typeof body.highlight === "string"
            ? body.highlight
            : body.highlight === null
              ? null
              : undefined,
        badge:
          typeof body.badge === "string" ? body.badge : body.badge === null ? null : undefined,
        paletteColor:
          typeof body.paletteColor === "string"
            ? body.paletteColor
            : body.paletteColor === null
              ? null
              : undefined,
        icon: typeof body.icon === "string" ? body.icon : body.icon === null ? null : undefined,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service (admin):", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const devOnly = ensureDevOnly();
  if (devOnly) return devOnly;

  const { id } = await params;

  try {
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting service (admin):", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}

