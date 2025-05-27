import { ExportedTrack } from "@/lib/types/appleTypes";
import { addSpotifyTrack } from "@/lib/spotify/addSpotifyTrack";
import { searchSpotifyTrack } from "@/lib/spotify/searchTracks";

export async function exportToSpotifyClientSide({
  tracks,
  playlistId,
  accessToken,
  onProgress,
}: {
  tracks: ExportedTrack[];
  playlistId: string;
  accessToken: string;
  onProgress?: (status: { matched: number; failed: number }) => void;
}) {
  const matchedURIs: string[] = [];
  const failedMatches: string[] = [];

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const query = `${track.name} ${track.artists[0]}`;
    const result = await searchSpotifyTrack(query, accessToken);

    if (result?.uri) {
      matchedURIs.push(result.uri);
    } else {
      failedMatches.push(`${track.name} - ${track.artists.join(", ")}`);
    }

    if (onProgress) {
      onProgress({
        matched: matchedURIs.length,
        failed: failedMatches.length,
      });
    }

    await new Promise((r) => setTimeout(r, 100)); // basic rate-limit safety
  }

  await addSpotifyTrack(playlistId, matchedURIs, accessToken);

  return {
    matched: matchedURIs.length,
    failed: failedMatches.length,
    failedTracks: failedMatches,
  };
}
