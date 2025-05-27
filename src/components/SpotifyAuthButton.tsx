"use client";
export default function SpotifyAuthButton() {
  const handleClick = () => {
    window.location.href = "/api/login";
  };
  return (
    <button
      onClick={handleClick}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      Auth Spotify
    </button>
  );
}
