import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tracksHref = body.playlistTracksHref;

  if (!tracksHref) {
    return new Response(
      JSON.stringify({ error: "Missing playlistTracksHref" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Fetch all tracks from Apple Music API
  const appleMusicToken = process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN; // your token here

  if (!appleMusicToken) {
    return new Response(
      JSON.stringify({ error: "Missing Apple Music auth token" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let allTracks = [];
  let url = tracksHref;

  // Example: fetch tracks (handle pagination if needed)
  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${appleMusicToken}` },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch tracks from Apple Music" }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    allTracks.push(...data.data);

    url = data.next || null; // check if Apple Music API uses `next` for pagination
  }

  // Now you have allTracks with full info for each song
  // Next: map these tracks to Spotify format, search and create a playlist on Spotify, etc.

  console.log("Fetched tracks:", allTracks.length);

  // For now just return a fake export ID to confirm success
  return new Response(
    JSON.stringify({
      exportId: "fake-export-id-123",
      tracksCount: allTracks.length,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
