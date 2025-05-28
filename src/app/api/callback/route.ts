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

  let access_token: string;
  let refresh_token: string;

  try {
    const contentType = tokenRes.headers.get("content-type");

    if (!tokenRes.ok) {
      const errorBody = contentType?.includes("application/json")
        ? await tokenRes.json()
        : { message: await tokenRes.text() };

      console.error("Spotify token exchange failed:", errorBody);
      return NextResponse.json(
        { error: errorBody },
        { status: tokenRes.status }
      );
    }

    // ✅ Parse only once
    if (!contentType?.includes("application/json")) {
      const body = await tokenRes.text();
      console.error("Spotify responded with unexpected format:", body);
      return NextResponse.json(
        { error: "Unexpected token response", body },
        { status: 500 }
      );
    }

    const json = await tokenRes.json();
    access_token = json.access_token;
    refresh_token = json.refresh_token;
  } catch (err) {
    console.error("Unexpected error parsing token response:", err);
    return NextResponse.json(
      { error: "Error parsing token response", details: err },
      { status: 500 }
    );
  }

  // 🎯 Get user profile
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

  const response = NextResponse.redirect(
    new URL(`/dashboard/${userid}`, req.url)
  );

  response.cookies.set("spotify_access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  response.cookies.set("spotify_refresh_token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
