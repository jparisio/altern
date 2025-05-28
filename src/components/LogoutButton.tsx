"use client";
import { motion } from "framer-motion";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
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
    exit: {
      opacity: 0,
      backgroundColor: "green",
      transition: {
        duration: 0.75,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  return (
    <motion.div
      key="spotify-button"
      initial="initial"
      animate="animate"
      variants={buttonVariants}
    >
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 text-white rounded bg-red-500 hover:bg-red-600 absolute top-4 right-4"
      >
        Logout
      </button>
    </motion.div>
  );
}
