"use client";
import { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    window.location.href = `/api/callback${window.location.search}`;
  }, []);

  return (
    <p className="flex items-center justify-center text-3xl h-screen">
      Redirecting via Spotify...
    </p>
  );
}
//nice
