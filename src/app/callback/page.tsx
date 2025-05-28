"use client";
import { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    window.location.href = `/api/callback${window.location.search}`;
  }, []);

  return (
    <p className="flex align-center justify-center text-6xl">
      Redirecting via Spotify...
    </p>
  );
}
//nice
