import { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay?: () => void;
  videoId?: string;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          height?: string | number;
          width?: string | number;
          videoId: string;
          playerVars?: Record<string, any>;
          events?: {
            onReady?: (event: { target: any }) => void;
            onStateChange?: (event: { data: number; target: any }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => any;
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// User's requested song: https://youtu.be/K2aJTT29ZdU
const DEFAULT_VIDEO_ID = 'K2aJTT29ZdU';

export function AudioPlayer({
  isPlaying,
  onTogglePlay,
  videoId = DEFAULT_VIDEO_ID,
}: AudioPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [actualPlaying, setActualPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const startPlayback = useCallback(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.unMute?.();
      playerRef.current.setVolume?.(85);
      playerRef.current.playVideo?.();
    } catch {}
  }, []);

  // Initialize YouTube IFrame API
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      try {
        if (playerRef.current) {
          playerRef.current.destroy?.();
        }

        playerRef.current = new window.YT.Player('youtube-audio-player', {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: videoId, // Required for loop in YouTube Iframe
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              setIsReady(true);
              try {
                event.target.setVolume(85);
                event.target.unMute();
                event.target.playVideo();
              } catch {}
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setActualPlaying(true);
                setLoadError(false);
              } else if (event.data === 2) {
                setActualPlaying(false);
              } else if (event.data === 0) {
                // Loop video
                event.target.seekTo(0);
                event.target.playVideo();
              }
            },
            onError: () => {
              if (!isMounted) return;
              setLoadError(true);
            },
          },
        });
      } catch (err) {
        console.warn('YouTube Player initialization error:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        if (isMounted) {
          initPlayer();
        }
      };
    }

    // Attach global user interaction listeners to bypass strict browser autoplay blocks
    const handleFirstInteraction = () => {
      if (playerRef.current) {
        try {
          playerRef.current.unMute?.();
          playerRef.current.setVolume?.(85);
          playerRef.current.playVideo?.();
        } catch {}
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('pointerdown', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true, passive: true });

    return () => {
      isMounted = false;
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      try {
        if (playerRef.current?.destroy) {
          playerRef.current.destroy();
        }
      } catch {}
    };
  }, [videoId]);

  // React to isPlaying changes from parent
  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo?.();
        if (isMuted) {
          playerRef.current.mute?.();
        } else {
          playerRef.current.unMute?.();
        }
      } else {
        playerRef.current.pauseVideo?.();
      }
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }, [isPlaying, isReady, isMuted]);

  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute?.();
        setIsMuted(false);
      } else {
        playerRef.current.mute?.();
        setIsMuted(true);
      }
    } catch {}
  };

  const handleManualPlay = () => {
    if (!playerRef.current) return;
    try {
      playerRef.current.unMute?.();
      setIsMuted(false);
      playerRef.current.playVideo?.();
      setActualPlaying(true);
      if (onTogglePlay && !isPlaying) {
        onTogglePlay();
      }
    } catch {}
  };

  const handleTogglePausePlay = () => {
    if (!playerRef.current) return;
    try {
      if (actualPlaying) {
        playerRef.current.pauseVideo?.();
        setActualPlaying(false);
      } else {
        startPlayback();
        setActualPlaying(true);
      }
    } catch {}
  };

  return (
    <>
      {/* Invisible YouTube Iframe Container */}
      <div
        className="fixed -top-96 -left-96 opacity-0 pointer-events-none w-1 h-1 overflow-hidden"
        aria-hidden="true"
      >
        <div id="youtube-audio-player" />
      </div>

      {/* Floating Audio Controller Badge */}
      <div
        id="music-player-pill"
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#fffdf9]/90 hover:bg-[#fffdf9] backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#8b6347]/25 shadow-md transition-all select-none"
      >
        {/* Animated visualizer soundwave bars */}
        <div className="flex items-center gap-1">
          <span
            className={`w-1 bg-[#8b6347] rounded-full transition-all ${
              actualPlaying && !isMuted ? 'h-3.5 animate-pulse' : 'h-1 opacity-40'
            }`}
            style={{ animationDuration: '0.5s' }}
          />
          <span
            className={`w-1 bg-[#8b6347] rounded-full transition-all ${
              actualPlaying && !isMuted ? 'h-5 animate-pulse' : 'h-1 opacity-40'
            }`}
            style={{ animationDuration: '0.7s', animationDelay: '0.15s' }}
          />
          <span
            className={`w-1 bg-[#8b6347] rounded-full transition-all ${
              actualPlaying && !isMuted ? 'h-2.5 animate-pulse' : 'h-1 opacity-40'
            }`}
            style={{ animationDuration: '0.6s', animationDelay: '0.3s' }}
          />
        </div>

        <div className="flex items-center gap-1 text-[11px] font-cinzel font-semibold text-[#6d4c2f]">
          <span className="hidden sm:inline">Happy Birthday To You Ji</span>
          <span className="sm:hidden">Music</span>
        </div>

        {/* Play/Pause Button */}
        <button
          id="audio-play-pause-btn"
          onClick={handleTogglePausePlay}
          aria-label={actualPlaying ? 'Pause music' : 'Play music'}
          className="p-1 rounded-full text-[#6d4c2f] hover:text-[#8b6347] transition-colors focus:outline-none cursor-pointer"
          title={actualPlaying ? 'Pause song' : 'Play song'}
        >
          {actualPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        {/* Mute/Unmute Button */}
        <button
          id="audio-mute-toggle-btn"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          className="p-1 rounded-full text-[#6d4c2f] hover:text-[#8b6347] transition-colors focus:outline-none cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Fallback Play button if browser blocked autoplay before user tap */}
        {(!actualPlaying || loadError) && (
          <button
            onClick={handleManualPlay}
            className="text-[11px] text-[#8b6347] underline ml-0.5 font-sans flex items-center gap-1 cursor-pointer"
          >
            <Music size={12} />
            <span>Tap to play</span>
          </button>
        )}
      </div>
    </>
  );
}
