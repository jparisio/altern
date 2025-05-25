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

  useEffect(() => {
    if (typeof window === "undefined" || !window.MusicKit) return;

    window.MusicKit.configure({
      developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN!,
      app: {
        name: "Altern",
        build: "1.0.0",
      },
    });

    const instance = window.MusicKit.getInstance();
    setMusicKit(instance);
  }, []);

  const handleAuthorize = async () => {
    if (!musicKit) return;
    await musicKit.authorize();
    const res = await musicKit.api.music("v1/me/library/playlists");
    setPlaylists(res.data);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-black text-black dark:text-white rounded">
      <button
        onClick={handleAuthorize}
        className="px-4 py-2 bg-black text-white rounded mb-4"
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
