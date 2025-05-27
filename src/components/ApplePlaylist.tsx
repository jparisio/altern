"use client";

import { AppleMusicPlaylist } from "@/lib/types/appleTypes";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ApplePlaylist({
  playlist,
}: {
  playlist: AppleMusicPlaylist;
}) {
  const artwork = playlist.attributes?.artwork;
  const imageUrl = artwork?.url?.replace("{w}", "300")?.replace("{h}", "300");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full border border-gray-200 dark:border-gray-700">
      <div className="relative w-full pt-[100%] bg-gray-100 dark:bg-gray-700">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={playlist.attributes?.name || "Apple Playlist"}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover absolute inset-0"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 16.5c1.38 0 2.5-1.12 2.5-2.5 0-1.38-1.12-2.5-2.5-2.5-1.38 0-2.5 1.12-2.5 2.5 0 1.38 1.12 2.5 2.5 2.5z" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-gray-800 dark:text-white text-base mb-1 line-clamp-1">
          {playlist.attributes?.name || "Untitled"}
        </h3>
        {/* Apple Music playlists don’t have track count by default, so omit or add if available */}
      </div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link href={`/export/apple/${playlist.id}`}>
          <a className="block w-full py-2 bg-blue-500 text-white text-sm font-medium text-center hover:bg-blue-600 transition-colors rounded-b">
            EXPORT
          </a>
        </Link>
      </motion.div>
    </div>
  );
}
