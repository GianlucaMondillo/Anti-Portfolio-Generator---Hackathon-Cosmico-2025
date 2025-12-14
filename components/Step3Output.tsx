import React, { useState, useEffect, useRef } from 'react';
import { AntiPortfolio, ChatMessage, UserMaterials, StyleDNA } from '../types';
import { generateAntiPortfolio } from '../services/geminiService';
import DynamicRenderer from './DynamicRenderer';
import DecryptText from './ui/DecryptText';
import Tooltip from './ui/Tooltip';
import RippleButton from './ui/RippleButton';

// Lo stile viene generato interamente dall'AI basandosi sulla personalita'
// L'utente puo' modificarlo solo tramite il Visual Tuner

interface Step3Props {
  history: ChatMessage[];
  materials: UserMaterials;
  existingData: AntiPortfolio | null;
  onDataGenerated: (data: AntiPortfolio) => void;
  onReset: () => void;
  onBack: () => void;
}

// Mini-map sections configuration
const SECTIONS = [
  { id: 'signature', label: 'Identita', icon: '[ID]' },
  { id: 'methodology', label: 'Metodo', icon: '[MT]' },
  { id: 'failures', label: 'Fallimenti', icon: '[FL]' },
  { id: 'patterns', label: 'Pattern', icon: '[PT]' },
  { id: 'projects', label: 'Progetti', icon: '[PJ]' },
  { id: 'proof', label: 'Prove', icon: '[PR]' }
];

const Step3Output: React.FC<Step3Props> = ({ history, materials, existingData, onDataGenerated, onBack }) => {
  const [data, setData] = useState<AntiPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Regeneration state
  const [variantCount, setVariantCount] = useState(0);

  // Loading Animation State
  const [progress, setProgress] = useState(0);
  const [loadingLog, setLoadingLog] = useState<string[]>([]);
  const progressRef = useRef<any>(null);

  // Customization State
  const [showTuner, setShowTuner] = useState(false);
  const [customDNA, setCustomDNA] = useState<StyleDNA | null>(null);

  // Mini-map state
  const [activeSection, setActiveSection] = useState<string>('signature');
  const [showMinimap, setShowMinimap] = useState(true);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // Track scroll position for minimap
  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTIONS.map(s => ({
        id: s.id,
        element: document.getElementById(`section-${s.id}`)
      })).filter(s => s.element);

      for (const section of sections.reverse()) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data]);

  // Nessun fallback hardcoded - l'AI deve generare tutto
  // In caso di errore, l'utente deve riprovare

  const addLog = (msg: string) => {
    setLoadingLog(prev => [...prev.slice(-4), `> ${msg}`]);
  };

  const generate = async (retryMode: boolean = false, isRegeneration: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setLoadingLog([isRegeneration ? "> RE-INITIALIZING..." : "> INITIALIZING GENERATION SEQUENCE..."]);
    
    // Increment variant count if this is a regeneration attempt
    const currentVariant = isRegeneration ? variantCount + 1 : variantCount;
    if (isRegeneration) setVariantCount(currentVariant);

    // Fake progress simulation - Due fasi: dati + HTML
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
        setProgress(prev => {
            const increment = Math.random() * 1.5;
            const newProg = prev + increment;

            // Fase 1: Generazione dati (0-50%)
            if (prev < 15 && newProg >= 15) addLog("PARSING RAW MATERIALS...");
            if (prev < 30 && newProg >= 30) addLog("DECONSTRUCTING CAREER PATH...");
            if (prev < 45 && newProg >= 45) addLog(isRegeneration ? "APPLYING NEW PERSONA..." : "SYNTHESIZING FAILURE PATTERNS...");

            // Fase 2: Generazione HTML (50-90%)
            if (prev < 55 && newProg >= 55) addLog("GENERATING UNIQUE HTML LAYOUT...");
            if (prev < 70 && newProg >= 70) addLog("DESIGNING VISUAL IDENTITY...");
            if (prev < 85 && newProg >= 85) addLog("APPLYING CSS ANIMATIONS...");

            // Stall at 90% until done
            return newProg > 90 ? 90 : newProg;
        });
    }, 180);

    try {
      const mode = retryMode ? 'lite' : 'fast';
      const result = await generateAntiPortfolio(history, materials, mode, currentVariant);
      
      // Complete animation
      clearInterval(progressRef.current);
      setProgress(100);
      addLog("FINALIZING RENDER...");
      
      setTimeout(() => {
        setData(result);
        setCustomDNA(result.style_dna);
        onDataGenerated(result);
        setIsLoading(false);
      }, 800);

    } catch (e: any) {
      clearInterval(progressRef.current);
      if (!retryMode) {
          try {
              addLog("ERROR DETECTED. RETRYING WITH LITE MODEL...");
              const resultLite = await generateAntiPortfolio(history, materials, 'lite', currentVariant);
              setProgress(100);
              setTimeout(() => {
                setData(resultLite);
                setCustomDNA(resultLite.style_dna);
                onDataGenerated(resultLite);
                setIsLoading(false);
              }, 500);
          } catch (e2) {
              setError("Generazione fallita. Dati insufficienti o errore di rete.");
              setIsLoading(false);
          }
      } else {
           setError("Generazione fallita. Dati insufficienti o errore di rete.");
           setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
        if(progressRef.current) clearInterval(progressRef.current);
    }
  }, []);

  useEffect(() => {
    if (existingData) {
        setData(existingData);
        if (!customDNA) setCustomDNA(existingData.style_dna);
    } else {
        generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMarkdown = (d: AntiPortfolio) => {
      return `# ${d.meta.name || 'Anti-Portfolio'}
## ${d.anti_title}
> "${d.signature.one_sentence}"

### Cosa faccio meglio di molti
${d.signature.edge}

---
### Come lavoro (Metodo)
${d.method_stack.map((s, i) => `${i+1}. **${s.step}**: ${s.description}`).join('\n')}

### Errori Utili
${d.failure_ledger.map(f => `- **Errore**: ${f.failure}\n  - *Regola*: ${f.rule_created}`).join('\n')}

### Prove
${d.proof_layer.map(p => {
    const link = p.evidence && p.evidence.length > 0 ? `(${p.evidence[0].url})` : '[Autodichiarazione]';
    return `- ${p.claim_text} ${link}`;
}).join('\n')}

### Cosa non faccio
${d.signature.non_goals.map(g => `- ${g}`).join('\n')}
`;
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadHTML = () => {
      if (!data) return;

      // Se abbiamo l'HTML generato dall'AI, usalo direttamente
      if (data.generated_html) {
        const fileName = `${data.meta.name?.replace(/\s+/g, '_') || 'portfolio'}.html`;
        downloadFile(fileName, data.generated_html, 'text/html');
        return;
      }

      // Fallback: genera HTML dal rendering React (legacy)
      const renderContent = document.getElementById('render-root')?.innerHTML;
      if (!renderContent) {
        console.error('Nessun contenuto da esportare');
        return;
      }

      const palette = customDNA?.palette || data.style_dna?.palette || {
        background: '#ffffff',
        surface: '#f8f8f8',
        text: '#1a1a1a',
        accent: '#0066cc',
        secondary: '#666666',
        border: '#e0e0e0'
      };

      const typography = customDNA?.typography || data.style_dna?.typography || {
        heading_font: 'system-ui, -apple-system, sans-serif',
        body_font: 'system-ui, -apple-system, sans-serif',
        heading_size: '2rem',
        body_size: '1rem',
        heading_weight: '700',
        body_weight: '400',
        line_height: '1.6',
        letter_spacing: '0',
        text_transform: 'none'
      };

      const css = `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          background-color: ${palette.background};
          color: ${palette.text};
          font-family: ${typography.body_font};
          line-height: ${typography.line_height};
          min-height: 100vh;
        }
        h1, h2, h3 {
          font-family: ${typography.heading_font};
          font-weight: ${typography.heading_weight};
        }
        a { color: ${palette.accent}; }
      `;

      const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.meta.name || 'Anti-Portfolio'}</title>
  <style>${css}</style>
</head>
<body>
${renderContent}
</body>
</html>`;

      const fileName = `${data.meta.name?.replace(/\s+/g, '_') || 'portfolio'}.html`;
      downloadFile(fileName, html, 'text/html');
  };

  // Copia JSON negli appunti (dati reali, non link fake)
  const handleCopyJSON = () => {
      if (data) {
          navigator.clipboard.writeText(JSON.stringify(data, null, 2));
          setCopyFeedback("JSON COPIATO");
          setTimeout(() => setCopyFeedback(null), 2000);
      }
  };

  // --- UI COMPONENTS ---

  // Calcola luminosita' di un colore hex e restituisce il colore testo appropriato
  const getContrastTextColor = (hexBg: string): string => {
    const hex = hexBg.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Formula luminosita' percepita
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a1a' : '#f0f0f0';
  };

  // Aggiorna sfondo e auto-corregge colore testo
  const handleBackgroundChange = (newBg: string) => {
    const autoText = getContrastTextColor(newBg);
    setCustomDNA({
      ...customDNA,
      palette: { ...customDNA.palette, background: newBg, text: autoText }
    });
  };

  const TunerControl = ({ label, children }: { label: string, children: React.ReactNode }) => (
      <div className="mb-4">
          <label className="block text-[10px] uppercase font-mono text-paper-muted tracking-widest mb-2">{label}</label>
          {children}
      </div>
  );

  const StyleButton = ({ active, onClick, label }: any) => (
      <button 
        onClick={onClick}
        className={`px-2 py-1 text-[10px] font-mono border rounded mr-2 mb-2 ${active ? 'bg-brass text-ink border-brass' : 'border-border text-paper-muted hover:border-paper'}`}
      >
          {label}
      </button>
  );

  // Cinematic Loader with Decryption Effect
  if (isLoading) {
    const phase = progress < 30 ? "DATA INGESTION" : progress < 70 ? "PATTERN SYNTHESIS" : "RENDERING";
    const phaseDescriptions = [
      { threshold: 10, text: "INITIALIZING NEURAL PATHWAYS" },
      { threshold: 25, text: "SCANNING CAREER ARTIFACTS" },
      { threshold: 40, text: "EXTRACTING FAILURE PATTERNS" },
      { threshold: 55, text: "MAPPING DECISION TREES" },
      { threshold: 70, text: "SYNTHESIZING IDENTITY MATRIX" },
      { threshold: 85, text: "COMPILING VISUAL DNA" },
      { threshold: 95, text: "FINALIZING RENDER SEQUENCE" }
    ];
    const currentPhaseText = phaseDescriptions.filter(p => progress >= p.threshold).pop()?.text || "STANDBY";

    return (
      <div className="flex flex-col items-center justify-center h-[650px] border border-border/50 bg-ink-light/20 backdrop-blur-sm relative overflow-hidden rounded">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(194,168,120,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(194,168,120,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brass/40 to-transparent animate-scan"></div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-brass/30"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-brass/30"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-brass/30"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-brass/30"></div>

        <div className="relative z-10 w-full max-w-xl p-8 space-y-8">
            {/* Header with decrypt effect */}
            <div className="text-center space-y-2">
                <div className="text-[10px] font-mono text-paper-muted uppercase tracking-[0.3em]">
                  <DecryptText text="ANTI-PORTFOLIO GENERATION SYSTEM" delay={0} speed={20} />
                </div>
                <h3 className="font-mono text-brass text-2xl font-bold tracking-widest uppercase">
                  <DecryptText text={phase} delay={200} speed={40} />
                </h3>
            </div>

            {/* Progress visualization */}
            <div className="space-y-4">
                {/* Main progress bar */}
                <div className="relative">
                    <div className="h-3 w-full bg-ink border border-border rounded-sm overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-brass/80 to-brass transition-all duration-300 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[pulse_1s_ease-in-out_infinite]"></div>
                        </div>
                    </div>
                    {/* Progress markers */}
                    <div className="absolute top-0 left-0 right-0 h-full flex justify-between px-1 pointer-events-none">
                      {[25, 50, 75].map(mark => (
                        <div key={mark} className="w-px h-full bg-border/50" style={{ marginLeft: `${mark}%` }}></div>
                      ))}
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-paper-muted">PROGRESS</span>
                    <span className="text-brass font-bold">{Math.round(progress)}% COMPLETE</span>
                </div>
            </div>

            {/* Current operation display */}
            <div className="bg-ink/80 border border-brass/20 p-4 rounded">
                <div className="text-[9px] font-mono text-paper-muted uppercase tracking-widest mb-2">Current Operation</div>
                <div className="font-mono text-sm text-brass">
                  <DecryptText text={currentPhaseText} delay={0} speed={25} key={currentPhaseText} />
                </div>
            </div>

            {/* Terminal Log */}
            <div className="h-36 bg-ink border border-border/50 p-4 font-mono text-[10px] text-paper-muted flex flex-col justify-end gap-1 shadow-inner rounded overflow-hidden relative">
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(194,168,120,0.1)_2px,rgba(194,168,120,0.1)_4px)]"></div>

                {loadingLog.map((log, i) => (
                    <div key={i} className="animate-fade-in opacity-80 border-l-2 border-transparent hover:border-brass/50 pl-2 relative z-10">
                        <span className="text-brass/60">[{String(i).padStart(2, '0')}]</span> {log.replace('> ', '')}
                    </div>
                ))}
                <div className="animate-pulse text-brass relative z-10">{'>'}_</div>
            </div>

            {/* Bottom status */}
            <div className="flex justify-center">
                <div className="flex items-center gap-2 text-[9px] font-mono text-paper-muted">
                    <span className="w-2 h-2 bg-brass rounded-full animate-pulse"></span>
                    <span>NEURAL NETWORK ACTIVE</span>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 border border-alert/30 bg-alert/5 rounded relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(138,44,44,0.05)_0,rgba(138,44,44,0.05)_10px,transparent_0,transparent_20px)]"></div>
        <div className="relative z-10">
            <h3 className="text-2xl font-bold text-alert mb-2">ERRORE DI GENERAZIONE</h3>
            <p className="mb-6 font-mono text-sm text-paper-muted">{error}</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => generate(true)} className="bg-paper hover:bg-white text-ink px-6 py-3 font-bold font-mono tracking-widest uppercase text-xs transition-colors">
                    Riprova (Lite Mode)
                </button>
                <button onClick={onBack} className="border border-paper text-paper hover:bg-paper/10 px-6 py-3 font-bold font-mono tracking-widest uppercase text-xs transition-colors">
                    Torna all'Intervista
                </button>
            </div>
        </div>
      </div>
    );
  }

  if (!data || !customDNA) return null;

  // Merge data with custom DNA overrides
  const renderData = { ...data, style_dna: customDNA };

  return (
    <div className="animate-fade-in pb-32 relative">

      {/* MINI-MAP Navigation */}
      {showMinimap && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
          <div className="bg-ink/90 backdrop-blur-sm border border-border/50 rounded-lg p-3 space-y-1">
            <div className="text-[8px] font-mono text-paper-muted uppercase tracking-widest mb-3 text-center">
              NAV
            </div>
            {SECTIONS.map((section) => (
              <Tooltip key={section.id} content={section.label} position="right">
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`minimap-item w-full px-2 py-1.5 text-left text-[10px] font-mono border-l-2 transition-all ${
                    activeSection === section.id
                      ? 'border-l-brass text-brass bg-brass/10'
                      : 'border-l-transparent text-paper-muted hover:text-paper hover:border-l-paper-muted'
                  }`}
                >
                  {section.icon}
                </button>
              </Tooltip>
            ))}
            <div className="border-t border-border/50 pt-2 mt-2">
              <button
                onClick={() => setShowMinimap(false)}
                className="w-full text-[8px] font-mono text-paper-muted hover:text-paper text-center"
              >
                [HIDE]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show minimap button when hidden */}
      {!showMinimap && (
        <button
          onClick={() => setShowMinimap(true)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex items-center justify-center w-8 h-8 bg-ink/90 border border-border/50 rounded text-paper-muted hover:text-brass hover:border-brass transition-all"
        >
          <span className="text-[10px] font-mono">[+]</span>
        </button>
      )}

      {/* TUNER PANEL (Absolute or Floating) */}
      {showTuner && (
          <div className="fixed top-24 right-4 z-50 w-80 bg-ink border border-brass/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 rounded-lg animate-fade-in overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-6 border-b border-border pb-2">
                  <h3 className="text-brass font-bold font-mono uppercase tracking-widest">Visual Tuner</h3>
                  <button onClick={() => setShowTuner(false)} className="text-paper-muted hover:text-white">[X]</button>
              </div>

              <TunerControl label="Tema">
                  <div className="text-xs font-mono text-brass mb-2">{customDNA.theme_name || 'AI Generated'}</div>
                  <div className="text-[8px] text-paper-muted leading-relaxed">
                    Lo stile e' generato interamente dall'AI in base alla tua personalita'.
                  </div>
              </TunerControl>

              <TunerControl label="Colore Accent">
                  <div className="flex gap-2">
                      <input
                        type="color"
                        value={customDNA.palette.accent}
                        onChange={(e) => setCustomDNA({...customDNA, palette: { ...customDNA.palette, accent: e.target.value }})}
                        className="w-10 h-10 rounded border border-border bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customDNA.palette.accent}
                        onChange={(e) => setCustomDNA({...customDNA, palette: { ...customDNA.palette, accent: e.target.value }})}
                        className="flex-1 bg-ink-light border border-border px-3 py-2 text-xs font-mono text-paper rounded"
                      />
                  </div>
              </TunerControl>

              <TunerControl label="Colore Sfondo">
                  <div className="flex gap-2">
                      <input
                        type="color"
                        value={customDNA.palette.background}
                        onChange={(e) => handleBackgroundChange(e.target.value)}
                        className="w-10 h-10 rounded border border-border bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customDNA.palette.background}
                        onChange={(e) => handleBackgroundChange(e.target.value)}
                        className="flex-1 bg-ink-light border border-border px-3 py-2 text-xs font-mono text-paper rounded"
                      />
                  </div>
                  <div className="text-[9px] text-paper-muted mt-1">Il colore testo si adatta automaticamente</div>
              </TunerControl>

              <TunerControl label="Colore Testo">
                  <div className="flex gap-2">
                      <StyleButton
                        label="CHIARO"
                        active={customDNA.palette.text === '#ffffff' || customDNA.palette.text === '#f8f8f8' || customDNA.palette.text === '#e0e0e0'}
                        onClick={() => setCustomDNA({...customDNA, palette: { ...customDNA.palette, text: '#f0f0f0' }})}
                      />
                      <StyleButton
                        label="SCURO"
                        active={customDNA.palette.text === '#000000' || customDNA.palette.text === '#1a1a1a' || customDNA.palette.text === '#1e293b'}
                        onClick={() => setCustomDNA({...customDNA, palette: { ...customDNA.palette, text: '#1a1a1a' }})}
                      />
                  </div>
              </TunerControl>

              <TunerControl label="Font Titoli">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: 'SANS', value: 'system-ui, -apple-system, sans-serif' },
                      { label: 'SERIF', value: 'Georgia, Cambria, serif' },
                      { label: 'MONO', value: 'ui-monospace, SFMono-Regular, monospace' }
                    ].map(font => (
                        <StyleButton
                          key={font.label}
                          label={font.label}
                          active={customDNA.typography?.heading_font?.includes(font.label.toLowerCase())}
                          onClick={() => setCustomDNA({...customDNA, typography: { ...customDNA.typography, heading_font: font.value }})}
                        />
                    ))}
                  </div>
              </TunerControl>

              <TunerControl label="Font Corpo">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: 'SANS', value: 'system-ui, -apple-system, sans-serif' },
                      { label: 'SERIF', value: 'Georgia, Cambria, serif' },
                      { label: 'MONO', value: 'ui-monospace, SFMono-Regular, monospace' }
                    ].map(font => (
                        <StyleButton
                          key={font.label}
                          label={font.label}
                          active={customDNA.typography?.body_font?.includes(font.label.toLowerCase())}
                          onClick={() => setCustomDNA({...customDNA, typography: { ...customDNA.typography, body_font: font.value }})}
                        />
                    ))}
                  </div>
              </TunerControl>
          </div>
      )}

      {/* Floating Control Bar */}
      <div className="sticky top-28 z-40 mb-12 mx-auto max-w-6xl">
          <div className="glass-panel p-4 rounded-lg shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6 border border-brass/20">
              
              <div className="flex items-center gap-4 w-full xl:w-auto">
                 {/* VISUAL TUNER TOGGLE */}
                 <button
                    onClick={() => setShowTuner(!showTuner)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-sm transition-all ${
                        showTuner ? 'bg-brass text-ink border-brass' : 'bg-ink border-brass text-brass hover:bg-brass/10'
                    }`}
                 >
                     <span className="text-xs font-mono">[T]</span>
                     <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Visual Tuner</span>
                 </button>

              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                  <Tooltip content="Genera una nuova versione con prospettiva diversa" position="bottom">
                    <RippleButton
                      onClick={() => generate(false, true)}
                      className="flex items-center gap-2 px-3 py-2 border border-border bg-ink hover:border-brass text-paper-muted hover:text-brass transition-colors rounded-sm hover-glow"
                    >
                        <span className="text-xs">[R]</span>
                        <span className="font-mono text-[10px] uppercase tracking-widest">Rigenera (V.{variantCount})</span>
                    </RippleButton>
                  </Tooltip>

                  <div className="w-px h-8 bg-border hidden xl:block"></div>

                  <Tooltip content="Copia i dati JSON negli appunti" position="bottom">
                    <RippleButton
                      onClick={handleCopyJSON}
                      className="relative px-3 py-2 border border-border bg-ink hover:border-brass text-brass transition-colors rounded-sm hover-glow"
                    >
                        <span className="font-mono text-[10px] uppercase tracking-widest">
                            {copyFeedback ? copyFeedback : "Copia JSON"}
                        </span>
                    </RippleButton>
                  </Tooltip>

                  <div className="flex gap-1">
                    <Tooltip content="Scarica dati strutturati" position="bottom">
                      <RippleButton
                        onClick={() => downloadFile('APF.json', JSON.stringify(data, null, 2), 'application/json')}
                        className="px-3 py-2 border border-border bg-ink hover:border-paper text-paper transition-colors rounded-sm hover-glow"
                      >
                          <span className="font-mono text-[10px] font-bold">JSON</span>
                      </RippleButton>
                    </Tooltip>
                    <Tooltip content="Scarica versione testo" position="bottom">
                      <RippleButton
                        onClick={() => downloadFile('README_PORTFOLIO.md', getMarkdown(data), 'text/markdown')}
                        className="px-3 py-2 border border-border bg-ink hover:border-paper text-paper transition-colors rounded-sm hover-glow"
                      >
                          <span className="font-mono text-[10px] font-bold">MD</span>
                      </RippleButton>
                    </Tooltip>
                  </div>

                  <Tooltip content="Esporta come pagina web standalone" position="bottom">
                    <RippleButton
                      onClick={downloadHTML}
                      className="px-5 py-2 bg-brass text-ink font-bold font-mono text-[10px] uppercase tracking-widest hover:bg-brass-hover transition-colors shadow-lg hover:shadow-[0_0_20px_rgba(194,168,120,0.4)] rounded-sm"
                    >
                        Scarica HTML
                    </RippleButton>
                  </Tooltip>
              </div>
          </div>
      </div>

      {/* Render Preview Area */}
      <div id="render-root" className="animate-fade-in transition-all duration-500">
        <DynamicRenderer data={renderData} />
      </div>

    </div>
  );
};

export default Step3Output;