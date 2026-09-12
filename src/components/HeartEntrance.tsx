import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { playSparkleChime } from '../utils/audio';

interface HeartEntranceProps {
  onStart: () => void;
  recipientName: string;
}

export function HeartEntrance({ onStart, recipientName }: HeartEntranceProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (isClicked) return;
    setIsClicked(true);
    playSparkleChime();

    // Soft heart confetti burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#ef4444', '#f43f5e', '#fb7185', '#fda4af', '#fcd34d'],
      scalar: 1.1,
    });

    setTimeout(() => {
      onStart();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-transparent pointer-events-auto select-none"
        initial={{ opacity: 1 }}
        animate={isClicked ? { opacity: 0, scale: 1.1 } : { opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <p className="font-cormorant italic text-lg sm:text-xl text-[#8b6347]/90 tracking-wide mb-1">
              A special gift is waiting for you...
            </p>
            <p className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#8b6347]/60">
              Tap the heart to begin ♡
            </p>
          </motion.div>

          <motion.button
            id="heart-entrance-btn"
            onClick={handleClick}
            aria-label="Tap the heart to start"
            className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center cursor-pointer border-none outline-none bg-transparent relative p-0 m-0 group focus:outline-none"
            animate={
              isClicked
                ? { scale: [1, 1.4, 0.8, 2], opacity: [1, 1, 0.8, 0] }
                : {
                    scale: [1, 1.15, 1, 1.12, 1],
                  }
            }
            transition={
              isClicked
                ? { duration: 0.9, ease: 'easeInOut' }
                : {
                    duration: 1.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          >
            {/* Ambient pulsating glow */}
            <div className="absolute inset-0 bg-red-500/25 rounded-full filter blur-xl group-hover:bg-red-500/35 transition-all -z-10" />

            <svg
              viewBox="0 0 24 24"
              className="w-full h-full fill-red-600 drop-shadow-[0_8px_20px_rgba(220,38,38,0.45)] transition-transform group-hover:scale-105"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-playpen text-xs text-[#8b6347]/70 font-medium"
          >
            {recipientName ? `For ${recipientName} ✨` : 'Touch gently ✨'}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
