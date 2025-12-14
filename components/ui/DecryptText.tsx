import React, { useState, useEffect } from 'react';

interface DecryptTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

const DecryptText: React.FC<DecryptTextProps> = ({
  text,
  delay = 0,
  speed = 30,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsDecrypting(true);
      let iteration = 0;
      const maxIterations = text.length * 3;

      const interval = setInterval(() => {
        setDisplayText(
          text.split('').map((char, idx) => {
            if (char === ' ') return ' ';
            // Characters before current position show correctly
            if (idx < iteration / 3) return char;
            // Current and future characters are randomized
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('')
        );

        iteration++;

        if (iteration >= maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
          setIsDecrypting(false);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay, speed]);

  return (
    <span className={`decrypt-text ${isDecrypting ? 'text-brass' : ''} ${className}`}>
      {displayText || text.split('').map(() => '_').join('')}
    </span>
  );
};

export default DecryptText;
