import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, fetchBackendAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetchBackend(`/services/${id}`);
    const payload = await response.json().catch(() => ({ error: "Failed to fetch service" }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const session = await getServerAuthSession();

    const response = session?.user?.id
      ? await fetchBackendAsUser(`/services/${id}/leads`, session.user.id, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        })
      : await fetchBackend(`/services/${id}/leads`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        });

    const payload = await response.json().catch(() => ({ error: "Failed to create service lead" }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Error creating service lead:", error);
    return NextResponse.json(
      { error: "Failed to create service lead" },
      { status: 500 }
    );
  }
}
