"use client";
import { motion } from "framer-motion";
export default function SpotifyAuthButton() {
  const handleClick = () => {
    window.location.href = "/api/login";
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
  };

  return (
    <motion.button
      initial="initial"
      animate="animate"
      variants={buttonVariants}
      onClick={handleClick}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      Connect to Spotify
    </motion.button>
  );
}
