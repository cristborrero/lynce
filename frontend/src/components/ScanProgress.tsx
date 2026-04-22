"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const scanSteps = [
  "Checking SSL certificate...",
  "Analyzing security headers...",
  "Detecting WordPress signals...",
  "Scanning sensitive files...",
  "Querying blacklists...",
];

export function ScanProgress({ isOpen }: { isOpen: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % scanSteps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#0A0E14] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Matrix-like background effect */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
            <div className="matrix-background" />
          </div>

          {/* Top progress bar */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 10, ease: "linear" }}
            className="absolute top-0 left-0 h-1 bg-accent z-10"
          />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-accent font-mono text-sm tracking-[0.2em] uppercase"
            >
              {scanSteps[currentStep]}
            </motion.div>
            
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-1.5 h-1.5 bg-accent rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
