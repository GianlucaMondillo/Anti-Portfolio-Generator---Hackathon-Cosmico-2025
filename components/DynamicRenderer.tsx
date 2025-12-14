import React, { useState, useEffect, useRef } from 'react';
import { AntiPortfolio, StyleDNA, SectionType } from '../types';

interface RendererProps {
  data: AntiPortfolio;
}

// =============================================================================
// RENDERER HTML GENERATO - L'AI genera l'HTML, noi lo mostriamo
// =============================================================================

// Componente che renderizza l'HTML generato dall'AI in un iframe isolato
const GeneratedHTMLRenderer: React.FC<{ html: string }> = ({ html }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      title="Anti-Portfolio"
    />
  );
};

// Card con hover effect dinamico (fallback)
const HoverCard: React.FC<{
  style: React.CSSProperties;
  hoverTransform: string;
  children: React.ReactNode;
}> = ({ style, hoverTransform, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  const dynamicStyle: React.CSSProperties = {
    ...style,
    transform: isHovered && hoverTransform !== 'none' ? hoverTransform : 'none',
    cursor: hoverTransform !== 'none' ? 'pointer' : 'default',
  };

  return (
    <div
      style={dynamicStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

// =============================================================================
// FALLBACK RENDERER - Solo se l'HTML generato non e' disponibile
// =============================================================================

// CSS Animations inline
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px currentColor; }
    50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const DynamicRenderer: React.FC<RendererProps> = ({ data }) => {
  // ==========================================================================
  // SE C'E' HTML GENERATO, USALO DIRETTAMENTE
  // ==========================================================================
  if (data.generated_html) {
    return <GeneratedHTMLRenderer html={data.generated_html} />;
  }

  // ==========================================================================
  // FALLBACK: Renderer React (usato solo se la generazione HTML fallisce)
  // ==========================================================================
  const s = data.style_dna;

  // Se manca style_dna, errore
  if (!s) {
    return <div style={{padding: '2rem', color: 'red'}}>Errore: style_dna mancante</div>;
  }

  // ==========================================================================
  // STILI BASE - Tutti derivati da style_dna, ZERO valori hardcodati
  // ==========================================================================

  const wrapperStyle: React.CSSProperties = {
    backgroundColor: s.palette?.background || '#fff',
    color: s.palette?.text || '#000',
    fontFamily: s.typography?.body_font || 'system-ui',
    fontSize: s.typography?.body_size || '1rem',
    fontWeight: s.typography?.body_weight || '400',
    lineHeight: s.typography?.line_height || '1.6',
    letterSpacing: s.typography?.letter_spacing || '0',
    minHeight: '100vh',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: s.layout?.max_width || '100%',
    margin: '0 auto',
    padding: s.layout?.inner_padding || '2rem',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: s.layout?.section_spacing || '4rem',
    textAlign: (s.layout?.content_align as any) || 'left',
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: s.typography?.heading_font || 'system-ui',
    fontSize: s.typography?.heading_size || '2rem',
    fontWeight: s.typography?.heading_weight || '700',
    textTransform: (s.typography?.text_transform as any) || 'none',
    color: s.palette?.accent || s.palette?.text || '#000',
    marginBottom: '1rem',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: s.palette?.surface || s.palette?.background || '#fff',
    padding: s.cards?.padding || '1.5rem',
    borderRadius: s.borders?.radius || '0',
    borderWidth: s.borders?.width || '0',
    borderStyle: (s.borders?.style as any) || 'none',
    borderColor: s.palette?.border || 'transparent',
    boxShadow: s.effects?.shadow || 'none',
    transition: s.effects?.transition || 'none',
  };

  const cardHoverStyle = s.effects?.hover_transform || 'none';

  // Animazione sezioni
  const getAnimationStyle = (): React.CSSProperties => {
    const anim = s.effects?.animation;
    if (!anim || anim === 'none') return {};
    const animMap: Record<string, string> = {
      fadeIn: 'fadeIn 0.8s ease-out',
      slideUp: 'slideUp 0.6s ease-out',
      slideLeft: 'slideLeft 0.6s ease-out',
      glow: 'glow 2s ease-in-out infinite',
      pulse: 'pulse 2s ease-in-out infinite',
    };
    return { animation: animMap[anim] || 'none' };
  };

  // Componente Header con icone e stile
  const SectionHeader: React.FC<{ label: string; sectionKey: string }> = ({ label, sectionKey }) => {
    const icon = (s as any).section_icons?.[sectionKey] || '';
    const headerStyle = s.headers?.style || 'minimal';
    const iconPos = s.headers?.icon_position || 'before';
    const decoColor = s.headers?.decoration_color || s.palette?.accent || '#000';

    const baseStyle: React.CSSProperties = {
      ...headingStyle,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
    };

    // Stili header diversi
    const styleVariants: Record<string, React.CSSProperties> = {
      underline: {
        ...baseStyle,
        borderBottom: `3px solid ${decoColor}`,
        paddingBottom: '0.5rem',
      },
      boxed: {
        ...baseStyle,
        border: `2px solid ${decoColor}`,
        padding: '0.5rem 1rem',
        borderRadius: s.borders?.radius || '0',
      },
      pill: {
        ...baseStyle,
        backgroundColor: decoColor,
        color: s.palette?.background || '#fff',
        padding: '0.5rem 1.5rem',
        borderRadius: '50px',
      },
      gradient: {
        ...baseStyle,
        background: `linear-gradient(135deg, ${decoColor}20 0%, transparent 100%)`,
        padding: '0.75rem 1.5rem',
        borderRadius: s.borders?.radius || '0',
      },
      bracket: {
        ...baseStyle,
      },
      minimal: baseStyle,
    };

    const finalStyle = styleVariants[headerStyle] || baseStyle;
    const iconElement = icon ? <span style={{ opacity: 0.7, fontFamily: 'monospace' }}>{icon}</span> : null;

    const content = headerStyle === 'bracket'
      ? `[ ${label} ]`
      : label;

    return (
      <h2 style={finalStyle}>
        {iconPos === 'before' && iconElement}
        {content}
        {iconPos === 'after' && iconElement}
      </h2>
    );
  };

  // ==========================================================================
  // COMPONENTI SEZIONE - Nessun if/switch su archetype
  // ==========================================================================

  const HeroSection = () => {
    const heroStyle: React.CSSProperties = {
      ...sectionStyle,
      textAlign: (s.hero?.layout === 'centered' ? 'center' : s.hero?.layout === 'right-aligned' ? 'right' : 'left') as any,
      paddingTop: s.layout?.section_spacing || '4rem',
      paddingBottom: s.layout?.section_spacing || '4rem',
    };

    const nameStyle: React.CSSProperties = {
      ...headingStyle,
      fontSize: s.hero?.name_size || s.typography?.heading_size || '3rem',
    };

    return (
      <section style={heroStyle}>
        {s.hero?.show_avatar && (
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: s.borders?.radius || '50%',
            backgroundColor: s.palette?.accent,
            color: s.palette?.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: s.hero?.layout === 'centered' ? '0 auto 1rem' : '0 0 1rem 0',
          }}>
            {data.meta?.name?.charAt(0) || '?'}
          </div>
        )}
        <h1 style={nameStyle}>{data.meta?.name}</h1>
        <div style={{
          fontSize: '1.25rem',
          color: s.palette?.secondary || s.palette?.text,
          marginBottom: '1rem',
        }}>
          {data.anti_title}
        </div>
        {s.hero?.show_location && data.meta?.location && (
          <div style={{ color: s.palette?.secondary, fontSize: '0.9rem' }}>
            {data.meta.location}
          </div>
        )}
        {data.signature?.one_sentence && (
          <p style={{
            marginTop: '1.5rem',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: s.hero?.layout === 'centered' ? '1.5rem auto 0' : '1.5rem 0 0 0',
          }}>
            {data.signature.one_sentence}
          </p>
        )}
        {s.hero?.decorative_element === 'underline' && (
          <div style={{
            width: '60px',
            height: '4px',
            backgroundColor: s.palette?.accent,
            margin: s.hero?.layout === 'centered' ? '2rem auto 0' : '2rem 0 0 0',
          }} />
        )}
      </section>
    );
  };

  const EdgeSection = () => {
    const label = data.section_labels?.edge || 'Competenze';
    const points = data.signature?.edge?.split(/[.!?]+/).filter(p => p.trim().length > 10) || [];

    return (
      <section style={{ ...sectionStyle, ...getAnimationStyle() }}>
        <SectionHeader label={label} sectionKey="edge" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: s.cards?.gap || '1rem' }}>
          {points.map((point, i) => (
            <HoverCard key={i} style={cardStyle} hoverTransform={cardHoverStyle}>{point.trim()}</HoverCard>
          ))}
        </div>
      </section>
    );
  };

  const MethodologySection = () => {
    const label = data.section_labels?.methodology || 'Metodologia';
    const steps = data.method_stack || [];
    if (steps.length === 0) return null;

    const cols = s.cards?.columns || '1';
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: cols === 'auto-fit'
        ? 'repeat(auto-fit, minmax(280px, 1fr))'
        : `repeat(${cols}, 1fr)`,
      gap: s.cards?.gap || '1rem',
    };

    return (
      <section style={{ ...sectionStyle, ...getAnimationStyle() }}>
        <SectionHeader label={label} sectionKey="methodology" />
        <div style={gridStyle}>
          {steps.map((step, i) => (
            <HoverCard key={i} style={cardStyle} hoverTransform={cardHoverStyle}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                color: s.palette?.accent,
                fontWeight: s.typography?.heading_weight || 'bold',
              }}>
                <span>{i + 1}.</span>
                <span>{step.step}</span>
              </div>
              <p style={{ opacity: 0.9 }}>{step.description}</p>
            </HoverCard>
          ))}
        </div>
      </section>
    );
  };

  const FailuresSection = () => {
    const label = data.section_labels?.failures || 'Lezioni Apprese';
    const failures = data.failure_ledger || [];
    if (failures.length === 0) return null;

    return (
      <section style={{ ...sectionStyle, ...getAnimationStyle() }}>
        <SectionHeader label={label} sectionKey="failures" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: s.cards?.gap || '1rem' }}>
          {failures.map((fail, i) => (
            <HoverCard key={i} style={cardStyle} hoverTransform={cardHoverStyle}>
              <p style={{ marginBottom: '0.75rem' }}>{fail.failure}</p>
              <div style={{
                padding: '0.75rem',
                backgroundColor: s.palette?.background,
                borderRadius: s.borders?.radius || '0',
                fontSize: '0.9rem',
              }}>
                <strong>Regola:</strong> {fail.rule_created}
              </div>
            </HoverCard>
          ))}
        </div>
      </section>
    );
  };

  const ProjectsSection = () => {
    const label = data.section_labels?.projects || 'Progetti';
    const projects = data.projects || [];
    if (projects.length === 0) return null;

    const cols = s.cards?.columns || '1';
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: cols === 'auto-fit'
        ? 'repeat(auto-fit, minmax(300px, 1fr))'
        : `repeat(${cols}, 1fr)`,
      gap: s.cards?.gap || '1rem',
    };

    return (
      <section style={{ ...sectionStyle, ...getAnimationStyle() }}>
        <SectionHeader label={label} sectionKey="projects" />
        <div style={gridStyle}>
          {projects.map((proj, i) => (
            <HoverCard key={i} style={cardStyle} hoverTransform={cardHoverStyle}>
              <h3 style={{
                color: s.palette?.accent,
                marginBottom: '0.5rem',
                fontSize: '1.2rem',
                fontWeight: s.typography?.heading_weight || 'bold',
              }}>
                {proj.name}
              </h3>
              <p style={{ marginBottom: '0.5rem' }}>{proj.problem}</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{proj.approach}</p>
              <div style={{
                marginTop: '0.75rem',
                color: s.palette?.accent,
                fontWeight: 'bold',
              }}>
                {proj.outcome}
              </div>
            </HoverCard>
          ))}
        </div>
      </section>
    );
  };

  const PatternsSection = () => {
    const label = data.section_labels?.patterns || 'Pattern Decisionali';
    const patterns = data.decision_patterns || [];
    if (patterns.length === 0) return null;

    return (
      <section style={{ ...sectionStyle, ...getAnimationStyle() }}>
        <SectionHeader label={label} sectionKey="patterns" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: s.cards?.gap || '1rem' }}>
          {patterns.map((pattern, i) => (
            <HoverCard key={i} style={cardStyle} hoverTransform={cardHoverStyle}>
              <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>{pattern.pattern_name}</h3>
              <p style={{ marginBottom: '0.5rem', opacity: 0.9 }}>{pattern.when_used}</p>
              {pattern.tradeoffs?.length > 0 && (
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  Trade-off: {pattern.tradeoffs.join(', ')}
                </div>
              )}
            </HoverCard>
          ))}
        </div>
      </section>
    );
  };

  const ProofSection = () => {
    const label = data.section_labels?.evidence || 'Prove';
    const proofs = data.proof_layer || [];
    if (proofs.length === 0) return null;

    return (
      <section style={{ ...sectionStyle, ...getAnimationStyle() }}>
        <SectionHeader label={label} sectionKey="proof" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: s.cards?.gap || '1rem' }}>
          {proofs.map((proof, i) => (
            <HoverCard key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'start', gap: '1rem' }} hoverTransform={cardHoverStyle}>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: proof.verifiability === 'HIGH' ? '#22c55e' :
                                 proof.verifiability === 'MED' ? '#eab308' : '#6b7280',
                color: '#fff',
              }}>
                {proof.verifiability}
              </span>
              <div>
                <p>{proof.claim_text}</p>
                {proof.evidence?.map((ev, j) => (
                  <a key={j} href={ev.url} target="_blank" rel="noopener noreferrer"
                     style={{
                       display: 'block',
                       color: s.palette?.accent,
                       fontSize: '0.9rem',
                       marginTop: '0.25rem',
                     }}>
                    {ev.label}
                  </a>
                ))}
              </div>
            </HoverCard>
          ))}
        </div>
      </section>
    );
  };

  const LovesSection = () => {
    const loves = data.loves_hates?.loves || [];
    if (loves.length === 0) return null;

    return (
      <section style={{ ...sectionStyle, ...getAnimationStyle() }}>
        <SectionHeader label="Cosa Amo" sectionKey="edge" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {loves.map((love, i) => (
            <span key={i} style={{
              padding: '0.5rem 1rem',
              backgroundColor: s.palette?.accent,
              color: s.palette?.background,
              borderRadius: s.borders?.radius || '0',
              fontSize: '0.9rem',
              transition: s.effects?.transition || 'none',
            }}>
              {love}
            </span>
          ))}
        </div>
      </section>
    );
  };

  const HatesSection = () => {
    const label = data.section_labels?.hates || 'Cosa Evito';
    const hates = data.loves_hates?.hates || [];
    if (hates.length === 0) return null;

    return (
      <section style={{ ...sectionStyle, ...getAnimationStyle() }}>
        <SectionHeader label={label} sectionKey="failures" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {hates.map((hate, i) => (
            <span key={i} style={{
              padding: '0.5rem 1rem',
              border: `${s.borders?.width || '1px'} ${s.borders?.style || 'solid'} ${s.palette?.border || s.palette?.text}`,
              borderRadius: s.borders?.radius || '0',
              fontSize: '0.9rem',
            }}>
              {hate}
            </span>
          ))}
        </div>
      </section>
    );
  };

  const NonGoalsSection = () => {
    const label = data.section_labels?.anti_goals || 'Cosa NON Faccio';
    const nonGoals = data.signature?.non_goals || [];
    if (nonGoals.length === 0) return null;

    return (
      <section style={{ ...sectionStyle, ...getAnimationStyle() }}>
        <SectionHeader label={label} sectionKey="failures" />
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {nonGoals.map((goal, i) => (
            <li key={i} style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              opacity: 0.8,
            }}>
              <span style={{ color: s.palette?.secondary }}>-</span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  // ==========================================================================
  // ROUTER SEZIONI - Renderizza in ordine deciso dall'AI
  // ==========================================================================

  const renderSection = (section: SectionType) => {
    switch (section) {
      case 'hero': return <HeroSection key="hero" />;
      case 'edge': return <EdgeSection key="edge" />;
      case 'methodology': return <MethodologySection key="methodology" />;
      case 'failures': return <FailuresSection key="failures" />;
      case 'projects': return <ProjectsSection key="projects" />;
      case 'patterns': return <PatternsSection key="patterns" />;
      case 'proof': return <ProofSection key="proof" />;
      case 'loves': return <LovesSection key="loves" />;
      case 'hates': return <HatesSection key="hates" />;
      case 'non_goals': return <NonGoalsSection key="non_goals" />;
      default: return null;
    }
  };

  // Ordine sezioni deciso dall'AI
  const sectionOrder = s.section_order || ['hero', 'edge', 'methodology', 'projects', 'failures'];

  // Background pattern se specificato dall'AI
  const bgPatternStyle = s.effects?.background_pattern && s.effects.background_pattern !== 'none'
    ? { backgroundImage: s.effects.background_pattern }
    : {};

  // ==========================================================================
  // RENDER FINALE
  // ==========================================================================

  return (
    <>
      <style>{animationStyles}</style>
      <div style={{ ...wrapperStyle, ...bgPatternStyle }}>
        <div style={containerStyle}>
          {sectionOrder.map(section => renderSection(section))}

        {/* Footer */}
        <footer style={{
          marginTop: s.layout?.section_spacing || '4rem',
          paddingTop: '2rem',
          borderTop: `1px solid ${s.palette?.border || s.palette?.text}20`,
          textAlign: 'center',
          fontSize: '0.9rem',
          color: s.palette?.secondary || s.palette?.text,
          opacity: 0.7,
        }}>
          {data.meta?.name} {data.meta?.location && `| ${data.meta.location}`}
        </footer>
        </div>
      </div>
    </>
  );
};

export default DynamicRenderer;
