import { NextRequest, NextResponse } from "next/server";
import { serviceRepository } from "@/entities/service/api/service.repository";
import { parseServiceCreateDto } from "@/entities/service/dto/service.dto";

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
    const services = await serviceRepository.getServices();
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
    const parsed = parseServiceCreateDto(body);
    if (!parsed.data) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.issues },
        { status: 400 }
      );
    }

    const service = await serviceRepository.createService(parsed.data);
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service (admin):", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

