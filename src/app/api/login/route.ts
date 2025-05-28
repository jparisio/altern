import { NextResponse } from "next/server";
import queryString from "query-string";

export async function GET() {
  const scopes = ["playlist-modify-public", "playlist-modify-private"];

  const queryParams = queryString.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes.join(" "),
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    show_dialog: "true", // forces re-login
  });

  const redirectUrl = `https://accounts.spotify.com/authorize?${queryParams}`;

  const response = NextResponse.redirect(redirectUrl);

  // Clear any old tokens
  response.cookies.set("spotify_access_token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("spotify_refresh_token", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
