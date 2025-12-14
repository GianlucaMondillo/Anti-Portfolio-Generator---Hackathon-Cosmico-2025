import React, { useState, useCallback } from 'react';
import { UserMaterials } from '../types';
import Tooltip from './ui/Tooltip';
import RippleButton from './ui/RippleButton';

interface Step1Props {
  materials: UserMaterials;
  setMaterials: React.Dispatch<React.SetStateAction<UserMaterials>>;
  onNext: () => void;
}

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number; size?: number }> = ({ progress, size = 80 }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        <circle
          stroke="#1f1f1f"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring-circle"
          stroke="#c2a878"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            filter: progress > 0 ? 'drop-shadow(0 0 6px rgba(194, 168, 120, 0.5))' : 'none'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-mono text-brass font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const Step1Materials: React.FC<Step1Props> = ({ materials, setMaterials, onNext }) => {
  const [activeField, setActiveField] = useState<string | null>(null);

  // Calculate completion progress
  const calculateProgress = useCallback(() => {
    let score = 0;
    const maxScore = 100;

    // Raw text: 0-50 points based on length
    const rawLength = materials.rawText.trim().length;
    if (rawLength > 0) score += Math.min(50, (rawLength / 500) * 50);

    // LinkedIn: 0-25 points
    const linkedInLength = materials.linkedInExport.trim().length;
    if (linkedInLength > 0) score += Math.min(25, (linkedInLength / 200) * 25);

    // Links: 0-25 points
    const linksLength = materials.projectLinks.trim().length;
    if (linksLength > 0) score += Math.min(25, (linksLength / 100) * 25);

    return Math.min(maxScore, score);
  }, [materials]);

  const progress = calculateProgress();

  // Robust validation: Allow next if ANY content field has length > 5
  const hasEnoughData = 
    materials.rawText.trim().length > 5 || 
    materials.linkedInExport.trim().length > 5 || 
    materials.projectLinks.trim().length > 5;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-border/50 pb-6 gap-4">
        <div className="space-y-2">
            <h2 className="text-4xl font-serif text-paper">Acquisizione Materiali</h2>
            <p className="text-paper-muted font-mono text-sm max-w-xl">
            Il sistema richiede dati grezzi. Non filtrare. Incolla CV, note disordinate, post-mortem di progetti.
            <span className="text-brass/80"> Piu' e' onesto il caos, migliore e' l'output.</span>
            </p>
        </div>
        <div className="flex items-center gap-6">
            {/* Progress Ring */}
            <Tooltip content={`Completezza dati: ${Math.round(progress)}%`} position="left">
              <ProgressRing progress={progress} size={70} />
            </Tooltip>
            <div className="text-right hidden md:block">
                <div className="text-[10px] font-mono text-brass uppercase tracking-widest mb-1">Status Nodo</div>
                <div className="flex items-center gap-2 justify-end">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${progress > 50 ? 'bg-white' : 'bg-brass'}`}></span>
                    <span className="text-xs font-mono text-paper">
                      {progress < 20 ? 'IN ATTESA' : progress < 50 ? 'ACQUISENDO' : progress < 80 ? 'ELABORANDO' : 'PRONTO'}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Personal Data Section */}
      <div className="glass-panel p-6 border border-border/50 rounded">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-border flex-grow"></div>
          <label className="text-xs font-bold text-brass uppercase tracking-[0.2em] font-mono">
            Dati Identificativi
          </label>
          <div className="h-px bg-border flex-grow"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`transition-all duration-300 rounded bg-ink-light/50 border ${activeField === 'name' ? 'border-brass' : 'border-border'}`}>
            <div className="p-3 border-b border-border/50 bg-ink-light">
              <label className="text-xs font-bold text-brass uppercase tracking-widest font-mono flex items-center gap-2">
                <span className="text-[10px] opacity-50">ID</span>
                <span>Nome Completo</span>
              </label>
            </div>
            <input
              type="text"
              onFocus={() => setActiveField('name')}
              onBlur={() => setActiveField(null)}
              className="w-full bg-transparent p-4 text-sm font-mono text-paper outline-none placeholder-zinc-700"
              placeholder="Mario Rossi"
              value={materials.personalData.name}
              onChange={(e) => setMaterials({
                ...materials,
                personalData: { ...materials.personalData, name: e.target.value }
              })}
            />
          </div>

          <div className={`transition-all duration-300 rounded bg-ink-light/50 border ${activeField === 'location' ? 'border-brass' : 'border-border'}`}>
            <div className="p-3 border-b border-border/50 bg-ink-light">
              <label className="text-xs font-bold text-brass uppercase tracking-widest font-mono flex items-center gap-2">
                <span className="text-[10px] opacity-50">LOC</span>
                <span>Location</span>
              </label>
            </div>
            <input
              type="text"
              onFocus={() => setActiveField('location')}
              onBlur={() => setActiveField(null)}
              className="w-full bg-transparent p-4 text-sm font-mono text-paper outline-none placeholder-zinc-700"
              placeholder="Milano, Italia / Remoto"
              value={materials.personalData.location}
              onChange={(e) => setMaterials({
                ...materials,
                personalData: { ...materials.personalData, location: e.target.value }
              })}
            />
          </div>

          <div className={`transition-all duration-300 rounded bg-ink-light/50 border ${activeField === 'contact' ? 'border-brass' : 'border-border'}`}>
            <div className="p-3 border-b border-border/50 bg-ink-light">
              <label className="text-xs font-bold text-brass uppercase tracking-widest font-mono flex items-center gap-2">
                <span className="text-[10px] opacity-50">@</span>
                <span>Contatto</span>
              </label>
            </div>
            <input
              type="email"
              onFocus={() => setActiveField('contact')}
              onBlur={() => setActiveField(null)}
              className="w-full bg-transparent p-4 text-sm font-mono text-paper outline-none placeholder-zinc-700"
              placeholder="email@example.com"
              value={materials.personalData.contact}
              onChange={(e) => setMaterials({
                ...materials,
                personalData: { ...materials.personalData, contact: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Input Area */}
        <div className="lg:col-span-7 space-y-8">
            <div className={`transition-all duration-300 rounded bg-ink-light/50 border ${activeField === 'raw' ? 'border-brass shadow-[0_0_20px_rgba(194,168,120,0.1)]' : 'border-border'}`}>
                <div className="flex justify-between items-center p-3 border-b border-border/50 bg-ink-light">
                    <label className="text-xs font-bold text-brass uppercase tracking-widest font-mono flex items-center gap-2">
                        <span className="text-[10px] opacity-50">01</span>
                        <span>Primary Data Stream</span>
                    </label>
                </div>
                <textarea
                    onFocus={() => setActiveField('raw')}
                    onBlur={() => setActiveField(null)}
                    className="w-full h-80 bg-transparent p-4 text-sm font-mono text-paper outline-none resize-none placeholder-zinc-700 leading-relaxed"
                    placeholder="// Incolla qui il contenuto del tuo CV, storie di fallimenti, note tecniche o manifesti personali..."
                    value={materials.rawText}
                    onChange={(e) => setMaterials({ ...materials, rawText: e.target.value })}
                />
            </div>
        </div>

        {/* Secondary Inputs */}
        <div className="lg:col-span-5 space-y-6">
            <div className={`transition-all duration-300 rounded bg-ink-light/50 border ${activeField === 'linkedin' ? 'border-brass' : 'border-border'}`}>
                <div className="p-3 border-b border-border/50 bg-ink-light">
                    <label className="text-xs font-bold text-brass uppercase tracking-widest font-mono flex items-center gap-2">
                        <span className="text-[10px] opacity-50">02</span>
                        <span>Bio / LinkedIn Dump</span>
                    </label>
                </div>
                <textarea
                    onFocus={() => setActiveField('linkedin')}
                    onBlur={() => setActiveField(null)}
                    className="w-full h-32 bg-transparent p-4 text-sm font-mono text-paper outline-none resize-none placeholder-zinc-700"
                    placeholder="// Copia la sezione 'About' o l'esperienza lavorativa..."
                    value={materials.linkedInExport}
                    onChange={(e) => setMaterials({ ...materials, linkedInExport: e.target.value })}
                />
            </div>

            <div className={`transition-all duration-300 rounded bg-ink-light/50 border ${activeField === 'links' ? 'border-brass' : 'border-border'}`}>
                <div className="p-3 border-b border-border/50 bg-ink-light">
                    <label className="text-xs font-bold text-brass uppercase tracking-widest font-mono flex items-center gap-2">
                        <span className="text-[10px] opacity-50">03</span>
                        <span>Evidence Links</span>
                    </label>
                </div>
                <textarea
                    onFocus={() => setActiveField('links')}
                    onBlur={() => setActiveField(null)}
                    className="w-full h-32 bg-transparent p-4 text-sm font-mono text-paper outline-none resize-none placeholder-zinc-700"
                    placeholder="https://github.com/project-alpha&#10;https://behance.net/gallery/..."
                    value={materials.projectLinks}
                    onChange={(e) => setMaterials({ ...materials, projectLinks: e.target.value })}
                />
            </div>
        </div>
      </div>

      <div className="flex justify-center pt-12 pb-8">
        <Tooltip content={hasEnoughData ? "Procedi all'intervista AI" : "Inserisci piu' materiali per continuare"} position="top">
          <RippleButton
            onClick={onNext}
            disabled={!hasEnoughData}
            className={`group relative px-10 py-4 overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover-lift ${hasEnoughData ? 'animate-glow-pulse' : ''}`}
          >
            <div className={`absolute inset-0 border border-brass transition-all duration-300 ${!hasEnoughData ? 'opacity-30' : 'group-hover:bg-brass/10'}`}></div>
            <div className={`absolute inset-0 bg-brass transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left opacity-10`}></div>
            <div className="flex items-center gap-3 relative z-10">
                <span className={`font-mono text-sm font-bold tracking-[0.2em] uppercase ${!hasEnoughData ? 'text-paper-muted' : 'text-brass'}`}>
                    Inizializza Protocollo
                </span>
                {hasEnoughData && <span className="text-brass group-hover:translate-x-2 transition-transform">-&gt;</span>}
            </div>
          </RippleButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default Step1Materials;