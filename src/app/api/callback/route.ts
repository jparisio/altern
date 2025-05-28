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
    const errorText = await tokenRes.text();
    console.error("Spotify token exchange failed:", errorText);
    return NextResponse.redirect(new URL("/login?error=invalid_code", req.url));
  }

  const tokenData = await tokenRes.json();
  const access_token = tokenData.access_token;
  const refresh_token = tokenData.refresh_token;

  // Debug: Log token info
  console.log("Access token received:", access_token ? "Yes" : "No");
  console.log("Token scope:", tokenData.scope);

  if (!access_token) {
    console.error("No access token in response:", tokenData);
    return NextResponse.redirect(new URL("/login?error=no_token", req.url));
  }

  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!profileRes.ok) {
    const errorText = await profileRes.text();
    console.error("Spotify /me failed:", {
      status: profileRes.status,
      statusText: profileRes.statusText,
      error: errorText,
      token: access_token?.substring(0, 20) + "...", // Log partial token for debugging
    });

    // Return more specific error based on status
    if (profileRes.status === 401) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", req.url)
      );
    } else if (profileRes.status === 403) {
      return NextResponse.redirect(
        new URL("/login?error=insufficient_scope", req.url)
      );
    } else {
      return NextResponse.redirect(
        new URL("/login?error=profile_fetch_failed", req.url)
      );
    }
  }

  const profile = await profileRes.json();
  const userid = profile.id;

  console.log("Profile fetched successfully for user:", userid);

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

  if (refresh_token) {
    response.cookies.set("spotify_refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  response.cookies.set("used_spotify_code", code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 5,
  });

  return response;
}
