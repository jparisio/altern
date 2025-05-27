import { getAuthCookies } from "@/lib/utils/getCookies";
import SpotifyPlaylist from "@/lib/types/spotifyTypes";
import Playlist from "@/components/SpotifyPlaylist";
import ApplePlaylist from "@/components/ApplePlaylist";
import {
  AppleMusicPlaylistsResponse,
  AppleMusicPlaylist,
} from "@/lib/types/appleTypes";
import FadeInText from "@/components/FadeInText";

export default async function Page({
  params,
}: {
  params: Promise<{ userid: string }>;
}) {
  const { appleUserToken, spotifyAccessToken } = await getAuthCookies();
  const appleDevToken = process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN;

  const { userid } = await params;

  if (!appleUserToken || !appleDevToken) {
    return <p>Error: Missing Apple Music tokens. Please log in again.</p>;
  }

  if (!spotifyAccessToken) {
    return <p>Error: No Spotify access token found. Please log in again.</p>;
  }

  // 🟢 Fetch Spotify playlists
  const spotifyRes = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${spotifyAccessToken}`,
    },
  });

  if (!spotifyRes.ok) {
    return <p>Error fetching Spotify playlists: {spotifyRes.statusText}</p>;
  }

  const spotifyPlaylistData = await spotifyRes.json();
  const SpotifyPlaylists: SpotifyPlaylist[] = spotifyPlaylistData.items;

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
  // console.log("🍎 Apple Music playlists:", applePlaylists);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 relative">
      <div className="flex flex-col items-center justify-center mb-10">
        <FadeInText className="text-6xl ">Welcome, {userid}!</FadeInText>
      </div>

      <div className="w-full max-w-4xl">
        <FadeInText className="text-4xl font-bold mb-4">
          Your Spotify Playlists
        </FadeInText>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SpotifyPlaylists.map((playlist) => (
            <Playlist key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl mt-12 ">
        <FadeInText className="text-4xl font-bold mb-4">
          Your Apple Music Playlists
        </FadeInText>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {applePlaylists.data.map((playlist: AppleMusicPlaylist) => (
            <ApplePlaylist key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>
    </main>
  );
}
