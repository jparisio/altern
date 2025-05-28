"use client";
import { motion } from "framer-motion";
import React from "react";

export default function FadeInText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const textVariants = {
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
    <motion.div
      initial="initial"
      animate="animate"
      variants={textVariants}
      className={`${className} text-center`}
    >
      {children}
    </motion.div>
  );
}
