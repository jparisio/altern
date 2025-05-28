import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const usedCode = req.cookies.get("used_spotify_code")?.value;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
  }

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
    const contentType = tokenRes.headers.get("content-type");
    let errorMessage;

    if (contentType && contentType.includes("application/json")) {
      const errorJson = await tokenRes.json();
      errorMessage = errorJson;
    } else {
      const errorText = await tokenRes.text();
      errorMessage = { message: errorText };
    }

    console.error("Spotify token exchange failed:", errorMessage);
    return NextResponse.redirect(new URL("/login?error=invalid_code", req.url));
  }

  let access_token, refresh_token;
  try {
    const json = await tokenRes.json();
    access_token = json.access_token;
    refresh_token = json.refresh_token;
  } catch (err) {
    const text = await tokenRes.text();
    console.error("Unexpected token exchange response (not JSON):", text);
    console.error("Error details:", err);
    return NextResponse.redirect(
      new URL("/login?error=invalid_token_response", req.url)
    );
  }

  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!profileRes.ok) {
    let profileError;
    try {
      profileError = await profileRes.json();
    } catch {
      const text = await profileRes.text();
      profileError = { message: `Non-JSON response: ${text}` };
    }
    console.error("Spotify /me profile fetch failed:", profileError);
    return NextResponse.redirect(
      new URL("/login?error=profile_fetch_failed", req.url)
    );
  }

  const profile = await profileRes.json();
  const userid = profile.id;

  const response = NextResponse.redirect(
    new URL(`/dashboard/${userid}`, req.url)
  );

  // Set tokens
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

  // Set code as used
  response.cookies.set("used_spotify_code", code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 5, // 5 minutes
  });

  return response;
}
