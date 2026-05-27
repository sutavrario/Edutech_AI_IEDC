"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  {
    text: "Learning gives creativity, creativity leads to thinking, thinking provides knowledge, knowledge makes you great.",
    author: "A. P. J. Abdul Kalam"
  },
  {
    text: "Arise, awake, and stop not till the goal is reached.",
    author: "Swami Vivekananda"
  },
  {
    text: "The true teachers are those who help us think for ourselves.",
    author: "Dr. Sarvepalli Radhakrishnan"
  },
  {
    text: "Education is not the learning of facts, but the training of the mind to think.",
    author: "Albert Einstein"
  },
  {
    text: "Even if there is a mountain of obstacles, the one who perseveres, wins.",
    author: "Chhatrapati Shivaji Maharaj"
  }
];

export default function MotivationalQuotes() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 6000); // Change quote every 6 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto min-h-[160px] flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="text-center"
        >
          <p className="text-xl md:text-2xl font-serif text-gray-800 italic mb-4 leading-relaxed">
            "{quotes[index].text}"
          </p>
          <p className="font-semibold text-primary">
            - {quotes[index].author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
