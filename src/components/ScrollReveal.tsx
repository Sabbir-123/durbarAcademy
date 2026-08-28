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
  duration = 0.5,
  className = "",
  distance = 35,
}: ScrollRevealProps) {
  const getInitial = () => {
    switch (direction) {
      case "top":
        return { opacity: 0, y: -distance };
      case "bottom":
        return { opacity: 0, y: distance };
      case "left":
        return { opacity: 0, y: 25 };
      case "right":
        return { opacity: 0, y: 25 };
      case "zoom":
        return { opacity: 0, scale: 0.92, y: 15 };
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
      viewport={{ once: false, amount: 0.1 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Hardware accelerated cubic bezier curve
      }}
      className={`${className} transform-gpu will-change-transform`}
    >
      {children}
    </motion.div>
  );
}
