import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown; name?: unknown };

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : undefined;

    if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "password must be at least 6 chars" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "user already exists" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error signing up:", error);
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 });
  }
}

