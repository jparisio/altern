"use client";
import { useEffect } from "react";
import { useMusicStore } from "@/store/musicStore";

declare global {
  interface Window {
    MusicKit: any;
  }
}

export default function AppleMusicLogin() {
  const setUserToken = useMusicStore((state) => state.setUserToken);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js-cdn.music.apple.com/musickit/v1/musickit.js";
    script.async = true;
    document.body.appendChild(script);

    document.addEventListener("musickitloaded", () => {
      const music = window.MusicKit.configure({
        developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN,
        app: {
          name: "My Music App",
          build: "1.0.0",
        },
      });

      music.authorize().then((userToken: string) => {
        setUserToken(userToken);
        console.log("🎵 Music User Token saved in Zustand:", userToken);
      });
    });
  }, [setUserToken]);

  return <div>Apple Music Login Component</div>;
}
