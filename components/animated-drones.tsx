'use client';

export function AnimatedDrones() {
  const dronePositions = [
    { delay: 0, duration: 20, startX: -100, startY: 50, endX: 'calc(100vw + 100px)', endY: 'calc(100vh - 100px)' },
    { delay: 3, duration: 25, startX: 'calc(100vw + 100px)', startY: 100, endX: -100, endY: 'calc(100vh - 200px)', reverse: true },
    { delay: 6, duration: 22, startX: 200, startY: -100, endX: 'calc(100vw - 200px)', endY: 'calc(100vh + 100px)' },
    { delay: 10, duration: 28, startX: 'calc(100vw + 100px)', startY: 'calc(100vh + 100px)', endX: -200, endY: -100, reverse: true },
    { delay: 2, duration: 24, startX: -100, startY: 'calc(100vh + 100px)', endX: 'calc(100vw + 100px)', endY: -100 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {dronePositions.map((drone, idx) => (
        <div
          key={idx}
          className="absolute w-16 h-16"
          style={{
            animation: `drone-fly ${drone.duration}s linear infinite`,
            animationDelay: `${drone.delay}s`,
            left: drone.startX,
            top: drone.startY,
          }}
        >
          {/* Drone SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full opacity-60 hover:opacity-100 transition-opacity"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.5))',
            }}
          >
            {/* Drone body */}
            <g>
              {/* Center body */}
              <circle cx="50" cy="50" r="8" fill="#00d9ff" opacity="0.8" />
              {/* Center glow */}
              <circle cx="50" cy="50" r="12" fill="none" stroke="#00d9ff" strokeWidth="1" opacity="0.3" />

              {/* Arms */}
              <line x1="50" y1="50" x2="20" y2="50" stroke="#00d9ff" strokeWidth="2" />
              <line x1="50" y1="50" x2="80" y2="50" stroke="#00d9ff" strokeWidth="2" />
              <line x1="50" y1="50" x2="50" y2="20" stroke="#00d9ff" strokeWidth="2" />
              <line x1="50" y1="50" x2="50" y2="80" stroke="#00d9ff" strokeWidth="2" />

              {/* Propellers */}
              <g>
                {/* Top-left */}
                <ellipse cx="20" cy="50" rx="8" ry="14" fill="none" stroke="#00ff88" strokeWidth="1.5" opacity="0.7" />
                <circle cx="20" cy="50" r="3" fill="#00ff88" />

                {/* Top-right */}
                <ellipse cx="80" cy="50" rx="8" ry="14" fill="none" stroke="#00ff88" strokeWidth="1.5" opacity="0.7" />
                <circle cx="80" cy="50" r="3" fill="#00ff88" />

                {/* Bottom */}
                <ellipse cx="50" cy="20" rx="14" ry="8" fill="none" stroke="#00ff88" strokeWidth="1.5" opacity="0.7" />
                <circle cx="50" cy="20" r="3" fill="#00ff88" />

                {/* Top */}
                <ellipse cx="50" cy="80" rx="14" ry="8" fill="none" stroke="#00ff88" strokeWidth="1.5" opacity="0.7" />
                <circle cx="50" cy="80" r="3" fill="#00ff88" />
              </g>

              {/* Direction indicator */}
              <path d="M 50 50 L 65 45 L 70 50 L 65 55 Z" fill="#ff6b35" opacity="0.6" />
            </g>
          </svg>
        </div>
      ))}

      {/* Ambient glow background elements */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
    </div>
  );
}
