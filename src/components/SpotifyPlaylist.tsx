"use client";

import Link from "next/link";
import SpotifyPlaylist from "@/lib/types/spotifyTypes";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Playlist({ playlist }: { playlist: SpotifyPlaylist }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg  flex flex-col h-full border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="relative w-full pt-[100%] bg-gray-100 dark:bg-gray-700">
        {playlist.images && playlist.images[0] ? (
          <Image
            src={playlist.images[0].url}
            alt={playlist.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover absolute inset-0"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <Image
              src={"/music-note.svg"}
              alt="music-note"
              className="object-cover absolute inset-0 bg-gray-200 dark:bg-gray-700"
            />
          </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-gray-800 dark:text-white text-base mb-1 line-clamp-1">
          {playlist.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-auto">
          {playlist.tracks.total} tracks
        </p>
      </div>
      {/* <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link href={`/export/${playlist.id}`}>
          <a className="block w-full py-2 bg-blue-500 text-white text-sm font-medium text-center hover:bg-blue-600 rounded-b">
            EXPORT
          </a>
        </Link>
      </motion.div> */}
    </motion.div>
  );
}
