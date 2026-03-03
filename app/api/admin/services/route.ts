import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

function ensureDevOnly() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export async function GET(_request: NextRequest) {
  const devOnly = ensureDevOnly();
  if (devOnly) return devOnly;

  try {
    const services = await prisma.service.findMany({
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services (admin):", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const devOnly = ensureDevOnly();
  if (devOnly) return devOnly;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const category =
      body.category === "main" || body.category === "legal" ? body.category : null;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const price = typeof body.price === "string" ? body.price.trim() : "";
    const ctaText = typeof body.ctaText === "string" ? body.ctaText.trim() : "";

    if (!category || !title || !price || !ctaText) {
      return NextResponse.json(
        { error: "category, title, price, ctaText are required" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        category,
        title,
        price,
        ctaText,
        image: typeof body.image === "string" ? body.image : null,
        stockBadge: typeof body.stockBadge === "string" ? body.stockBadge : null,
        rating: typeof body.rating === "number" ? body.rating : null,
        reviewCount: typeof body.reviewCount === "number" ? body.reviewCount : null,
        ctaHref: typeof body.ctaHref === "string" ? body.ctaHref : null,
        description: typeof body.description === "string" ? body.description : null,
        highlight: typeof body.highlight === "string" ? body.highlight : null,
        badge: typeof body.badge === "string" ? body.badge : null,
        paletteColor: typeof body.paletteColor === "string" ? body.paletteColor : null,
        icon: typeof body.icon === "string" ? body.icon : null,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service (admin):", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

