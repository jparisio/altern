"use client";
import { useState, useEffect, useRef } from "react";
import { useMusicStore } from "@/store/musicStore";

declare global {
  interface Window {
    MusicKit: MusicKitStatic;
  }
}

interface MusicKitStatic {
  configure: (config: {
    developerToken: string | undefined;
    app: { name: string; build: string };
  }) => MusicKitInstance;
}

interface MusicKitInstance {
  authorize: () => Promise<string>;
  // ... you can add other methods if needed
}

export default function AppleMusicLogin() {
  const userToken = useMusicStore((state) => state.userToken);
  const setUserToken = useMusicStore((state) => state.setUserToken);
  const [musicKitReady, setMusicKitReady] = useState(false);
  const musicKitInstance = useRef<MusicKitInstance | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js-cdn.music.apple.com/musickit/v1/musickit.js";
    script.async = true;
    document.body.appendChild(script);

    const onMusicKitLoaded = () => {
      // Configure and save the instance
      musicKitInstance.current = window.MusicKit.configure({
        developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN,
        app: {
          name: "My Music App",
          build: "1.0.0",
        },
      });
      setMusicKitReady(true);
    };

    document.addEventListener("musickitloaded", onMusicKitLoaded);
    return () => {
      document.removeEventListener("musickitloaded", onMusicKitLoaded);
    };
  }, []);

  const handleLogin = async () => {
    if (!musicKitReady || !musicKitInstance.current) return;
    try {
      const token = await musicKitInstance.current.authorize();
      setUserToken(token);
      console.log("🎵 Music User Token saved in Zustand:", token);
    } catch (error) {
      console.error("Authorization failed or popup blocked:", error);
    }
  };

  if (userToken) {
    return (
      <div className="flex items-center">
        <span className="text-white font-semibold">
          ✓ Apple Music logged in
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={!musicKitReady}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded shadow hover:shadow-lg transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Login with Apple Music
      </button>
      {!musicKitReady && <p>Loading Apple Music...</p>}
    </div>
  );
}
