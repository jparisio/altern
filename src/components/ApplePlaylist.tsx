"use client";

import { AppleMusicPlaylist } from "@/lib/types/appleTypes";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplePlaylist({
  playlist,
}: {
  playlist: AppleMusicPlaylist;
}) {
  const artwork = playlist.attributes?.artwork;
  const imageUrl = artwork?.url?.replace("{w}", "300")?.replace("{h}", "300");
  const [modal, setModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export/apple-to-spotify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: playlist.id,
          playlistName: playlist.attributes?.name || "Untitled",
          playlistDescription: playlist.attributes?.description || "",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/dashboard/export-status`);
      } else {
        console.error("Export failed:", data.error);
        alert("Failed to export playlist. Please try again later.");
        setIsExporting(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again.");
      setIsExporting(false);
    }
  };

  return (
    <>
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg  flex flex-col h-full border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="relative w-full pt-[100%] bg-gray-100 dark:bg-gray-700">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={playlist.attributes?.name || "Apple Playlist"}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover absolute inset-0 bg-gray-200 dark:bg-gray-700"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <Image
                src={"/music-note.svg"}
                alt="music-note"
                width={64}
                height={64}
              />
            </div>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-semibold text-gray-800 dark:text-white text-base mb-1 line-clamp-1">
            {playlist.attributes?.name || "Untitled"}
          </h3>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            className="block w-full py-2 bg-blue-500 text-white text-sm font-medium text-center hover:bg-blue-600 transition-colors rounded-b"
            onClick={() => setModal(true)}
          >
            EXPORT
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {modal && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => !isExporting && setModal(false)} // Optional: click to close
            />

            {/* Modal container */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50"
              initial={{ y: 100, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
              }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Export Playlist</h2>
                <p className="mb-4">
                  Exporting the playlist{" "}
                  <strong>{playlist.attributes?.name || "Untitled"}</strong> to
                  Spotify will create a new playlist in your Spotify library.
                </p>
                {isExporting && (
                  <span className="block text-xs text-gray-500 mb-2">
                    This may take a minute…
                  </span>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExport}
                  disabled={isExporting}
                  className={`block w-full py-2 text-white text-sm font-medium text-center rounded transition-colors ${
                    isExporting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isExporting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Exporting...</span>
                    </div>
                  ) : (
                    "Confirm Export"
                  )}
                </motion.button>
                {!isExporting && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-medium text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors rounded"
                    onClick={() => setModal(false)}
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
