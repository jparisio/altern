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

  const contentType = tokenRes.headers.get("content-type") || "";
  const raw = await tokenRes.text();

  if (!tokenRes.ok) {
    let errorBody;
    try {
      errorBody = contentType.includes("application/json")
        ? JSON.parse(raw)
        : { message: raw };
    } catch (e) {
      console.error(e);
      errorBody = { message: raw };
    }
    console.error("Spotify token exchange failed:", errorBody);
    return NextResponse.json({ error: errorBody }, { status: tokenRes.status });
  }

  let tokenJson;
  try {
    tokenJson = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse successful response as JSON:", raw);
    console.error(e);
    return NextResponse.json(
      { error: "Invalid token response format", raw },
      { status: 500 }
    );
  }

  const access_token = tokenJson.access_token;
  const refresh_token = tokenJson.refresh_token;

  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!profileRes.ok) {
    const profileError = await profileRes.json().catch(() => ({
      message: "Failed to parse profile response",
    }));
    return NextResponse.json(
      { error: profileError },
      { status: profileRes.status }
    );
  }

  const profile = await profileRes.json();
  const userid = profile.id;

  // Redirect response
  const response = NextResponse.redirect(
    new URL(`/dashboard/${userid}`, req.url)
  );

  // --- Clear old cookies before setting new ones ---
  response.cookies.delete("spotify_access_token");
  response.cookies.delete("spotify_refresh_token");

  // Set new cookies
  response.cookies.set("spotify_access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  response.cookies.set("spotify_refresh_token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // --- Set cache-control headers to prevent caching ---
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}
