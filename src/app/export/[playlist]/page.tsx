"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AppleMusicAuth from "@/components/AppleMusicAuth";
import Script from "next/script";

export default function ExportPage() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [userToken, setUserToken] = useState<string | null>(null);

  // Extract playlistId from the URL path
  const pathname = usePathname();
  const playlistId = pathname?.split("/").pop() || "";

  // Handle when auth is successful
  const handleAuthSuccess = (token: string) => {
    setUserToken(token);
    console.log("Successfully authenticated with Apple Music!");
  };

  // Start the export process
  const handleExport = async () => {
    if (!userToken || !playlistId) return;

    setIsExporting(true);
    setExportStatus("Fetching Spotify playlist tracks...");

    try {
      // 1. Fetch Spotify playlist tracks (implement this API)
      const response = await fetch(`/api/spotify/playlist/${playlistId}`);
      const data = await response.json();

      setExportStatus(
        `Found ${data.tracks.length} tracks. Creating Apple Music playlist...`
      );

      // 2. Send tracks and Apple Music token to backend to create playlist
      const exportResponse = await fetch("/api/apple/create-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tracks: data.tracks,
          playlistName: data.name,
          userToken: userToken,
        }),
      });

      const result = await exportResponse.json();

      if (result.success) {
        setExportStatus(`Success! Playlist created in Apple Music.`);
      } else {
        setExportStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Load Apple Music JS SDK */}
      <Script
        src="https://js-cdn.music.apple.com/musickit/v3/musickit.js"
        onLoad={() => setIsSDKLoaded(true)}
      />

      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-6">Export Playlist</h1>
        <p className="mb-4">
          Exporting Spotify playlist ID: <code>{playlistId}</code>
        </p>

        {!isSDKLoaded ? (
          <p>Loading Apple Music SDK...</p>
        ) : (
          <>
            {!userToken ? (
              <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="mb-4">First, connect to Apple Music:</p>
                <AppleMusicAuth onAuthSuccess={handleAuthSuccess} />
              </div>
            ) : (
              <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg w-full max-w-md">
                <p className="text-green-500 mb-4">
                  ✓ Connected to Apple Music
                </p>

                {isExporting ? (
                  <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                    <p>{exportStatus}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleExport}
                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md font-medium hover:from-pink-600 hover:to-purple-700 transition-colors"
                  >
                    Export to Apple Music
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
