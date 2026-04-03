import { NextResponse } from "next/server";
import { fetchBackendAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const response = await fetchBackendAsUser("/chat/ensure", session.user.id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const payload = await response.json().catch(() => ({ error: "Failed to ensure chat" }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Error ensuring chat:", error);
    return NextResponse.json({ error: "Failed to ensure chat" }, { status: 500 });
  }
}
