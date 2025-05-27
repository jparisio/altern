export async function addSpotifyTrack(
  playlistId: string,
  uris: string[],
  accessToken: string
) {
  const chunks = Array.from({ length: Math.ceil(uris.length / 100) }, (_, i) =>
    uris.slice(i * 100, i * 100 + 100)
  );

  for (const chunk of chunks) {
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: chunk }),
      }
    );

    if (!res.ok) {
      console.error("Failed to add chunk:", await res.json());
      break; // or continue if you want partial success
    }

    await new Promise((r) => setTimeout(r, 100)); // Small delay to be safe
  }
}
