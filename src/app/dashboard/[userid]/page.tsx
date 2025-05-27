"use client";

import { cookies } from "next/headers";
import SpotifyPlaylist from "@/lib/types/spotifyTypes";
import Playlist from "@/components/Playlist";
import { AppleMusicPlaylist } from "@/lib/types/appleTypes";

export default async function Page() {
  const cookieStore = await cookies(); // don't need await
  const accessToken = cookieStore.get("spotify_access_token")?.value;
  const appleUserToken = cookieStore.get("apple_music_token")?.value;
  const appleDevToken = process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN;

  if (!appleUserToken || !appleDevToken) {
    return <p>Error: Missing Apple Music tokens. Please log in again.</p>;
  }

  if (!accessToken) {
    return <p>Error: No Spotify access token found. Please log in again.</p>;
  }

  // 🟢 Fetch Spotify playlists
  const playlistsRes = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!playlistsRes.ok) {
    return <p>Error fetching Spotify playlists: {playlistsRes.statusText}</p>;
  }

  const playlistsData = await playlistsRes.json();
  const playlists: SpotifyPlaylist[] = playlistsData.items;

  // 🍎 Fetch Apple Music playlists (user library playlists)
  const appleRes = await fetch(
    "https://api.music.apple.com/v1/me/library/playlists",
    {
      headers: {
        Authorization: `Bearer ${appleDevToken}`,
        "Music-User-Token": appleUserToken,
      },
    }
  );

  if (!appleRes.ok) {
    console.error("Failed to fetch Apple playlists", await appleRes.text());
  } else {
    const applePlaylists: AppleMusicPlaylist = await appleRes.json();
    console.log("🍎 Apple Music playlists:", applePlaylists);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-2xl font-bold">Welcome, User!</h1>
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Your Spotify Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <Playlist key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>
    </main>
  );
}
