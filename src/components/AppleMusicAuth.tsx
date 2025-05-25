"use client";

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    MusicKit: {
      getInstance(): MusicKit.MusicKitInstance;
      configure(config: {
        developerToken: string;
        app: { name: string; build: string };
      }): void;
      addEventListener(event: string, callback: () => void): void;
    };
  }

  namespace MusicKit {
    interface MusicKitInstance {
      isAuthorized: boolean;
      musicUserToken: string;
      authorize(): Promise<string>;
      addEventListener(event: string, callback: () => void): void;
    }
  }
}

export default function AppleMusicAuth() {
  const [musicKitInstance, setMusicKitInstance] =
    useState<MusicKit.MusicKitInstance | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).MusicKit) {
      const musicKit = (window as any).MusicKit.getInstance();

      if (!musicKit.isAuthorized) {
        musicKit.configure({
          developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN!,
          app: {
            name: "Altern",
            build: "1.0.0",
          },
        });
      }

      setMusicKitInstance(musicKit);
      setIsAuthorized(musicKit.isAuthorized);

      // Listen for authorization change
      musicKit.addEventListener("authorizationStatusDidChange", () => {
        setIsAuthorized(musicKit.isAuthorized);
        if (musicKit.isAuthorized) {
          setUserToken(musicKit.musicUserToken);
        } else {
          setUserToken(null);
        }
      });
    }
  }, []);

  const handleAuthorize = async () => {
    if (!musicKitInstance) return;
    try {
      await musicKitInstance.authorize();
      setIsAuthorized(true);
      setUserToken(musicKitInstance.musicUserToken);
    } catch (error) {
      console.error("Apple Music authorization failed:", error);
    }
  };

  return (
    <div>
      {isAuthorized ? (
        <p>
          Authorized! Your user token: <code>{userToken}</code>
        </p>
      ) : (
        <button
          onClick={handleAuthorize}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Sign in with Apple Music
        </button>
      )}
    </div>
  );
}
