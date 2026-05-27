"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export function StreakBadge({ days }: { days: number }) {
  return (
    <motion.div 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-orange-500/30 bg-orange-500/10"
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [-5, 5, -5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5,
          ease: "easeInOut"
        }}
      >
        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
      </motion.div>
      <span className="text-sm font-bold text-orange-400">{days} Day Streak</span>
    </motion.div>
  );
}
