"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function ExportPage() {
  const [musicKitInstance, setMusicKitInstance] =
    useState<MusicKit.MusicKitInstance | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract playlistId from the URL path
  const pathname = usePathname();
  const playlistId = pathname?.split("/").pop() || "";

  // Define the auth status change handler as a useCallback function
  const handleAuthChange = useCallback(() => {
    if (!musicKitInstance) return;

    setIsAuthorized(musicKitInstance.isAuthorized);
    if (musicKitInstance.isAuthorized) {
      setUserToken(musicKitInstance.musicUserToken);
    } else {
      setUserToken(null);
    }
  }, [musicKitInstance]);

  useEffect(() => {
    // Check if MusicKit is available
    if (typeof window === "undefined" || !window.MusicKit) {
      console.error(
        "MusicKit not found. Make sure Apple Music JS SDK is loaded."
      );
      setIsLoading(false);
      return;
    }

    try {
      // First, configure MusicKit (before getting an instance)
      window.MusicKit.configure({
        developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN!,
        app: {
          name: "Altern",
          build: "1.0.0",
        },
      });

      // Then get the instance
      const instance = window.MusicKit.getInstance();
      setMusicKitInstance(instance);
      setIsAuthorized(instance.isAuthorized);

      if (instance.isAuthorized) {
        setUserToken(instance.musicUserToken);
      }

      // Add event listener
      instance.addEventListener(
        "authorizationStatusDidChange",
        handleAuthChange
      );
    } catch (error) {
      console.error("Error initializing MusicKit:", error);
    } finally {
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      // MusicKitInstance does not support removeEventListener, so no cleanup needed here.
    };
  }, [handleAuthChange]);

  const handleAuthorize = async () => {
    if (!musicKitInstance) return;

    try {
      const token = await musicKitInstance.authorize();
      console.log("Authorization successful:", token);
    } catch (error) {
      console.error("Apple Music authorization failed:", error);
    }
  };

  if (isLoading) {
    return <div>Loading MusicKit...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-6">Export Playlist</h1>
      <p className="mb-4">
        Exporting Spotify playlist ID: <code>{playlistId}</code>
      </p>

      {isAuthorized ? (
        <div className="mb-4">
          <p>Authorized with Apple Music!</p>
          <button
            onClick={() => console.log("Start export process")}
            className="px-4 py-2 bg-green-500 text-white rounded mt-4"
          >
            Export to Apple Music
          </button>
        </div>
      ) : (
        <button
          onClick={handleAuthorize}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Sign in with Apple Music
        </button>
      )}
    </main>
  );
}
