import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserMaterials } from '../types';
import { startInterview, continueInterview } from '../services/geminiService';

interface Step2Props {
  materials: UserMaterials;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onFinish: () => void;
  onBack: () => void;
}

const MAX_QUESTIONS = 6;

// Memoized Chat Display to prevent re-renders when input changes
const ChatDisplay = React.memo(({ chatHistory, isLoading }: { chatHistory: ChatMessage[], isLoading: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 font-mono text-sm relative">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
            <span className="text-[9px] text-paper-muted mb-1 uppercase tracking-widest opacity-60">
                {msg.role === 'user' ? `USER@NODE_${Math.floor(Math.random()*99)}` : 'SYSTEM_CORE'}
            </span>
            <div 
              className={`max-w-[85%] p-4 border relative ${
                msg.role === 'user' 
                  ? 'bg-brass/5 border-brass/30 text-paper rounded-bl-lg' 
                  : 'bg-ink border-border/80 text-paper-muted shadow-lg'
              }`}
            >
              <div className="relative animate-fade-in">
                  {msg.role === 'model' && <span className="text-brass absolute -left-3 top-0 opacity-50">›</span>}
                  {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start animate-fade-in">
             <span className="text-[9px] text-paper-muted mb-1 uppercase tracking-widest opacity-60">SYSTEM_CORE</span>
             <div className="bg-ink border border-border/50 p-3 flex items-center gap-3">
                 <div className="flex gap-1">
                     <div className="w-1 h-3 bg-brass animate-pulse"></div>
                     <div className="w-1 h-3 bg-brass animate-pulse delay-75"></div>
                     <div className="w-1 h-3 bg-brass animate-pulse delay-150"></div>
                 </div>
                 <span className="text-xs text-brass font-mono animate-pulse">ANALYZING INPUT...</span>
             </div>
          </div>
        )}
      </div>
  );
});

const Step2Interview: React.FC<Step2Props> = ({ materials, chatHistory, setChatHistory, onFinish, onBack }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const initialized = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const initChat = async () => {
      // If history exists, sync state and return
      if (chatHistory.length > 0) {
        const modelMsgs = chatHistory.filter(m => m.role === 'model').length;
        setQuestionCount(modelMsgs);
        return;
      }

      // Prevent double initialization
      if (initialized.current) return;
      initialized.current = true;

      setIsLoading(true);
      try {
        const firstQuestion = await startInterview(materials);
        setChatHistory([{ role: 'model', content: firstQuestion }]);
        setQuestionCount(1);
      } catch (e) {
          setChatHistory([{ role: 'model', content: "Errore di connessione neurale. Procedere manualmente." }]);
      } finally {
        setIsLoading(false);
        // Focus input after loading completes
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !overrideInput) return;

    // Prevent sending if already loading, but allow typing
    if (isLoading) return;

    const updatedHistory = [...chatHistory, { role: 'user', content: textToSend } as ChatMessage];
    setChatHistory(updatedHistory);
    setInput('');
    setIsLoading(true);

    if (questionCount >= MAX_QUESTIONS) {
        setTimeout(() => onFinish(), 1500);
        return;
    }

    try {
        const nextQuestion = await continueInterview(updatedHistory, textToSend, questionCount);
        setChatHistory([...updatedHistory, { role: 'model', content: nextQuestion }]);
        setQuestionCount(prev => prev + 1);
    } catch (e) {
        onFinish();
    } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[700px] border border-border/60 bg-ink-light/30 backdrop-blur-sm relative shadow-2xl overflow-hidden rounded-sm">
      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brass/50 to-transparent opacity-50 pointer-events-none"></div>
      <div className="absolute top-0 right-0 p-2 text-[9px] font-mono text-brass/40 z-10 pointer-events-none">SECURE_CHANNEL_v9.2</div>
      <div className="absolute bottom-0 left-0 p-2 text-[9px] font-mono text-brass/40 z-10 pointer-events-none">ENC: AES-256</div>

      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border/60 bg-ink/80 backdrop-blur z-20">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-6 h-6 border border-border flex items-center justify-center text-paper-muted hover:text-white hover:border-white transition-all text-xs">←</button>
            <div className="flex flex-col">
                <span className="text-xs font-bold font-mono text-paper tracking-widest">INTERVISTA TATTICA</span>
                <span className="text-[10px] text-paper-muted font-mono">Status: <span className="text-terminal-green animate-pulse">LIVE</span></span>
            </div>
        </div>
        <div className="flex items-center gap-4">
            {/* Contatore domande */}
            <div className="text-right">
                <div className="text-[10px] text-paper-muted font-mono uppercase tracking-wider">Domande</div>
                <div className="text-sm font-mono text-brass font-bold">
                    {questionCount} / {MAX_QUESTIONS}
                </div>
            </div>
            {/* Barra progresso */}
            <div className="flex gap-0.5">
                 {Array.from({ length: MAX_QUESTIONS }, (_, i) => i + 1).map(i => (
                     <div key={i} className={`w-4 h-1.5 transition-all ${i <= questionCount ? 'bg-brass shadow-[0_0_5px_#c2a878]' : 'bg-border'}`}></div>
                 ))}
            </div>
        </div>
      </div>

      {/* Separated Chat Display */}
      <ChatDisplay chatHistory={chatHistory} isLoading={isLoading} />

      {/* Input Console */}
      <div className="bg-ink border-t border-border p-4 z-20">
        <div className="relative group">
          {/* Decorative background with pointer-events-none to prevent blocking clicks */}
          <div className="absolute inset-0 bg-brass/5 blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
          
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digitare risposta..."
            className="w-full bg-ink-light border border-border p-4 pl-10 text-sm font-mono text-paper focus:border-brass/70 focus:text-white outline-none resize-none h-24 placeholder-zinc-700 transition-colors shadow-inner relative z-10"
            disabled={false} 
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
          <div className="absolute left-4 top-4 text-brass animate-pulse z-20 pointer-events-none">›</div>
          
          <div className="absolute right-4 bottom-4 flex gap-3 z-20">
             <button
               onClick={() => handleSend("Skipped")}
               className="text-[10px] text-paper-muted hover:text-white font-mono uppercase transition-colors px-2 py-1"
               disabled={isLoading}
            >
              [ SKIP ]
            </button>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-brass hover:bg-brass-hover text-ink px-4 py-1 text-xs font-bold font-mono uppercase transition-all hover:shadow-[0_0_15px_rgba(194,168,120,0.4)] disabled:opacity-50 disabled:shadow-none transition-opacity"
            >
              {isLoading ? 'SENDING...' : 'TRANSMIT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Interview;