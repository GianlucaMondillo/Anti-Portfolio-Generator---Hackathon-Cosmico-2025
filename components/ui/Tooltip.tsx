import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 400
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let x = rect.left + rect.width / 2;
        let y = rect.top;

        switch (position) {
          case 'bottom':
            y = rect.bottom + 8;
            break;
          case 'left':
            x = rect.left - 8;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right + 8;
            y = rect.top + rect.height / 2;
            break;
          default: // top
            y = rect.top - 8;
        }

        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'translate-x-[-50%]';
      case 'left':
        return 'translate-x-[-100%] translate-y-[-50%]';
      case 'right':
        return 'translate-y-[-50%]';
      default:
        return 'translate-x-[-50%] translate-y-[-100%]';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`fixed z-[9999] px-3 py-2 text-[10px] font-mono
            bg-ink border border-brass/50 text-paper shadow-lg
            animate-fade-in whitespace-nowrap ${getPositionClasses()}`}
          style={{ left: coords.x, top: coords.y }}
        >
          <div className="relative">
            {content}
            <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-brass/50" />
            <div className="absolute -top-px -right-px w-2 h-2 border-r border-t border-brass/50" />
            <div className="absolute -bottom-px -left-px w-2 h-2 border-l border-b border-brass/50" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-r border-b border-brass/50" />
          </div>
        </div>
      )}
    </>
  );
};

export default Tooltip;
