import { NextRequest } from "next/server";
import { getAppleMusicTracks } from "@/lib/appleMusic/fetchTracks";
import type { ExportTracksResponse } from "@/lib/types/appleTypes";
import { getAuthCookies } from "@/lib/utils/getCookies";
// import SpotifyPlaylist from "@/lib/types/spotifyTypes";
import type { CreatePlaylistOptions } from "@/lib/types/spotifyTypes";
import { createSpotifyPlaylist } from "@/lib/spotify/createPlaylists";

export async function POST(req: NextRequest) {
  const { playlistId }: { playlistId?: string } = await req.json();
  const { playlistName }: { playlistName?: string } = await req.json();
  const { playlistDescription }: { playlistDescription?: string } =
    await req.json();

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

  const playlistOptions: CreatePlaylistOptions = {
    name: playlistName || "Apple Music Export",
    description: playlistDescription || "Exported from Apple Music",
    isPublic: false,
  };
  const newPlaylist = createSpotifyPlaylist(
    "spotify-user-id", // Replace with actual Spotify user ID
    spotifyAccessToken,
    playlistOptions
  );

  console.log("Created Spotify playlist:", newPlaylist);

  const responsePayload: ExportTracksResponse = {
    exportId: "fake-export-id-123",
    tracksCount: tracks.length,
    tracks,
  };

  return Response.json(responsePayload);
}
