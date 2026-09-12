import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { BirthdayConfig } from '../types';
import { playSparkleChime } from '../utils/audio';

interface LetterStageProps {
  config: BirthdayConfig;
  onNext: () => void;
}

export function LetterStage({ config, onNext }: LetterStageProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const fullMessage = config.letterMessage;

  const handleOpenEnvelope = () => {
    if (isOpened) return;
    setIsOpened(true);
    playSparkleChime();
    setTimeout(() => {
      setShowModal(true);
    }, 600);
  };

  useEffect(() => {
    if (!showModal) return;
    setDisplayedText('');
    setIsTypingComplete(false);

    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex += 2; // pleasant reading speed
      setDisplayedText(fullMessage.slice(0, charIndex));
      if (charIndex >= fullMessage.length) {
        clearInterval(interval);
        setDisplayedText(fullMessage);
        setIsTypingComplete(true);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [showModal, fullMessage]);

  const handleSkipTyping = () => {
    setDisplayedText(fullMessage);
    setIsTypingComplete(true);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative select-none">
      <div className="w-full max-w-md text-center relative flex flex-col items-center">
        {/* Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-7"
        >
          <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#8b6347] tracking-wide drop-shadow-sm">
            {config.letterTitle}
          </h1>
          <p className="font-cormorant italic text-base text-[#8b6347]/75 mt-1.5">
            {config.letterSubtitle}
          </p>
        </motion.div>

        {/* Vintage Envelope */}
        <motion.div
          style={{ perspective: 1000 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8"
        >
          <motion.div
            id="envelope-unseal-card"
            whileHover={isOpened ? {} : { scale: 1.04, rotateZ: -1 }}
            whileTap={isOpened ? {} : { scale: 0.97 }}
            onClick={isOpened ? undefined : handleOpenEnvelope}
            className="relative w-[290px] h-[195px] sm:w-[320px] sm:h-[210px] cursor-pointer select-none"
          >
            {/* Envelope Base Body */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fcedca] to-[#eddba9] border border-[#8b6347]/30 rounded-sm shadow-[0_12px_28px_rgba(139,99,71,0.18),0_4px_10px_rgba(0,0,0,0.06),inset_0_1px_3px_rgba(255,255,255,0.7)]" />

            {/* Envelope Fold Lines SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 290 195"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="195" x2="145" y2="105" stroke="rgba(139,99,71,0.25)" strokeWidth="1" />
              <line x1="290" y1="195" x2="145" y2="105" stroke="rgba(139,99,71,0.25)" strokeWidth="1" />
              <line x1="0" y1="0" x2="145" y2="105" stroke="rgba(139,99,71,0.18)" strokeWidth="0.75" />
              <line x1="290" y1="0" x2="145" y2="105" stroke="rgba(139,99,71,0.18)" strokeWidth="0.75" />
            </svg>

            {/* Top Triangular Flap (Animates Open) */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={{ rotateX: isOpened ? -160 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '52%',
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                zIndex: isOpened ? 5 : 12,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '100%',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background: 'linear-gradient(180deg, #eddba9 0%, #e0ce99 100%)',
                  borderTop: '1px solid rgba(139,99,71,0.25)',
                }}
              />
            </motion.div>

            {/* Wax Seal */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: isOpened ? 2 : 20 }}
            >
              <div className="w-14 h-14 rounded-full bg-[radial-gradient(circle_at_35%_30%,#d9534f_0%,#b53b38_50%,#8c2422_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_3px_rgba(255,255,255,0.4)] flex items-center justify-center border border-[#ef4444]/30">
                <span className="font-cinzel text-xl text-[#fcedca] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  ✦
                </span>
              </div>
            </div>

            {/* Envelope Inscription Label */}
            {!isOpened && (
              <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                <div className="font-cormorant italic text-base sm:text-lg text-[#8b6347] font-semibold">
                  For You, {config.nickname}
                </div>
                <div className="font-cinzel text-[9px] tracking-[0.2em] text-[#8b6347]/70 mt-0.5 uppercase font-medium">
                  Tap to unseal ♡
                </div>
              </div>
            )}

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 right-3.5 font-cinzel text-[10px] text-[#8b6347]/40 tracking-widest">
              ❋
            </div>
            <div className="absolute bottom-3 left-3.5 font-cinzel text-[10px] text-[#8b6347]/40 tracking-widest">
              ❋
            </div>
          </motion.div>
        </motion.div>

        {/* Decorative Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2 justify-center"
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#8b6347]/30" />
          <span className="text-[#8b6347]/40 text-xs">◈</span>
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#8b6347]/30" />
        </motion.div>

        {/* Reopen Letter Button if modal closed */}
        {isOpened && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center"
          >
            <button
              id="read-letter-again-btn"
              onClick={() => setShowModal(true)}
              className="px-5 py-2 rounded-full border border-[#8b6347]/40 text-[#8b6347] text-sm font-medium hover:bg-[#fffdf9]/60 transition-colors"
            >
              Re-read Letter ♡
            </button>
            <button
              id="proceed-to-cake-btn"
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8b6347] hover:bg-[#724e34] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              <span>Cut the Cake!</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Parchment Letter Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-[#faecc8]/50 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              id="parchment-letter-modal"
              className="w-full max-w-lg bg-[#fffdf9] rounded-xl p-7 sm:p-9 shadow-[0_30px_70px_rgba(139,99,71,0.22),0_10px_30px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(255,255,255,0.9)] border border-[#8b6347]/20 relative max-h-[82vh] flex flex-col"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse 600px 400px at 20% 20%, rgba(139, 99, 71, 0.05) 0%, transparent 50%),
                  radial-gradient(ellipse 500px 350px at 85% 75%, rgba(139, 99, 71, 0.03) 0%, transparent 50%),
                  repeating-linear-gradient(0deg, rgba(139, 99, 71, 0.02) 0px, rgba(139, 99, 71, 0.02) 1px, transparent 1px, transparent 26px)
                `,
                backgroundSize: '100% 100%, 100% 100%, 100% 26px',
              }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Four Ornate Vintage Corner Brackets */}
              <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t border-l border-[#8b6347]/40" />
              <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t border-r border-[#8b6347]/40" />
              <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b border-l border-[#8b6347]/40" />
              <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b border-r border-[#8b6347]/40" />

              {/* Close Button */}
              <button
                id="close-letter-modal-btn"
                onClick={() => setShowModal(false)}
                aria-label="Close letter"
                className="absolute top-3.5 right-4 font-cormorant text-2xl text-[#8b6347]/50 hover:text-[#8b6347] transition-colors leading-none p-1"
              >
                ×
              </button>

              {/* Header inside Letter */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 text-[#8b6347] mb-1">
                  <Sparkles size={16} />
                  <h3 className="font-playfair text-xl sm:text-2xl font-bold text-[#5c4033]">
                    Happy Birthday ✨
                  </h3>
                  <Sparkles size={16} />
                </div>
                <p className="font-cormorant italic text-[#8b6347] text-sm">
                  Just for you, {config.recipientName} ♡
                </p>
              </div>

              {/* Message Body with Typewriter text */}
              <div
                className="flex-1 overflow-y-auto pr-1 select-text cursor-default"
                onClick={!isTypingComplete ? handleSkipTyping : undefined}
                title={!isTypingComplete ? 'Click to show all' : undefined}
              >
                <p className="font-playpen text-[15px] sm:text-[16px] leading-[26px] text-[#4a3b32] whitespace-pre-line text-left px-2">
                  {displayedText}
                  {!isTypingComplete && (
                    <span className="text-[#8b6347] font-light ink-cursor">|</span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#8b6347]/15 flex items-center justify-between">
                {!isTypingComplete ? (
                  <button
                    id="skip-typewriter-btn"
                    onClick={handleSkipTyping}
                    className="text-xs text-[#8b6347]/70 hover:text-[#8b6347] font-cormorant italic underline"
                  >
                    Click to show full message
                  </button>
                ) : (
                  <div className="text-xs text-[#8b6347]/60 font-cinzel tracking-wider">
                    WITH LOVE, {config.senderName.toUpperCase()}
                  </div>
                )}

                <button
                  id="letter-modal-next-btn"
                  onClick={() => {
                    setShowModal(false);
                    onNext();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8b6347] hover:bg-[#724e34] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all ml-auto"
                >
                  <span>Continue</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
