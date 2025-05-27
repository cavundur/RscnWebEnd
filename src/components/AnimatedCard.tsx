"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";

interface AboutCardData {
  card_title: string;
  card_description: string;
}

export default function AnimatedCard({ card, index }: { card: AboutCardData; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ x: 100, opacity: 0 }}
      animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl transition-all hover:bg-white/20 aboutCard"
    >
      <h3 className="text-xl font-semibold mb-3 text-white">{card.card_title}</h3>
      <p className="text-gray-200 leading-relaxed">{card.card_description}</p>
    </motion.div>
  );
} 