"use client";

import React, { useEffect, useState } from "react";

interface MusicKitInstance {
  isAuthorized: boolean;
  musicUserToken: string;
  authorize(): Promise<string>;
  api: {
    music(endpoint: string): Promise<{ data: Playlist[] }>;
  };
}

interface Playlist {
  id: string;
  attributes: {
    name: string;
  };
}

declare global {
  interface Window {
    MusicKit: {
      getInstance(): MusicKitInstance;
      configure(config: {
        developerToken: string;
        app: { name: string; build: string };
      }): void;
    };
  }
}

export default function AppleMusicAuth() {
  const [musicKit, setMusicKit] = useState<MusicKitInstance | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a separate useEffect for mounting state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only run MusicKit logic after component is mounted on client
  useEffect(() => {
    if (!mounted) return;

    if (!window.MusicKit) {
      setError("Apple Music SDK not loaded");
      return;
    }

    try {
      window.MusicKit.configure({
        developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN!,
        app: {
          name: "Altern",
          build: "1.0.0",
        },
      });

      const instance = window.MusicKit.getInstance();
      setMusicKit(instance);
    } catch (err) {
      console.error("Error configuring MusicKit:", err);
      setError(`Error: something bullshit`);
    }
  }, [mounted]);

  const handleAuthorize = async () => {
    if (!musicKit) return;
    try {
      await musicKit.authorize();
      const res = await musicKit.api.music("v1/me/library/playlists");
      setPlaylists(res.data);
    } catch (err) {
      console.error("Apple Music operation failed:", err);
      setError(`Error: something bullshit`);
    }
  };

  // Don't render anything on server or during first client render
  if (!mounted) {
    return null; // Return empty on server side
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 text-black dark:text-white rounded">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <button
        onClick={handleAuthorize}
        className="px-4 py-2 bg-black text-white rounded mb-4 flex items-center justify-center hover:bg-gray-700 disabled:opacity-50"
        disabled={!musicKit}
      >
        Sign in & Load Playlists
      </button>

      {playlists && (
        <ul className="space-y-2">
          {playlists.map((playlist) => (
            <li key={playlist.id} className="border-b pb-1">
              {playlist.attributes.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
