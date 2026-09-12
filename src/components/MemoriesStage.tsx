import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Heart, Sparkles, PartyPopper, ExternalLink, Upload, Image as ImageIcon } from 'lucide-react';
import { BirthdayConfig, BirthdayMemory } from '../types';
import { playSparkleChime } from '../utils/audio';
import { getDriveImageUrls } from '../utils/driveImage';

interface MemoriesStageProps {
  config: BirthdayConfig;
  onNext: () => void;
  onRestart: () => void;
}

export function MemoriesStage({ config, onNext, onRestart }: MemoriesStageProps) {
  const [memories, setMemories] = useState<BirthdayMemory[]>(config.memories);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [imageRetryIndex, setImageRetryIndex] = useState<Record<number, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMemories(config.memories);
    // Check if user previously saved a custom uploaded photo in localStorage
    const savedCustomPhoto = localStorage.getItem('birthday_custom_photo');
    if (savedCustomPhoto && config.memories.length > 0) {
      setMemories((prev) => [
        {
          ...prev[0],
          image: savedCustomPhoto,
        },
        ...prev.slice(1),
      ]);
    }
  }, [config.memories]);

  const currentMemory = memories[currentIndex] || memories[0];

  const handleNext = () => {
    if (memories.length <= 1) return;
    playSparkleChime();
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  };

  const handlePrev = () => {
    if (memories.length <= 1) return;
    playSparkleChime();
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
  };

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Determine image source with fallbacks for Google Drive
  const getImageSource = (memory: BirthdayMemory, index: number): string => {
    const urls = getDriveImageUrls(memory.image || memory.driveUrl || '');
    const retry = imageRetryIndex[index] || 0;
    if (retry === 0) return urls.primary;
    if (retry === 1) return urls.thumbnail;
    if (retry === 2) return urls.fallback;
    return urls.thumbnail;
  };

  const handleImageError = (index: number) => {
    const currentRetry = imageRetryIndex[index] || 0;
    if (currentRetry < 2) {
      // Try next alternative URL
      setImageRetryIndex((prev) => ({ ...prev, [index]: currentRetry + 1 }));
    } else {
      // Mark as error to show fallback card
      setImageError((prev) => ({ ...prev, [index]: true }));
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        localStorage.setItem('birthday_custom_photo', dataUrl);
        setMemories((prev) =>
          prev.map((m, idx) =>
            idx === currentIndex ? { ...m, image: dataUrl } : m
          )
        );
        setImageError((prev) => ({ ...prev, [currentIndex]: false }));
        setImageRetryIndex((prev) => ({ ...prev, [currentIndex]: 0 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const driveLink = currentMemory?.driveUrl || (currentMemory?.image?.includes('drive.google.com') ? currentMemory.image : 'https://drive.google.com/file/d/1Xn2kt7_F6aE7Q7ezsynZheQ89ox35A-Z/view?usp=drivesdk');

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 relative select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        {/* Title Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-3"
        >
          <h1
            className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide"
            style={{
              backgroundImage: 'linear-gradient(135deg, #6d4c2f 0%, #a87c4f 40%, #c79a63 75%, #6d4c2f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(139,107,63,0.25))',
            }}
          >
            Special Memories
          </h1>

          {/* Golden Divider Line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="h-[1px] w-36 mx-auto my-3"
            style={{
              background: 'linear-gradient(to right, transparent, #a87c4f, #c79a63, #a87c4f, transparent)',
              boxShadow: '0 0 8px rgba(168,124,79,0.25)',
            }}
          />

          <p className="font-cormorant italic text-sm sm:text-base text-[#6d4c2f]/70 tracking-wider">
            {memories.length > 1 ? 'Swipe for more ✦ Tap photo to read note' : '✦ Tap photo to read heartfelt note ✦'}
          </p>
        </motion.div>

        {/* 3D Memory Card Container */}
        <div className="relative w-full max-w-sm sm:max-w-md h-[420px] sm:h-[460px] flex items-center justify-center my-4">
          <AnimatePresence mode="wait">
            {memories.map((memory, index) => {
              if (index !== currentIndex) return null;
              const isFlipped = !!flippedCards[index];
              const hasError = !!imageError[index];
              const imageSrc = getImageSource(memory, index);

              return (
                <motion.div
                  key={memory.id || index}
                  initial={{ opacity: 0, scale: 0.88, rotateY: 20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.88, rotateY: -20 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                  drag={memories.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (memories.length <= 1) return;
                    if (info.offset.x < -40) handleNext();
                    else if (info.offset.x > 40) handlePrev();
                  }}
                  className="w-[280px] sm:w-[320px] h-[380px] sm:h-[420px] cursor-pointer perspective-1000 relative select-none"
                >
                  <div
                    onClick={() => toggleFlip(index)}
                    className="w-full h-full rounded-2xl overflow-hidden bg-[#fffaf0] border border-[#a87c4f]/35 shadow-[0_12px_32px_rgba(109,76,47,0.18),inset_0_0_16px_rgba(168,124,79,0.08)] transition-transform duration-500 relative flex flex-col p-3.5"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {!isFlipped ? (
                      /* Front of Polaroid Card */
                      <div className="w-full h-full flex flex-col justify-between">
                        <div className="relative w-full h-[255px] sm:h-[285px] rounded-xl overflow-hidden bg-[#f5ecdc] shadow-inner flex items-center justify-center">
                          {!hasError ? (
                            <img
                              src={imageSrc}
                              alt={memory.caption}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              onError={() => handleImageError(index)}
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          ) : (
                            /* Fallback Card if Google Drive restricts direct hotlinking */
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#fffdf9] to-[#faedd0] border border-[#8b6347]/20 rounded-xl"
                            >
                              <div className="w-12 h-12 rounded-full bg-[#8b6347]/15 flex items-center justify-center text-[#8b6347] mb-2">
                                <ImageIcon size={24} />
                              </div>
                              <h4 className="font-playfair font-bold text-sm text-[#5c4033] mb-1">
                                Google Drive Photo
                              </h4>
                              <p className="font-cormorant italic text-xs text-[#8b6347] mb-3 px-2">
                                This photo is hosted on Google Drive. You can view it directly or upload a local copy.
                              </p>

                              <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                                <a
                                  href={driveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-1.5 px-3 rounded-lg bg-[#8b6347] hover:bg-[#724e34] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                >
                                  <span>Open in Drive</span>
                                  <ExternalLink size={12} />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="py-1.5 px-3 rounded-lg bg-white/90 hover:bg-white text-[#5c4033] border border-[#8b6347]/30 text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                >
                                  <Upload size={12} />
                                  <span>Upload Photo File</span>
                                </button>
                              </div>

                              <p className="text-[10px] text-[#8b6347]/70 mt-2">
                                (Tip: Set Drive link sharing to 'Anyone with the link')
                              </p>
                            </div>
                          )}

                          {memory.tag && (
                            <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#fffdf9]/90 backdrop-blur-sm text-[10px] font-cinzel text-[#8b6347] border border-[#8b6347]/20 tracking-wider">
                              {memory.tag}
                            </div>
                          )}
                        </div>

                        {/* Polaroid Footer caption */}
                        <div className="pt-2 px-1 text-center">
                          <p className="font-playpen text-xs sm:text-sm text-[#5c4033] line-clamp-2 leading-relaxed">
                            {memory.caption}
                          </p>
                          <div className="flex items-center justify-center gap-1 mt-1 text-[11px] font-cormorant italic text-[#8b6347]/70">
                            <Heart size={11} className="text-red-400 fill-red-400" />
                            <span>{memory.date || 'Forever & Always'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Back of Polaroid Card with personal handwritten note */
                      <div
                        className="w-full h-full flex flex-col justify-between p-4 bg-[#fff8eb] rounded-xl border border-[#8b6347]/20"
                        style={{ transform: 'rotateY(180deg)' }}
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-[#8b6347]/20 pb-2 mb-3">
                            <span className="font-cinzel text-xs text-[#8b6347] tracking-widest uppercase">
                              Special Memory
                            </span>
                            <Sparkles size={14} className="text-[#8b6347]" />
                          </div>
                          <p className="font-playpen text-sm leading-relaxed text-[#4a3b32] text-left">
                            "{memory.caption}"
                          </p>
                          <p className="font-cormorant italic text-sm text-[#8b6347]/90 mt-4 text-left leading-relaxed">
                            Every single second with you is a moment etched into my heart forever. You make the world brighter, warmer, and so full of love. Happy Birthday! 💖
                          </p>
                        </div>

                        <div className="text-center pt-2 border-t border-[#8b6347]/15">
                          <span className="font-cinzel text-[10px] text-[#8b6347]/60 uppercase tracking-wider">
                            Tap to flip back ✦
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Carousel Left/Right navigation buttons only if more than 1 memory */}
          {memories.length > 1 && (
            <>
              <button
                id="memories-prev-btn"
                onClick={handlePrev}
                aria-label="Previous memory"
                className="absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#6d4c2f] border border-[#a87c4f]/30 shadow-md flex items-center justify-center backdrop-blur-sm z-30 transition-all active:scale-90"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                id="memories-next-btn"
                onClick={handleNext}
                aria-label="Next memory"
                className="absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#6d4c2f] border border-[#a87c4f]/30 shadow-md flex items-center justify-center backdrop-blur-sm z-30 transition-all active:scale-90"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {/* Carousel Indicators (only if multiple) */}
        {memories.length > 1 && (
          <div className="flex items-center gap-2 mb-6">
            {memories.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to memory ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i
                    ? 'w-6 bg-[#8b6b3f]'
                    : 'w-2 bg-[#8b6b3f]/30 hover:bg-[#8b6b3f]/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <button
            id="grand-finale-btn"
            onClick={onNext}
            className="px-6 py-2.5 rounded-full bg-[#8b6b3f] hover:bg-[#72542e] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(139,107,63,0.35)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <PartyPopper size={16} />
            <span>Grand Birthday Finale</span>
          </button>

          <button
            id="replace-photo-btn"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-full border border-[#8b6b3f]/30 bg-white/70 hover:bg-white text-[#6d4c2f] text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Upload or change photo from your device"
          >
            <Upload size={13} />
            <span>Upload Photo</span>
          </button>

          <button
            id="replay-journey-btn"
            onClick={onRestart}
            className="px-4 py-2.5 rounded-full border border-[#8b6b3f]/30 bg-white/70 hover:bg-white text-[#6d4c2f] text-xs font-medium transition-all active:scale-95 cursor-pointer"
          >
            Start Over ↻
          </button>
        </div>
      </div>
    </div>
  );
}
