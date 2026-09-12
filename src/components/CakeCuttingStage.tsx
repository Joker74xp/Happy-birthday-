import { useRef, useEffect, useState, type PointerEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BirthdayConfig } from '../types';
import { playSliceSwoosh, playSparkleChime } from '../utils/audio';

interface CakeCuttingStageProps {
  config: BirthdayConfig;
  onNext: () => void;
}

interface Point {
  x: number;
  y: number;
}

const CONFETTI_COLORS = ['#964B00', '#5C4033', '#8B4513', '#C04000', '#6D3B07', '#f59e0b', '#ec4899', '#fcd34d'];

export function CakeCuttingStage({ config, onNext }: CakeCuttingStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDragging = useRef<boolean>(false);
  const points = useRef<Point[]>([]);
  const startPoint = useRef<Point | null>(null);

  const [isCut, setIsCut] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);

  // Setup canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (points.current.length > 1) {
        const start = points.current[0];
        const end = points.current[points.current.length - 1];

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < points.current.length; i++) {
          ctx.lineTo(points.current[i].x, points.current[i].y);
        }

        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, 'rgba(196, 154, 108, 1)');
        gradient.addColorStop(1, 'rgba(196, 154, 108, 0.1)');

        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = gradient;
        ctx.shadowColor = '#c49a6c';
        ctx.shadowBlur = 16;
        ctx.stroke();
      }

      if (points.current.length > 25) {
        points.current.shift();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getCanvasCoordinates = (e: PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const triggerCelebration = () => {
    setIsCut(true);
    playSliceSwoosh();
    setTimeout(() => playSparkleChime(), 200);

    // Blast celebratory confetti
    confetti({
      particleCount: 260,
      spread: 120,
      origin: { y: 0.55 },
      colors: CONFETTI_COLORS,
      gravity: 0.75,
      ticks: 350,
    });

    setTimeout(() => {
      confetti({
        particleCount: 110,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.6 },
        colors: CONFETTI_COLORS,
      });
      confetti({
        particleCount: 110,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.6 },
        colors: CONFETTI_COLORS,
      });
    }, 150);
  };

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (isCut) return;
    isDragging.current = true;
    points.current = [];
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const pt = getCanvasCoordinates(e);
    startPoint.current = pt;
    points.current.push(pt);
    setSwipeProgress(0);
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || isCut) return;
    const pt = getCanvasCoordinates(e);
    points.current.push(pt);

    if (startPoint.current) {
      const dist = calculateDistance(startPoint.current, pt);
      const progress = Math.min((dist / 90) * 100, 100);
      setSwipeProgress(progress);

      if (dist >= 90 && !isCut) {
        triggerCelebration();
        setTimeout(() => {
          points.current = [];
        }, 400);
      }
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const pt = getCanvasCoordinates(e);
    if (startPoint.current && calculateDistance(startPoint.current, pt) >= 75 && !isCut) {
      triggerCelebration();
    } else {
      setSwipeProgress(0);
    }
    setTimeout(() => {
      points.current = [];
    }, 300);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center overflow-hidden relative select-none">
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center"
      >
        {/* Slice gesture drawing canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-20"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            touchAction: 'none',
            pointerEvents: isCut ? 'none' : 'auto',
            cursor: isCut ? 'default' : 'crosshair',
          }}
        />

        <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
          {/* Header text state switch */}
          <AnimatePresence mode="wait">
            {isCut ? (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <motion.h2
                  className="font-playfair text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight"
                  style={{ color: '#9f7b52' }}
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {config.cakeCelebrationText}
                </motion.h2>
                <p className="font-cormorant italic text-lg text-[#b08a60] mt-2 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#9f7b52]" />
                  A sweet wish made with all my heart
                  <Sparkles size={16} className="text-[#9f7b52]" />
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2
                  className="font-playfair text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight"
                  style={{ color: '#9f7b52' }}
                >
                  {config.cakeTitle}
                </h2>
                <p
                  className="font-cormorant italic mt-2 text-base sm:text-lg tracking-wide"
                  style={{ color: '#b08a60' }}
                >
                  Drag your finger / cursor across the cake to slice 🔪
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Birthday Cake Image */}
          <div className="relative mt-8 sm:mt-10 mb-4 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <img
                src="/gifs/2.gif"
                alt="Birthday Cake"
                className="w-60 sm:w-72 md:w-80 object-contain pointer-events-none drop-shadow-[0_15px_35px_rgba(159,123,82,0.25)]"
              />

              {/* Decorative cut mark overlay when cut */}
              {isCut && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-y-8 left-1/2 w-1 -translate-x-1/2 bg-gradient-to-b from-amber-200/80 via-white to-amber-300/80 shadow-[0_0_12px_#fde047] pointer-events-none"
                />
              )}
            </motion.div>
          </div>

          {/* Slicing Progress Meter (while dragging) */}
          {!isCut && swipeProgress > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex flex-col items-center"
            >
              <div className="relative w-14 h-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(159, 123, 82, 0.15)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#9f7b52"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - swipeProgress / 100)}`}
                    className="transition-all duration-75"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-cinzel text-xs font-semibold text-[#9f7b52]">
                  {Math.round(swipeProgress)}%
                </div>
              </div>
              <span className="text-xs font-cinzel text-[#b08a60] mt-1.5 uppercase tracking-widest">
                Keep slicing!
              </span>
            </motion.div>
          )}

          {/* Click to cut fallback if touch/drag is difficult */}
          {!isCut && swipeProgress === 0 && (
            <motion.button
              id="tap-to-cut-cake-btn"
              onClick={triggerCelebration}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              className="mt-4 text-xs font-cinzel tracking-widest text-[#8b6347] underline underline-offset-4 cursor-pointer"
            >
              (Or tap here to cut cake 🎂)
            </motion.button>
          )}

          {/* Next Button matching original aesthetic */}
          {isCut && (
            <motion.button
              id="cake-next-stage-btn"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="flex items-center gap-2.5 px-8 py-3.5 mt-6 border-2 transition-all font-cinzel tracking-wider text-sm font-semibold uppercase hover:bg-[#6f5c42] hover:text-white"
              style={{
                background: 'transparent',
                color: '#6f5c42',
                border: '2px solid #6f5c42',
                borderRadius: '0px',
              }}
            >
              <span>Next</span>
              <ArrowRight size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
