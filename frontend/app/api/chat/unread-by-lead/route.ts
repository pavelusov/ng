import { NextResponse } from "next/server";
import { fetchBackendAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.toString();
    const path = `/chat/unread-by-lead${search ? `?${search}` : ""}`;

    const response = await fetchBackendAsUser(path, session.user.id);
    const payload = await response.json().catch(() => ({ error: "Failed to fetch unread map" }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Error fetching chat unread map:", error);
    return NextResponse.json({ error: "Failed to fetch unread map" }, { status: 500 });
  }
}
