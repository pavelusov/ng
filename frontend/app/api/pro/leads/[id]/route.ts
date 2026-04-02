import { NextRequest, NextResponse } from "next/server";
import { fetchBackendAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const response = await fetchBackendAsUser(`/admin/service-leads/${id}`, session.user.id, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({ error: "Failed to update service lead" }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Error updating pro lead:", error);
    return NextResponse.json({ error: "Failed to update service lead" }, { status: 500 });
  }
}
