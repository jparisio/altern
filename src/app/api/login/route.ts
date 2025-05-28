import { NextResponse } from "next/server";
import queryString from "query-string";

export async function GET() {
  const scopes = ["playlist-modify-public", "playlist-modify-private"];

  const queryParams = queryString.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes.join(" "),
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    show_dialog: "true",
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${queryParams}`
  );
}
