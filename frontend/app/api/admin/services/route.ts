import { NextRequest, NextResponse } from "next/server";
import { fetchBackendAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";

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
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetchBackendAsUser("/admin/services", session.user.id);
    const payload = await response.json().catch(() => ({ error: "Failed to fetch services" }));
    return NextResponse.json(payload, { status: response.status });
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
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const response = await fetchBackendAsUser("/admin/services", session.user.id, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({ error: "Failed to create service" }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Error creating service (admin):", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

