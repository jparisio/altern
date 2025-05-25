// app/dashboard/[userId]/page.tsx
import { cookies } from "next/headers";
import { SpotifyPlaylist } from "@/lib/types/spotifyTypes";

export default async function UserDashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (!accessToken) {
    return <p>Error: No access token found. Please log in again.</p>;
  }

  // Fetch user's Spotify profile
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    return <p>Error fetching profile: {res.statusText}</p>;
  }

  const profile = await res.json();

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
        <h1 className="text-2xl font-bold">Welcome, {profile.display_name}!</h1>
        <p>Spotify ID: {profile.id}</p>
        <p>Email: {profile.email}</p>
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="border rounded-lg p-4 flex flex-col"
            >
              {playlist.images && playlist.images[0] && (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-medium">{playlist.name}</h3>
              <p className="text-sm text-gray-600">
                {playlist.tracks.total} tracks
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
