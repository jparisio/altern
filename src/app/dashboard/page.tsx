"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (token) {
      setAccessToken(token);

      // Save tokens in localStorage
      localStorage.setItem("spotify_access_token", token);
      if (refreshToken)
        localStorage.setItem("spotify_refresh_token", refreshToken);

      // Remove tokens from URL for clean UX
      router.replace("/dashboard");
    } else {
      // No token found, try to get from localStorage
      const storedToken = localStorage.getItem("spotify_access_token");
      if (storedToken) setAccessToken(storedToken);
      else router.replace("/"); // redirect to login or home if no token
    }
  }, [searchParams, router]);

  if (!accessToken) return <p>Loading...</p>;

  return (
    <div>
      <h1>Spotify Dashboard</h1>
      <p>Access Token: {accessToken.substring(0, 20)}...</p>
      {/* You can add Spotify API calls here using the token */}
    </div>
  );
}
