"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, CheckCircle2, XCircle } from "lucide-react";

const PUZZLES = [
  {
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    options: ["An Echo", "A Shadow", "A Cloud", "A Dream"],
    answer: "An Echo",
  },
  {
    question: "The more of this there is, the less you see. What is it?",
    options: ["Darkness", "Fog", "Light", "Water"],
    answer: "Darkness",
  },
  {
    question: "I have branches, but no fruit, trunk or leaves. What am I?",
    options: ["A River", "A Bank", "A Library", "A Road"],
    answer: "A Bank",
  }
];

export default function BrainstormGameCard() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const puzzle = PUZZLES[puzzleIndex];

  const handleSelect = (option: string) => {
    if (selectedOption) return; // Prevent multiple selections
    setSelectedOption(option);
    setIsCorrect(option === puzzle.answer);
  };

  const nextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % PUZZLES.length);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  return (
    <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-full flex flex-col">
      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
          <Lightbulb className="w-6 h-6 text-yellow-300" />
        </div>
        <h3 className="font-bold text-xl">Daily Brainstorm</h3>
      </div>

      <p className="text-white/90 font-medium mb-6 relative z-10 min-h-[4rem]">
        {puzzle.question}
      </p>

      <div className="grid grid-cols-1 gap-2 mb-4 relative z-10 flex-1">
        {puzzle.options.map((option) => {
          const isSelected = selectedOption === option;
          let buttonClass = "bg-white/10 hover:bg-white/20 text-white border-white/20";
          
          if (isSelected) {
            buttonClass = isCorrect 
              ? "bg-green-500 text-white border-green-500" 
              : "bg-red-500 text-white border-red-500";
          } else if (selectedOption && option === puzzle.answer) {
            buttonClass = "bg-green-500/50 text-white border-green-500/50"; // Show correct answer if they got it wrong
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={selectedOption !== null}
              className={`p-3 rounded-xl border backdrop-blur-sm text-sm font-medium transition-all flex items-center justify-between ${buttonClass}`}
            >
              {option}
              {isSelected && isCorrect && <CheckCircle2 className="w-5 h-5" />}
              {isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedOption && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={nextPuzzle}
            className="w-full py-3 bg-white text-violet-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors relative z-10"
          >
            Next Challenge
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
