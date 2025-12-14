import React, { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchInterval?: number;
}

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  className = '',
  glitchInterval = 5000
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const triggerGlitch = () => {
      if (Math.random() > 0.7) return; // 30% chance to glitch

      setIsGlitching(true);

      let iterations = 0;
      const maxIterations = 8;

      const glitchLoop = setInterval(() => {
        setDisplayText(
          text.split('').map((char, idx) => {
            if (char === ' ') return ' ';
            if (iterations < maxIterations && Math.random() < 0.3) {
              return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            }
            return char;
          }).join('')
        );

        iterations++;

        if (iterations >= maxIterations) {
          clearInterval(glitchLoop);
          setDisplayText(text);
          setIsGlitching(false);
        }
      }, 50);
    };

    const interval = setInterval(triggerGlitch, glitchInterval);
    return () => clearInterval(interval);
  }, [text, glitchInterval]);

  return (
    <span
      className={`${className} ${isGlitching ? 'glitch-active' : ''}`}
      data-text={text}
    >
      {displayText}
    </span>
  );
};

export default GlitchText;
