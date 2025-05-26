"use client";
import { useState, useEffect } from "react";

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

export default function AppleMusicLogin() {
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

    // Optional: redirect or trigger app logic
    // window.location.href = "/dashboard/apple";
  };

  return (
    <button
      onClick={handleAppleLogin}
      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
    >
      {isAuthorized ? "Authorized 🎶" : "Connect Apple Music"}
    </button>
  );
}
