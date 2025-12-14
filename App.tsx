import React, { useState } from 'react';
import { AppStep, UserMaterials, ChatMessage, AntiPortfolio } from './types';
import Step1Materials from './components/Step1Materials';
import Step2Interview from './components/Step2Interview';
import Step3Output from './components/Step3Output';
import ParticleField from './components/ui/ParticleField';
import GlitchText from './components/ui/GlitchText';

// Inline About Modal Component for simplicity in this file structure
const AboutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-ink border border-brass/30 max-w-2xl w-full p-8 shadow-[0_0_50px_rgba(194,168,120,0.1)] animate-slide-up overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-paper-muted hover:text-brass font-mono">[X]</button>
        
        <h2 className="text-3xl font-serif text-brass mb-6 italic">The Anti-Portfolio Manifesto</h2>
        
        <div className="space-y-6 text-sm font-mono text-paper leading-relaxed">
          <p>
            <strong className="text-paper-muted uppercase tracking-widest">Il Problema:</strong><br/>
            I portfolio tradizionali sono una bugia. Mostrano solo il successo, nascondendo il caos, le decisioni difficili e i fallimenti che ci hanno realmente insegnato a costruire. Sono vetrine sterili, non documentazione di ingegneria.
          </p>
          
          <p>
            <strong className="text-paper-muted uppercase tracking-widest">La Soluzione:</strong><br/>
            Questo generatore usa l'AI per estrarre il tuo <span className="text-brass">"Dark Data"</span>: i trade-off, i bug critici, le lezioni apprese col sangue. 
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-border py-6 my-6">
             <div>
                <h4 className="text-brass mb-2">Non Cerchiamo:</h4>
                <ul className="list-disc pl-4 text-paper-muted">
                    <li>Job Titles gonfiati</li>
                    <li>Metriche di vanità</li>
                    <li>Design perfetti mai implementati</li>
                </ul>
             </div>
             <div>
                <h4 className="text-brass mb-2">Cerchiamo:</h4>
                <ul className="list-disc pl-4 text-paper-muted">
                    <li>Principi decisionali</li>
                    <li>Analisi dei fallimenti</li>
                    <li>Metodologie di sopravvivenza</li>
                </ul>
             </div>
          </div>

          <p className="text-xs text-paper-muted">
            <strong className="uppercase">Privacy:</strong> I dati vengono inviati a OpenRouter per l'elaborazione AI e poi distrutti. Nessun database. Nessun tracking. Tutto avviene nella sessione corrente.
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-border flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-brass text-ink font-bold hover:bg-brass-hover transition-colors uppercase tracking-widest text-xs">
                Accetto il Caos
            </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.MATERIALS);
  const [maxStepReached, setMaxStepReached] = useState<AppStep>(AppStep.MATERIALS);
  const [showAbout, setShowAbout] = useState(false);
  
  // App State
  const [materials, setMaterials] = useState<UserMaterials>({
    rawText: '',
    linkedInExport: '',
    projectLinks: '',
    personalData: {
      name: '',
      location: '',
      contact: ''
    }
  });
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [generatedAPF, setGeneratedAPF] = useState<AntiPortfolio | null>(null);

  const handleStepChange = (newStep: AppStep) => {
    if (newStep > maxStepReached) {
      setMaxStepReached(newStep);
    }
    setStep(newStep);
  };

  const handleReset = () => {
    if (window.confirm("Attenzione: Questo cancellerà tutti i dati correnti. Procedere?")) {
        setStep(AppStep.MATERIALS);
        setMaxStepReached(AppStep.MATERIALS);
        setMaterials({
          rawText: '',
          linkedInExport: '',
          projectLinks: '',
          personalData: {
            name: '',
            location: '',
            contact: ''
          }
        });
        setChatHistory([]);
        setGeneratedAPF(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brass selection:text-ink overflow-x-hidden">
      {/* Particle Background */}
      <ParticleField />

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* Top Bar - Glassmorphic */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-default">
            {/* Logo */}
            <div className="relative w-12 h-12 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 48 48" className="absolute inset-0">
                  <polygon
                    points="24,4 44,24 24,44 4,24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-brass/40 transition-all duration-700 group-hover:text-brass"
                  />
                  <polygon
                    points="24,10 38,24 24,38 10,24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-brass/20 transition-all duration-500 group-hover:text-brass/60"
                  />
                </svg>
                <span className="font-serif font-bold text-brass text-xl relative z-10">A</span>
            </div>
            {/* Title */}
            <div className="flex flex-col">
                <h1 className="font-serif font-bold tracking-tight text-paper text-xl leading-none">
                  <GlitchText text="ANTI-PORTFOLIO" glitchInterval={8000} />
                </h1>
                <p className="text-[10px] font-mono text-paper-muted/70 mt-1 tracking-widest">
                  GENERATOR
                </p>
            </div>
          </div>

          {/* Step Progress - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {[
                { id: 1, label: 'MATERIALI' },
                { id: 2, label: 'INTERVISTA' },
                { id: 3, label: 'OUTPUT' }
            ].map((s, idx) => {
                const isActive = step === s.id;
                const isPast = step > s.id;
                const isClickable = s.id <= maxStepReached;

                return (
                    <div key={s.id} className="flex items-center">
                        <button
                            onClick={() => isClickable && setStep(s.id)}
                            disabled={!isClickable}
                            className={`relative px-4 py-2 transition-all duration-300 ${
                                !isClickable ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 flex items-center justify-center border text-[10px] font-mono font-bold transition-all ${
                                    isActive
                                      ? 'border-brass bg-brass/20 text-brass'
                                      : isPast
                                        ? 'border-paper-muted/50 bg-paper-muted/10 text-paper-muted'
                                        : 'border-zinc-700 text-zinc-700'
                                }`}>
                                    {s.id}
                                </span>
                                <span className={`text-[10px] font-mono tracking-wider transition-colors ${
                                    isActive ? 'text-brass' : isPast ? 'text-paper-muted' : 'text-zinc-700'
                                }`}>
                                    {s.label}
                                </span>
                            </div>
                            {isActive && (
                              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-brass shadow-[0_0_8px_#c2a878]"></div>
                            )}
                        </button>
                        {idx < 2 && (
                          <div className={`w-6 h-[1px] ${isPast ? 'bg-paper-muted/40' : 'bg-zinc-800'}`}></div>
                        )}
                    </div>
                );
            })}
          </div>

          {/* Mobile Step Indicator */}
          <div className="flex md:hidden items-center gap-2">
            <span className="text-[10px] font-mono text-paper-muted">STEP</span>
            <span className="text-lg font-mono text-brass font-bold">{step}</span>
            <span className="text-[10px] font-mono text-paper-muted">/3</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-16 px-4 md:px-6 max-w-6xl mx-auto flex-grow w-full relative z-10">
        <div key={step} className="animate-slide-up">
            {step === AppStep.MATERIALS && (
            <Step1Materials
                materials={materials}
                setMaterials={setMaterials}
                onNext={() => handleStepChange(AppStep.INTERVIEW)}
            />
            )}

            {step === AppStep.INTERVIEW && (
            <Step2Interview
                materials={materials}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                onBack={() => setStep(AppStep.MATERIALS)}
                onFinish={() => handleStepChange(AppStep.OUTPUT)}
            />
            )}

            {step === AppStep.OUTPUT && (
            <Step3Output
                history={chatHistory}
                materials={materials}
                existingData={generatedAPF}
                onDataGenerated={setGeneratedAPF}
                onBack={() => setStep(AppStep.INTERVIEW)}
                onReset={handleReset}
            />
            )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 bg-ink-light/50 backdrop-blur-sm relative">
        <div className="max-w-5xl mx-auto px-6">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-border/30">
            {/* Quote */}
            <div className="text-center md:text-left">
              <h3 className="font-serif italic text-brass text-lg">"L'ombra definisce la luce."</h3>
              <p className="text-[9px] font-mono text-paper-muted/50 tracking-widest uppercase mt-1">
                Patterns // Failure Analysis // Methodology
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowAbout(true)}
                className="text-[10px] font-mono text-paper-muted hover:text-brass transition-colors uppercase tracking-wider px-3 py-2 border border-border/50 hover:border-brass/50"
              >
                Manifesto
              </button>
              <button
                onClick={handleReset}
                className="text-[10px] font-mono text-alert/60 hover:text-alert transition-colors uppercase tracking-wider px-3 py-2 border border-alert/20 hover:border-alert/50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6">
            {/* Made by */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-brass/30"></div>
              <p className="text-sm font-mono text-paper-muted">
                Made by <span className="text-brass font-semibold">Gianluca Mondillo</span><span className="text-paper-muted/60">, MD</span>
              </p>
              <div className="w-8 h-[1px] bg-brass/30"></div>
            </div>

            {/* Tech Info */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-mono text-paper-muted/40 uppercase tracking-wider">Secure</span>
              </span>
              <span className="text-[9px] font-mono text-paper-muted/30">|</span>
              <span className="text-[9px] font-mono text-paper-muted/40 uppercase tracking-wider">No Data Persistence</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;