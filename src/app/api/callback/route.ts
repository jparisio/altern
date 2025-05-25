import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json(
      { error: "Missing code from Spotify" },
      { status: 400 }
    );
  }

  const authString = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  const encodedAuth = Buffer.from(authString).toString("base64");

  // Exchange code for tokens
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
    const errorData = await tokenRes.json();
    return NextResponse.json({ error: errorData }, { status: tokenRes.status });
  }

  const { access_token, refresh_token } = await tokenRes.json();

  // Get user profile to find user ID
  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!profileRes.ok) {
    const errorData = await profileRes.json();
    return NextResponse.json(
      { error: errorData },
      { status: profileRes.status }
    );
  }

  const profile = await profileRes.json();
  const userid = profile.id;

  // Create response redirecting to /dashboard/[userid]
  const response = NextResponse.redirect(
    new URL(`/dashboard/${userid}`, req.url)
  );

  // Set HTTP-only, secure cookies for tokens (adjust domain & options as needed)
  // Secure: true requires HTTPS, so on localhost you might need false or use env flag
  response.cookies.set("spotify_access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour - match Spotify token expiry
  });

  response.cookies.set("spotify_refresh_token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
