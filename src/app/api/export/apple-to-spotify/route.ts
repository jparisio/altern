import { NextRequest } from "next/server";

export default function GET(req: NextRequest) {
  console.log(req);
  return new Response(
    "This is the Apple to Spotify export API endpoint. Use it to transfer your playlists from Apple Music to Spotify."
  );
}
