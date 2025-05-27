import { cookies } from "next/headers";

export async function getAuthCookies() {
  const cookieStore = await cookies();

  const appleUserToken = cookieStore.get("apple_music_token")?.value ?? null;
  const spotifyAccessToken =
    cookieStore.get("spotify_access_token")?.value ?? null;

  return {
    appleUserToken,
    spotifyAccessToken,
  };
}
