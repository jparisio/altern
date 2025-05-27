import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type {
  AppleMusicTracksResponse,
  AppleMusicTrackData,
  ExportedTrack,
  ExportTracksResponse,
} from "@/lib/types/appleTypes";

export async function POST(req: NextRequest) {
  const body: { playlistId?: string } = await req.json();
  const playlistId = body.playlistId;

  if (!playlistId) {
    return new Response(JSON.stringify({ error: "Missing playlistId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cookieStore = await cookies();
  const appleUserToken = cookieStore.get("apple_music_token")?.value;
  const appleDevToken = process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN;

  if (!appleUserToken || !appleDevToken) {
    return new Response(
      JSON.stringify({
        error: "Missing Apple Music tokens. Please log in again.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const allTracks: ExportedTrack[] = [];
  let url:
    | string
    | null = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${appleDevToken}`,
        "Music-User-Token": appleUserToken,
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch Apple Music tracks" }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data: AppleMusicTracksResponse = await res.json();

    data.data.forEach((item: AppleMusicTrackData) => {
      const attributes = item.attributes;
      if (!attributes) return;

      const trackName = attributes.name || "Untitled";
      const durationMs = attributes.durationInMillis ?? 0;

      let artistNames: string[] = [];

      if (attributes.artistName) {
        artistNames = [attributes.artistName];
      } else if (attributes.artists && Array.isArray(attributes.artists)) {
        artistNames = attributes.artists.map((a) => a.name);
      } else if (
        attributes.artistNames &&
        Array.isArray(attributes.artistNames)
      ) {
        artistNames = attributes.artistNames;
      }

      allTracks.push({
        id: item.id,
        name: trackName,
        artists: artistNames,
        durationMs,
      });
    });

    url = data.next ?? data.links?.next ?? null;
  }

  const responsePayload: ExportTracksResponse = {
    exportId: "fake-export-id-123",
    tracksCount: allTracks.length,
    tracks: allTracks,
  };

  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
