import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log(req);

  // Wait 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return new Response(
    "This is the Apple to Spotify export API endpoint. Use it to transfer your playlists from Apple Music to Spotify."
  );
}
