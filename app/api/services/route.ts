import { NextResponse } from "next/server";
import { serviceRepository } from "@/entities/service/api/service.repository";

export async function GET() {
  try {
    const services = await serviceRepository.getServices();
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
