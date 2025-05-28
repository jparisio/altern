"use client";
import { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    window.location.href = `/api/callback${window.location.search}`;
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl font-bold">Redirecting via Spotify...</p>
    </div>
  );
}
//nice
