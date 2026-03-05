import { NextRequest, NextResponse } from "next/server";
import { serviceRepository } from "@/entities/service/api/service.repository";
import { parseServicePatchDto } from "@/entities/service/dto/service.dto";

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
    const parsed = parseServicePatchDto(body);
    if (!parsed.data) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.issues },
        { status: 400 }
      );
    }

    const service = await serviceRepository.updateService(id, parsed.data);
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
    await serviceRepository.deleteService(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting service (admin):", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}

