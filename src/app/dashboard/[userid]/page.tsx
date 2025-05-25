import { cookies } from "next/headers";
import SpotifyPlaylist from "@/lib/types/spotifyTypes";
// import Playlist from "@/components/Playlist";

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (!accessToken) {
    return <p>Error: No access token found. Please log in again.</p>;
  }

  // Fetch user's playlists
  const playlistsRes = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!playlistsRes.ok) {
    return <p>Error fetching playlists: {playlistsRes.statusText}</p>;
  }

  const playlistsData = await playlistsRes.json();
  const playlists: SpotifyPlaylist[] = playlistsData.items;

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-2xl font-bold">Welcome, User!</h1>
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* {playlists.map((playlist) => (
            <Playlist key={playlist.id} playlist={playlist} />
          ))} */}
          <></>
        </div>
      </div>
    </main>
  );
}
