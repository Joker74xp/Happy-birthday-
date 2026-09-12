/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppStage, BirthdayConfig } from './types';
import { DEFAULT_CONFIG, loadConfigFromUrl } from './data/defaultConfig';
import { FallingStars } from './components/FallingStars';
import { AudioPlayer } from './components/AudioPlayer';
import { HeartEntrance } from './components/HeartEntrance';
import { LetterStage } from './components/LetterStage';
import { CakeCuttingStage } from './components/CakeCuttingStage';
import { PasskeyStage } from './components/PasskeyStage';
import { MemoriesStage } from './components/MemoriesStage';
import { CelebrationFinale } from './components/CelebrationFinale';

export default function App() {
  const [config, setConfig] = useState<BirthdayConfig>(DEFAULT_CONFIG);
  const [stage, setStage] = useState<AppStage>('heart');
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  useEffect(() => {
    const loaded = loadConfigFromUrl();
    setConfig(loaded);
  }, []);

  const handleStart = () => {
    setIsMusicPlaying(true);
    setStage('letter');
  };

  const handleRestart = () => {
    setStage('heart');
  };

  return (
    <main className="w-screen min-h-screen overflow-x-hidden relative select-none bg-radial-[circle_at_50%_30%] from-[#fffaf0] via-[#faecc8] to-[#f5dec0] text-[#4a3b32] font-playpen">
      {/* Ambient falling stars and particles */}
      <FallingStars />

      {/* Floating Music Controller */}
      <AudioPlayer
        isPlaying={isMusicPlaying}
        videoId={config.musicVideoId}
        onTogglePlay={() => setIsMusicPlaying((prev) => !prev)}
      />

      {/* Main Flow Stage Views */}
      <AnimatePresence mode="wait">
        {stage === 'heart' && (
          <motion.div
            key="stage-heart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HeartEntrance
              recipientName={config.recipientName}
              onStart={handleStart}
            />
          </motion.div>
        )}

        {stage === 'letter' && (
          <motion.div
            key="stage-letter"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6 }}
          >
            <LetterStage
              config={config}
              onNext={() => setStage('cake')}
            />
          </motion.div>
        )}

        {stage === 'cake' && (
          <motion.div
            key="stage-cake"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            <CakeCuttingStage
              config={config}
              onNext={() => setStage('passkey')}
            />
          </motion.div>
        )}

        {stage === 'passkey' && (
          <motion.div
            key="stage-passkey"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6 }}
          >
            <PasskeyStage
              config={config}
              onNext={() => {
                if (config.memories && config.memories.length > 0) {
                  setStage('memories');
                } else {
                  setStage('celebration');
                }
              }}
            />
          </motion.div>
        )}

        {stage === 'memories' && (
          <motion.div
            key="stage-memories"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6 }}
          >
            <MemoriesStage
              config={config}
              onNext={() => setStage('celebration')}
              onRestart={handleRestart}
            />
          </motion.div>
        )}

        {stage === 'celebration' && (
          <motion.div
            key="stage-celebration"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6 }}
          >
            <CelebrationFinale
              config={config}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator Credit at bottom-right */}
      <div
        id="creator-credit"
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffdf9]/85 hover:bg-[#fffdf9] backdrop-blur-md border border-[#8b6347]/25 shadow-sm transition-all hover:shadow-md"
      >
        <span className="font-cormorant italic text-[11px] sm:text-xs text-[#8b6347]/80">Created by</span>
        <span className="font-cinzel text-xs font-bold text-[#6d4c2f] tracking-wide">@Subham</span>
      </div>
    </main>
  );
}

