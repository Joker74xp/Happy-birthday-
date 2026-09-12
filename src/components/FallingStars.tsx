import { useMemo } from 'react';

export function FallingStars() {
  const stars = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: `${(i * 3.6 + Math.random() * 2) % 100}%`,
      delay: `${(i * 0.45).toFixed(2)}s`,
      duration: `${(6 + (i % 5) * 1.5).toFixed(1)}s`,
      size: `${(i % 3) + 2}px`,
      opacity: 0.4 + ((i % 5) * 0.12),
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star-particle"
          style={{
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}
