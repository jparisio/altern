import { NextRequest } from "next/server";
import { getAppleMusicTracks } from "@/lib/appleMusic/fetchTracks";
import type { ExportTracksResponse } from "@/lib/types/appleTypes";
import { getAuthCookies } from "@/lib/utils/getCookies";
// import SpotifyPlaylist from "@/lib/types/spotifyTypes";
import type { CreatePlaylistOptions } from "@/lib/types/spotifyTypes";
import { createSpotifyPlaylist } from "@/lib/spotify/createPlaylists";

export async function POST(req: NextRequest) {
  const {
    playlistId,
    playlistName,
    playlistDescription,
  }: {
    playlistId?: string;
    playlistName?: string;
    playlistDescription?: string;
  } = await req.json();

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

  // GRAB APPLE MUSIC TRACKS
  // Fetch tracks from the specified Apple Music playlist

  const tracks = await getAppleMusicTracks(
    playlistId,
    appleUserToken,
    appleDevToken
  );

  //GET SPOTIFY USER ID
  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${spotifyAccessToken}`,
    },
  });

  if (!profileRes.ok) {
    return Response.json(
      { error: "Failed to fetch Spotify user profile" },
      { status: profileRes.status }
    );
  }

  const profile = await profileRes.json();
  const spotifyUserId = profile.id;

  // CREATE SPOTIFY PLAYLIST
  // Define the options for creating a new Spotify playlist

  const playlistOptions: CreatePlaylistOptions = {
    name: playlistName || "Apple Music Export",
    description: playlistDescription || "Exported from Apple Music",
    isPublic: false,
  };
  const newPlaylist = await createSpotifyPlaylist(
    spotifyUserId, // Replace with actual Spotify user ID
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
