"use client";
import { useState, useEffect } from "react";
import SpotifyAuthButton from "@/components/SpotifyAuthButton";
import { AnimatePresence, motion } from "framer-motion";

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
  const [loading, setLoading] = useState(true);

  // Check for apple_music_token cookie on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Load MusicKit
    window.MusicKit.configure({
      developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN!,
      app: {
        name: "PlaylistXfer",
        build: "1.0",
      },
    });
    // Check for cookie
    setIsAuthorized(document.cookie.includes("apple_music_token"));
    setLoading(false);
  }, []);

  const handleAppleLogin = async () => {
    const music = window.MusicKit.getInstance();
    const token = await music.authorize();
    console.log("Apple Music user token:", token);
    // Send token to your server
    await fetch("/api/auth/apple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setIsAuthorized(true);
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.76, 0, 0.24, 1],
      },
    },
    exit: {
      opacity: 0,
      backgroundColor: "green",
      transition: {
        duration: 0.75,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={buttonVariants}
      className="flex flex-col items-center justify-center"
    >
      <AnimatePresence mode="wait">
        {loading ? null : !isAuthorized ? (
          <motion.button
            key="apple-button"
            onClick={handleAppleLogin}
            className="mt-4 px-4 py-2 text-white rounded bg-blue-500 hover:bg-blue-600"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={buttonVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Connect Apple Music
          </motion.button>
        ) : (
          <SpotifyAuthButton />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
