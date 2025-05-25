// app/dashboard/[userId]/page.tsx
import { cookies } from "next/headers";
import { SpotifyPlaylist } from "@/lib/types/spotifyTypes";
import Image from "next/image";

export default async function UserDashboardPage({
  params,
}: {
  params: { userid: string };
}) {
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
        <h1 className="text-2xl font-bold">Welcome, {params.userid}!</h1>
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full border border-gray-200 dark:border-gray-700"
            >
              <div className="relative w-full pt-[100%] bg-gray-100 dark:bg-gray-700">
                {playlist.images && playlist.images[0] ? (
                  <Image
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover absolute inset-0"
                    unoptimized // Helps with Spotify's image hosting
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 16.5c1.38 0 2.5-1.12 2.5-2.5 0-1.38-1.12-2.5-2.5-2.5-1.38 0-2.5 1.12-2.5 2.5 0 1.38 1.12 2.5 2.5 2.5z" />
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold text-gray-800 dark:text-white text-base mb-1 line-clamp-1">
                  {playlist.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-auto">
                  {playlist.tracks.total} tracks
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
