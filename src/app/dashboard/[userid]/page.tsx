import { cookies } from "next/headers";
import SpotifyPlaylist from "@/lib/types/spotifyTypes";
import Playlist from "@/components/Playlist";
import {
  AppleMusicPlaylistsResponse,
  AppleMusicPlaylist,
} from "@/lib/types/appleTypes";
import Image from "next/image";

export default async function Page() {
  const cookieStore = await cookies();
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
    return <p>Error fetching Spotify playlists: {appleRes.statusText}</p>;
  }

  const applePlaylists: AppleMusicPlaylistsResponse = await appleRes.json();
  console.log("🍎 Apple Music playlists:", applePlaylists);

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

      <div className="w-full max-w-4xl mt-12">
        <h2 className="text-xl font-bold mb-4">Your Apple Music Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {applePlaylists.data.map((playlist: AppleMusicPlaylist) => {
            const artwork = playlist.attributes?.artwork;
            const imageUrl = artwork?.url
              ?.replace("{w}", "300")
              ?.replace("{h}", "300");

            return (
              <div
                key={playlist.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={playlist.attributes?.name || "Apple Playlist"}
                    className="rounded-md w-full h-auto mb-2"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <p className="text-center font-semibold">
                  {playlist.attributes?.name || "Untitled"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
