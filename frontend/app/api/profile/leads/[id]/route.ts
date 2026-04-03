import { NextRequest, NextResponse } from "next/server";
import { fetchBackendAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetchBackendAsUser(`/service-leads/mine/${id}`, session.user.id);
    const payload = await response.json().catch(() => ({ error: "Failed to fetch service lead" }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Error fetching customer lead:", error);
    return NextResponse.json({ error: "Failed to fetch service lead" }, { status: 500 });
  }
}

