import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BirthdayConfig } from '../types';
import { playKeypadBeep, playUnlockChime, playErrorBuzz } from '../utils/audio';

interface PasskeyStageProps {
  config: BirthdayConfig;
  onNext: () => void;
}

export function PasskeyStage({ config, onNext }: PasskeyStageProps) {
  const [enteredCode, setEnteredCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const targetCode = config.passkey;

  const handleDigit = (digit: string) => {
    if (isUnlocked) return;
    if (isError) setIsError(false);

    playKeypadBeep(350 + parseInt(digit, 10) * 40);

    const nextCode = enteredCode + digit;
    setEnteredCode(nextCode);

    if (nextCode === targetCode) {
      playUnlockChime();
      setIsUnlocked(true);
    } else if (nextCode.length >= targetCode.length) {
      // Wrong code
      playErrorBuzz();
      setIsError(true);
      setTimeout(() => {
        setEnteredCode('');
      }, 750);
    }
  };

  const handleBackspace = () => {
    if (isUnlocked || isError) return;
    playKeypadBeep(300);
    setEnteredCode((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isUnlocked) return;
    playKeypadBeep(260);
    setEnteredCode('');
    setIsError(false);
  };

  const buttonStyle =
    'h-14 sm:h-16 rounded-2xl border border-[#8b6b3f]/25 bg-white/75 hover:bg-white text-[#6d4c2f] text-xl sm:text-2xl font-semibold backdrop-blur-sm shadow-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer';

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative select-none">
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div
              key="passcode-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              {/* Lock graphic */}
              <motion.div
                animate={
                  isError
                    ? { x: [-8, 8, -6, 6, -3, 3, 0] }
                    : { y: [0, -4, 0] }
                }
                transition={
                  isError
                    ? { duration: 0.4 }
                    : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                }
                className="mb-4 flex items-center justify-center"
              >
                <img
                  src="/images/lock.png"
                  alt="Golden Lock"
                  className="w-24 sm:w-28 h-24 sm:h-28 object-contain drop-shadow-md"
                />
              </motion.div>

              {/* Status Header */}
              <h2
                className={`text-center font-playfair text-lg sm:text-xl font-bold mb-2 transition-colors duration-300 ${
                  isError ? 'text-red-600' : 'text-[#6d4c2f]'
                }`}
              >
                {isError ? 'Wrong Passkey! Try Again' : (config.passkeyHint || `Enter = ${config.passkey}`)}
              </h2>

              {/* Code Dots Display */}
              <div
                className={`h-14 mb-5 text-2xl sm:text-3xl tracking-[12px] font-bold transition-colors duration-300 flex justify-center items-center ${
                  isError ? 'text-red-600' : 'text-[#6d4c2f]'
                }`}
              >
                {enteredCode.length > 0 ? (
                  enteredCode.replace(/./g, '●')
                ) : (
                  <span className="text-[#6d4c2f]/30 tracking-normal text-base font-cinzel">
                    Enter Code
                  </span>
                )}
              </div>

              {/* 3x4 Dialpad */}
              <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    id={`keypad-digit-${num}`}
                    onClick={() => handleDigit(String(num))}
                    className={buttonStyle}
                  >
                    {num}
                  </button>
                ))}

                <button
                  id="keypad-backspace"
                  onClick={handleBackspace}
                  className={`${buttonStyle} font-cinzel text-lg`}
                  aria-label="Backspace"
                >
                  ⌫
                </button>

                <button
                  id="keypad-digit-0"
                  onClick={() => handleDigit('0')}
                  className={buttonStyle}
                >
                  0
                </button>

                <button
                  id="keypad-clear"
                  onClick={handleClear}
                  className={`${buttonStyle} font-cinzel text-sm uppercase tracking-wider text-[#8b6b3f]/80`}
                  aria-label="Clear code"
                >
                  C
                </button>
              </div>

              {/* Convenient Hint */}
              <p className="font-cormorant italic text-xs text-[#8b6b3f]/75 mt-4 text-center">
                Tap the code to unlock your surprise ✨
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="text-center flex flex-col items-center z-10 py-6"
            >
              {/* Unlocked graphic */}
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: [1, 1.05, 1], rotate: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-3"
              >
                <img
                  src="/images/unlock.png"
                  alt="Unlocked Golden Padlock"
                  className="w-36 sm:w-44 h-36 sm:h-44 object-contain drop-shadow-xl"
                />
              </motion.div>

              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#6d4c2f] mb-2">
                Correct Passkey ✨
              </h2>
              <p className="font-cormorant italic text-base sm:text-lg text-[#8b6b3f] mb-6">
                {config.memories && config.memories.length > 0
                  ? 'Here Your Memories Await...'
                  : 'The Grand Celebration Awaits You! 💖'}
              </p>

              <button
                id="view-memories-btn"
                onClick={onNext}
                className="px-8 py-3.5 rounded-full bg-[#8b6b3f] hover:bg-[#72542e] text-white font-semibold text-base shadow-[0_6px_20px_rgba(139,107,63,0.4)] hover:shadow-[0_8px_25px_rgba(139,107,63,0.5)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>
                  {config.memories && config.memories.length > 0
                    ? 'View Memories'
                    : 'Celebrate Together'}
                </span>
                <span>✦</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
