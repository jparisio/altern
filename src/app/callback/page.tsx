"use client";
import { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    window.location.href = `/api/callback${window.location.search}`;
  }, []);

  return <p>Redirecting via Spotify...</p>;
}
//nice
