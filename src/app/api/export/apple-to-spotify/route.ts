import { NextRequest } from "next/server";
import { getAppleMusicTracks } from "@/lib/appleMusic/fetchTracks";
import type { ExportTracksResponse } from "@/lib/types/appleTypes";
import { getAuthCookies } from "@/lib/utils/getCookies";

export async function POST(req: NextRequest) {
  const { playlistId }: { playlistId?: string } = await req.json();

  if (!playlistId) {
    return Response.json({ error: "Missing playlistId" }, { status: 400 });
  }

  const { appleUserToken, spotifyAccessToken } = await getAuthCookies();
  const appleDevToken = process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN;

  if (!appleUserToken || !appleDevToken || !spotifyAccessToken) {
    return Response.json(
      { error: "Missing Apple Music tokens" },
      { status: 401 }
    );
  }

  const tracks = await getAppleMusicTracks(
    playlistId,
    appleUserToken,
    appleDevToken
  );

  const responsePayload: ExportTracksResponse = {
    exportId: "fake-export-id-123",
    tracksCount: tracks.length,
    tracks,
  };

  return Response.json(responsePayload);
}
