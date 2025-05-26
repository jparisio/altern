// app/api/auth/apple/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("apple_music_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
