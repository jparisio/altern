import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("Received POST body:", body);

  // Simulate some async work
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!body.playlistId) {
    return new Response(JSON.stringify({ error: "Missing playlistId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Simulate returning an export ID
  return new Response(JSON.stringify({ exportId: "fake-export-id-123" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
