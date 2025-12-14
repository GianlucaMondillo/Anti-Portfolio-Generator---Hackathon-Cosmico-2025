// APF (Anti-Portfolio Format) Schema Definitions

export interface APFMeta {
  name: string;
  location: string;
  contact?: string;
  primary_links: string[];
}

export interface APFSignature {
  one_sentence: string;
  three_traits: string[];
  edge: string;
  non_goals: string[];
}

export interface DecisionPattern {
  pattern_name: string;
  when_used: string;
  signals: string[];
  tradeoffs: string[];
  example: string;
}

export interface MethodStackStep {
  step: string;
  description: string;
  artifacts_produced: string[];
  common_failure: string;
  mitigation: string;
}

export interface FailureEntry {
  failure: string;
  context: string;
  lesson: string;
  rule_created: string;
  what_changed: string;
  evidence_refs: string[];
}

export interface LovesHates {
  loves: string[];
  hates: string[];
  will_use_if_needed: string[];
}

export interface Superpower {
  claim: string;
  why_true: string;
  scope: string;
  boundaries: string;
  evidence: string[];
}

export interface Project {
  name: string;
  role_function: string;
  problem: string;
  approach: string;
  outcome: string;
  metrics: string[];
  links: string[];
}

export interface ProofItem {
  claim_id: string;
  claim_text: string;
  verifiability: 'HIGH' | 'MED' | 'LOW';
  evidence: {
    url: string;
    label: string;
    note: string;
  }[];
}

// NIENTE ARCHETYPE FISSI - L'AI genera TUTTO lo stile
export type SectionType = 'hero' | 'edge' | 'methodology' | 'failures' | 'projects' | 'patterns' | 'proof' | 'loves' | 'hates' | 'non_goals';

// StyleDNA: L'AI controlla OGNI aspetto visivo - ZERO hardcoding
export interface StyleDNA {
  theme_name: string;

  // Ordine e struttura sezioni - deciso dall'AI
  section_order: SectionType[];

  // LAYOUT - l'AI decide come disporre il contenuto
  layout: {
    max_width: string;           // es: "800px", "1200px", "100%"
    content_align: string;       // es: "left", "center", "right"
    section_spacing: string;     // es: "2rem", "4rem", "8rem"
    inner_padding: string;       // es: "1rem", "2rem", "4rem"
  };

  // TIPOGRAFIA - l'AI decide font, dimensioni, pesi
  typography: {
    heading_font: string;        // es: "Georgia, serif", "system-ui, sans-serif"
    body_font: string;
    heading_size: string;        // es: "2.5rem", "4rem"
    body_size: string;           // es: "1rem", "1.125rem"
    heading_weight: string;      // es: "300", "700", "900"
    body_weight: string;
    line_height: string;         // es: "1.5", "1.8"
    letter_spacing: string;      // es: "0", "-0.02em", "0.1em"
    text_transform: string;      // es: "none", "uppercase"
  };

  // COLORI - l'AI sceglie la palette completa
  palette: {
    background: string;
    surface: string;
    text: string;
    accent: string;
    secondary: string;
    border: string;
  };

  // BORDI E FORME - l'AI decide lo stile
  borders: {
    radius: string;              // es: "0", "8px", "50%"
    width: string;               // es: "0", "1px", "3px"
    style: string;               // es: "none", "solid", "dashed"
  };

  // EFFETTI - l'AI decide animazioni e effetti
  effects: {
    shadow: string;              // es: "none", "0 4px 20px rgba(0,0,0,0.1)"
    hover_transform: string;     // es: "none", "translateY(-4px)", "scale(1.02)"
    transition: string;          // es: "all 0.3s ease"
    background_pattern: string;  // es: "none", CSS per pattern
    animation: string;           // es: "none", "fadeIn", "slideUp", "glow"
  };

  // ICONE SEZIONI - l'AI sceglie icone appropriate
  section_icons: {
    edge: string;                // es: "///", ">>", "[!]", "***"
    methodology: string;         // es: "01.", "#", "->", ":::"
    failures: string;            // es: "X", "!!", "[-]", "~~~"
    projects: string;            // es: "</>", "++", "[P]", ">>>"
    patterns: string;            // es: "?:", "&&", "||", "{}"
    proof: string;               // es: "[v]", "**", "==", "+++"
  };

  // HEADER STYLE - decorazione titoli sezione
  headers: {
    style: string;               // es: "underline", "boxed", "pill", "minimal", "gradient"
    icon_position: string;       // es: "before", "after", "none"
    decoration_color: string;    // colore decorazione (accent o custom)
  };

  // LAYOUT VARIATIONS - strutture completamente diverse
  layout_style: string;          // es: "cards", "timeline", "bento", "magazine", "brutalist", "split", "minimal-list"

  // DECORAZIONI VISIVE
  decorations: {
    hero_shape: string;          // es: "none", "blob", "diagonal", "circle", "waves"
    section_dividers: string;    // es: "none", "line", "gradient", "dots", "zigzag"
    floating_elements: boolean;  // elementi decorativi fluttuanti
    noise_overlay: boolean;      // texture noise
    gradient_bg: string;         // es: "none", "radial", "linear", "mesh"
  };

  // STILE HERO - l'AI decide come presentare l'identita
  hero: {
    layout: string;              // es: "centered", "left-aligned", "split"
    name_size: string;           // es: "3rem", "5rem"
    show_avatar: boolean;
    show_location: boolean;
    decorative_element: string;  // es: "none", "underline", "background-shape"
  };

  // STILE CARDS/ELEMENTI - l'AI decide come mostrare liste
  cards: {
    style: string;               // es: "flat", "elevated", "bordered", "minimal"
    padding: string;
    gap: string;
    columns: string;             // es: "1", "2", "3", "auto-fit"
  };
}

export interface SectionLabels {
  edge: string;
  methodology: string;
  failures: string;
  patterns: string;
  evidence: string;
  projects: string;
  anti_goals: string;
  hates: string;
}

export interface AntiPortfolio {
  meta: APFMeta;
  anti_title: string;
  signature: APFSignature;
  decision_patterns: DecisionPattern[];
  method_stack: MethodStackStep[];
  failure_ledger: FailureEntry[];
  loves_hates: LovesHates;
  superpowers: Superpower[];
  projects: Project[];
  proof_layer: ProofItem[];
  style_dna: StyleDNA;
  section_labels?: SectionLabels;
  // HTML COMPLETO GENERATO DA AI - questo e' il portfolio vero
  generated_html?: string;
}

// App State Types

export enum AppStep {
  MATERIALS = 1,
  INTERVIEW = 2,
  OUTPUT = 3
}

export interface PersonalData {
  name: string;
  location: string;
  contact: string;
}

export interface UserMaterials {
  rawText: string;
  linkedInExport: string;
  projectLinks: string;
  personalData: PersonalData;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface DebugLog {
  timestamp: number;
  phase: string;
  status: 'started' | 'success' | 'error' | 'timeout';
  durationMs?: number;
  details?: string;
}