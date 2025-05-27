"use client";
import { useState, useEffect } from "react";
import SpotifyAuthButton from "@/components/SpotifyAuthButton";

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
  getInstance: () => MusicKitInstance;
}

interface MusicKitInstance {
  authorize: () => Promise<string>;
}

export default function AppleAuthButton() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load MusicKit
    window.MusicKit.configure({
      developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN!, // Set via .env
      app: {
        name: "PlaylistXfer",
        build: "1.0",
      },
    });
  }, []);

  const handleAppleLogin = async () => {
    const music = window.MusicKit.getInstance();
    const token = await music.authorize(); // Triggers Apple sign-in

    console.log("Apple Music user token:", token);
    setIsAuthorized(true);

    // Send token to your server
    await fetch("/api/auth/apple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  };

  return (
    <>
      <button
        onClick={handleAppleLogin}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {isAuthorized ? "Apple Music Authorized 🎶" : "Connect Apple Music"}
      </button>

      {/* Only show Spotify button after Apple Music is authorized */}
      {isAuthorized && <SpotifyAuthButton />}
    </>
  );
}
