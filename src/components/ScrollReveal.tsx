"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "top" | "bottom" | "left" | "right" | "zoom";
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
}

export default function ScrollReveal({
  children,
  direction = "bottom",
  delay = 0,
  duration = 0.6,
  className = "",
  distance = 60,
}: ScrollRevealProps) {
  const getInitial = () => {
    switch (direction) {
      case "top":
        return { opacity: 0, y: -distance };
      case "bottom":
        return { opacity: 0, y: distance };
      case "left":
        return { opacity: 0, x: -distance };
      case "right":
        return { opacity: 0, x: distance };
      case "zoom":
        return { opacity: 0, scale: 0.85, y: 20 };
      default:
        return { opacity: 0, y: distance };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Smooth natural spring curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
