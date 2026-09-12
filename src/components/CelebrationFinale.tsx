import { useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Share2, Copy, Check, RotateCcw, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BirthdayConfig } from '../types';
import { playPopSound, playSparkleChime } from '../utils/audio';

interface CelebrationFinaleProps {
  config: BirthdayConfig;
  onRestart: () => void;
}

interface Balloon {
  id: number;
  color: string;
  left: number;
  delay: number;
  wish: string;
  popped: boolean;
}

const INITIAL_BALLOONS: Balloon[] = [
  { id: 1, color: '#f43f5e', left: 12, delay: 0.2, wish: 'You bring endless sunshine into every single day! ☀️', popped: false },
  { id: 2, color: '#ec4899', left: 28, delay: 0.6, wish: 'May every wish you whisper today come true! ✨', popped: false },
  { id: 3, color: '#8b5cf6', left: 45, delay: 0.1, wish: 'You are loved beyond words and measures! 💖', popped: false },
  { id: 4, color: '#f59e0b', left: 63, delay: 0.8, wish: 'Cheers to your dreams, adventures, and endless joy! 🥂', popped: false },
  { id: 5, color: '#10b981', left: 80, delay: 0.4, wish: 'Never stop smiling that world-stopping smile! 😍', popped: false },
];

export function CelebrationFinale({ config, onRestart }: CelebrationFinaleProps) {
  const [balloons, setBalloons] = useState<Balloon[]>(INITIAL_BALLOONS);
  const [activeWish, setActiveWish] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states for creating custom link
  const [customName, setCustomName] = useState(config.recipientName);
  const [customNickname, setCustomNickname] = useState(config.nickname);
  const [customSender, setCustomSender] = useState(config.senderName);
  const [customCode, setCustomCode] = useState(config.passkey);
  const [customMsg, setCustomMsg] = useState(config.letterMessage);

  const popBalloon = (id: number, wish: string, e: MouseEvent) => {
    playPopSound();
    setActiveWish(wish);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { x, y },
      colors: ['#f43f5e', '#f59e0b', '#10b981', '#6366f1', '#ec4899'],
    });

    setBalloons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );
  };

  const triggerGrandConfetti = () => {
    playSparkleChime();
    confetti({
      particleCount: 220,
      spread: 100,
      origin: { y: 0.6 },
    });
  };

  const generateShareUrl = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (customName) url.searchParams.set('name', customName);
    if (customNickname) url.searchParams.set('nickname', customNickname);
    if (customSender) url.searchParams.set('sender', customSender);
    if (customCode) url.searchParams.set('code', customCode);
    if (customMsg && customMsg !== config.letterMessage) url.searchParams.set('msg', customMsg);
    return url.toString();
  };

  const handleCopyLink = () => {
    const shareUrl = generateShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleWhatsAppShare = () => {
    const shareUrl = generateShareUrl();
    const text = encodeURIComponent(`Hey ${customName || 'there'}! I made a special birthday surprise website just for you ♡ Open it here: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-10 relative select-none">
      {/* Floating Interactive Balloons */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {balloons.map((balloon) => {
          if (balloon.popped) return null;
          return (
            <motion.div
              key={balloon.id}
              className="absolute pointer-events-auto cursor-pointer flex flex-col items-center group"
              style={{ left: `${balloon.left}%`, bottom: '-100px' }}
              initial={{ y: 0 }}
              animate={{
                y: [0, -window.innerHeight - 200],
                x: [0, Math.sin(balloon.id) * 25, 0],
              }}
              transition={{
                duration: 14 + (balloon.id % 3) * 3,
                repeat: Infinity,
                delay: balloon.delay,
                ease: 'linear',
              }}
              onClick={(e) => popBalloon(balloon.id, balloon.wish, e)}
              whileHover={{ scale: 1.12 }}
            >
              {/* Balloon Body */}
              <div
                className="w-14 h-18 sm:w-16 sm:h-20 rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg relative flex items-center justify-center transition-transform"
                style={{
                  backgroundColor: balloon.color,
                  boxShadow: `inset -6px -6px 12px rgba(0,0,0,0.2), inset 6px 6px 12px rgba(255,255,255,0.4), 0 8px 20px ${balloon.color}40`,
                }}
              >
                <span className="text-white text-xs font-semibold opacity-90">POP ME</span>
                {/* Knot */}
                <div
                  className="absolute -bottom-1 w-2.5 h-1.5 rounded-sm"
                  style={{ backgroundColor: balloon.color }}
                />
              </div>
              {/* Balloon String */}
              <div className="w-[1px] h-14 bg-stone-400/60 -mt-0.5" />
            </motion.div>
          );
        })}
      </div>

      <div className="w-full max-w-xl flex flex-col items-center text-center z-20">
        {/* Popped Balloon Wish Banner */}
        <AnimatePresence>
          {activeWish && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-[#8b6347]/30 shadow-lg text-[#5c4033] max-w-md flex items-center gap-3"
            >
              <Sparkles size={20} className="text-amber-500 shrink-0" />
              <p className="font-playpen text-sm sm:text-base leading-relaxed text-left flex-1">
                {activeWish}
              </p>
              <button
                onClick={() => setActiveWish(null)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg px-1"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grand Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-[#fffdf9]/95 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(139,99,71,0.18)] border border-[#8b6347]/20 relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#faecc8]/70 border border-[#8b6347]/20 text-[#8b6347] text-xs font-cinzel tracking-widest uppercase mb-4">
            <Heart size={13} className="text-red-500 fill-red-500" />
            <span>Forever Celebrated</span>
            <Heart size={13} className="text-red-500 fill-red-500" />
          </div>

          <h1 className="font-playfair text-3xl sm:text-5xl font-bold text-[#5c4033] tracking-tight mb-3">
            Happy Birthday, {config.recipientName}! 🎉
          </h1>

          <p className="font-cormorant italic text-lg sm:text-xl text-[#8b6347] mb-6 max-w-md mx-auto">
            "May your year ahead be as beautiful, radiant, and wonderful as you are to the world."
          </p>

          <p className="font-playpen text-xs text-[#8b6347]/70 mb-6">
            Tip: Pop the floating balloons in the background for surprise birthday wishes! 🎈
          </p>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="blast-confetti-btn"
              onClick={triggerGrandConfetti}
              className="px-6 py-3 rounded-full bg-[#8b6347] hover:bg-[#724e34] text-white font-semibold text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
            >
              <PartyPopper size={17} />
              <span>Blast Confetti!</span>
            </button>

            <button
              id="customize-share-btn"
              onClick={() => setShowShareModal(true)}
              className="px-6 py-3 rounded-full bg-[#faecc8] hover:bg-[#f5e0b0] text-[#5c4033] border border-[#8b6347]/30 font-semibold text-sm shadow-sm flex items-center gap-2 active:scale-95 transition-all"
            >
              <Share2 size={16} />
              <span>Customize & Share</span>
            </button>

            <button
              id="restart-from-start-btn"
              onClick={onRestart}
              className="p-3 rounded-full bg-white hover:bg-stone-100 text-[#8b6347] border border-[#8b6347]/30 shadow-sm active:scale-95 transition-all"
              title="Replay from the start"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Customize & Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              id="customize-share-modal"
              className="w-full max-w-lg bg-[#fffdf9] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#8b6347]/30 max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#8b6347]/20 mb-5">
                <div className="text-left">
                  <h3 className="font-playfair text-xl font-bold text-[#5c4033]">
                    Create Your Surprise Link
                  </h3>
                  <p className="font-cormorant italic text-xs text-[#8b6347]">
                    Personalize and send this exact experience to someone special
                  </p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-stone-400 hover:text-stone-700 font-bold text-xl px-2"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-cinzel font-semibold text-[#6d4c2f] mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Sarah, Alex, Sweetheart"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#8b6347]/30 bg-white font-playpen text-sm text-[#4a3b32] focus:outline-none focus:ring-2 focus:ring-[#8b6347]/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-cinzel font-semibold text-[#6d4c2f] mb-1">
                      Nickname (Wax Seal)
                    </label>
                    <input
                      type="text"
                      value={customNickname}
                      onChange={(e) => setCustomNickname(e.target.value)}
                      placeholder="e.g. My Cutuuu"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#8b6347]/30 bg-white font-playpen text-sm text-[#4a3b32] focus:outline-none focus:ring-2 focus:ring-[#8b6347]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-cinzel font-semibold text-[#6d4c2f] mb-1">
                      Your Name / From
                    </label>
                    <input
                      type="text"
                      value={customSender}
                      onChange={(e) => setCustomSender(e.target.value)}
                      placeholder="e.g. Your Bestie"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#8b6347]/30 bg-white font-playpen text-sm text-[#4a3b32] focus:outline-none focus:ring-2 focus:ring-[#8b6347]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-cinzel font-semibold text-[#6d4c2f] mb-1">
                    Secret Passkey (Keypad Code)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 2026 or birth date"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#8b6347]/30 bg-white font-playpen text-sm text-[#4a3b32] focus:outline-none focus:ring-2 focus:ring-[#8b6347]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel font-semibold text-[#6d4c2f] mb-1">
                    Personal Love Letter Message
                  </label>
                  <textarea
                    rows={4}
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#8b6347]/30 bg-white font-playpen text-xs sm:text-sm text-[#4a3b32] focus:outline-none focus:ring-2 focus:ring-[#8b6347]/40 leading-relaxed"
                  />
                </div>

                {/* Share Action Buttons */}
                <div className="pt-3 border-t border-[#8b6347]/20 flex flex-col sm:flex-row gap-2.5">
                  <button
                    id="copy-custom-link-btn"
                    onClick={handleCopyLink}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#8b6347] hover:bg-[#724e34] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Surprise Link'}</span>
                  </button>

                  <button
                    id="whatsapp-share-btn"
                    onClick={handleWhatsAppShare}
                    className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
