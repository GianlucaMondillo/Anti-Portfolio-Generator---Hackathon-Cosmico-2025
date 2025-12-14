import React, { useState, useEffect } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string | number;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, transitionKey }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayContent, setDisplayContent] = useState(children);
  const [glitchLines, setGlitchLines] = useState<number[]>([]);

  useEffect(() => {
    // Start transition
    setIsTransitioning(true);

    // Generate random glitch line positions
    const lines = Array.from({ length: 8 }, () => Math.random() * 100);
    setGlitchLines(lines);

    // After glitch animation, swap content
    const swapTimer = setTimeout(() => {
      setDisplayContent(children);
    }, 150);

    // End transition
    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(endTimer);
    };
  }, [transitionKey]);

  return (
    <div className="relative">
      {/* Glitch overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {/* Horizontal glitch lines */}
          {glitchLines.map((top, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-[2px] bg-brass/60"
              style={{
                top: `${top}%`,
                animation: `glitch-line 0.1s ease-out ${i * 20}ms`,
                transform: `translateX(${(Math.random() - 0.5) * 20}px)`
              }}
            />
          ))}

          {/* Color aberration layers */}
          <div
            className="absolute inset-0 bg-white/5 mix-blend-screen"
            style={{ transform: 'translateX(-3px)' }}
          />
          <div
            className="absolute inset-0 bg-gray-400/10 mix-blend-screen"
            style={{ transform: 'translateX(3px)' }}
          />

          {/* Flash */}
          <div className="absolute inset-0 bg-brass/5 animate-flash" />
        </div>
      )}

      {/* Content with fade */}
      <div
        className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
      >
        {displayContent}
      </div>
    </div>
  );
};

export default PageTransition;
