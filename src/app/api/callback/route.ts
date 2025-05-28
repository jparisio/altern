import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const usedCode = req.cookies.get("used_spotify_code")?.value;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
  }

  // Prevent code reuse (protect against refresh)
  if (usedCode === code) {
    return NextResponse.redirect(
      new URL("/login?error=code_already_used", req.url)
    );
  }

  const authString = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  const encodedAuth = Buffer.from(authString).toString("base64");

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  if (!tokenRes.ok) {
    console.error("Spotify token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(new URL("/login?error=invalid_code", req.url));
  }

  const tokenData = await tokenRes.json();
  const access_token = tokenData.access_token;
  const refresh_token = tokenData.refresh_token;

  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!profileRes.ok) {
    console.error("Spotify /me failed:", await profileRes.text());
    return NextResponse.redirect(
      new URL("/login?error=profile_fetch_failed", req.url)
    );
  }

  const profile = await profileRes.json();
  const userid = profile.id;

  // Create redirect to dashboard
  const response = NextResponse.redirect(
    new URL(`/dashboard/${userid}`, req.url)
  );

  // Set tokens + used code as cookies
  response.cookies.set("spotify_access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 3600,
  });
  response.cookies.set("spotify_refresh_token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("used_spotify_code", code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 5, // Code is short-lived
  });

  return response;
}
