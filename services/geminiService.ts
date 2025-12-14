import { AntiPortfolio, ChatMessage, UserMaterials, StyleDNA } from "../types";

// OpenRouter API Configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_ID = "google/gemini-2.5-flash-lite";

// Helper per chiamate OpenRouter
const callOpenRouter = async (
  messages: { role: string; content: string }[],
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<string> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY non configurata");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Anti-Portfolio Generator"
    },
    body: JSON.stringify({
      model: MODEL_ID,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4096
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

// --- INTERVIEW LOGIC ---

const INTERVIEWER_SYSTEM_PROMPT = `Sei un intervistatore esperto per un "Anti-Portfolio". Parla SOLO IN ITALIANO.
Il tuo obiettivo e' capire CHI E' questa persona, non cosa ha fatto.
Devi fare esattamente UNA domanda.

FORMATO OUTPUT: Scrivi la domanda come TESTO SEMPLICE. NON usare mai markdown, asterischi, grassetto, corsivo, elenchi puntati o formattazione speciale. Solo testo normale.

ANALIZZA I MATERIALI DELL'UTENTE per formulare domande SPECIFICHE e PERSONALIZZATE.

COS'E' UN ANTI-PORTFOLIO:
Non e' un CV. E' un formato che mostra:
- COME pensi e risolvi problemi (non COSA hai fatto)
- Il tuo PROCESSO e metodologia (non solo output finale)
- La tua IMPRONTA UNICA (cosa ti rende diverso da altri con lo stesso job title)
- I tuoi FALLIMENTI e cosa hai imparato
- Cosa NON fai e cosa ODI

=== AREE OBBLIGATORIE DA COPRIRE (6 DOMANDE TOTALI) ===

DOMANDA 1 - EDGE/UNICITA':
"Cosa sai fare meglio di chiunque altro con il tuo stesso ruolo?"
"Qual e' la cosa che fai TU che i tuoi colleghi non fanno?"
"Se dovessi spiegare cosa ti rende diverso dagli altri [ruolo], cosa diresti?"

DOMANDA 2 - METODOLOGIA/PROCESSO:
"Quando affronti un problema nuovo, qual e' il tuo processo? Passo per passo."
"Hai delle regole personali o un metodo che segui sempre?"
"Come decidi da dove iniziare quando ti trovi davanti a qualcosa di complesso?"

DOMANDA 3 - FALLIMENTI E LEZIONI:
"Qual e' il fallimento professionale che ti ha insegnato di piu'?"
"Racconta un errore che hai fatto e la regola che ti sei dato dopo."
"C'e' stato un momento in cui hai sbagliato tutto? Cosa hai imparato?"

DOMANDA 4 - COSA AMI/ODI DEL LAVORO:
"Cosa ti fa impazzire del tuo settore? Cosa odi?"
"Cosa ami del tuo lavoro e cosa non sopporti?"
"Quali pratiche comuni nel tuo campo ti fanno venire il nervoso?"

DOMANDA 5 - ANTI-GOALS (COSA NON FAI):
"Cosa rifiuti di fare anche se tutti lo fanno?"
"Ci sono richieste che declini sempre? Perche'?"
"Qual e' la cosa che non farai MAI, anche se ti pagassero bene?"

DOMANDA 6 - FILOSOFIA/VALORI LAVORATIVI:
"Qual e' la tua filosofia di lavoro in una frase?"
"Se dovessi lasciare un consiglio a chi inizia nel tuo campo, quale sarebbe?"
"C'e' qualcosa in cui credi fermamente che va controcorrente nel tuo settore?"

LOGICA ADATTIVA:
- Se l'utente risponde in modo dettagliato: incalza sui dettagli, chiedi il "perche'" profondo
- Se l'utente e' vago/breve: chiedi un esempio concreto specifico
- NON ripetere aree gia' coperte - passa alla successiva
- Adatta la domanda al contesto delle risposte precedenti

Sii diretto e incisivo. Cerca la PERSONA dietro il professionista.`;

// --- HELPER ---
const timeout = (ms: number) => new Promise((_, reject) =>
  setTimeout(() => reject(new Error(`Timeout of ${ms}ms exceeded`)), ms)
);

// Rimuove formattazione markdown dal testo
const stripMarkdown = (text: string): string => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold**
    .replace(/\*([^*]+)\*/g, '$1')       // *italic*
    .replace(/__([^_]+)__/g, '$1')       // __bold__
    .replace(/_([^_]+)_/g, '$1')         // _italic_
    .replace(/`([^`]+)`/g, '$1')         // `code`
    .replace(/^#+\s*/gm, '')             // # headers
    .replace(/^[-*]\s+/gm, '')           // - bullet points
    .replace(/^\d+\.\s+/gm, '')          // 1. numbered lists
    .trim();
};

// --- INTERVIEW FUNCTIONS ---

export const startInterview = async (materials: UserMaterials): Promise<string> => {
  const personalInfo = materials.personalData.name
    ? `CANDIDATO: ${materials.personalData.name}${materials.personalData.location ? ` (${materials.personalData.location})` : ''}\n\n`
    : '';

  const allMaterials = [
    materials.rawText,
    materials.linkedInExport,
    materials.projectLinks
  ].filter(m => m && m.trim().length > 0).join('\n\n---\n\n');

  const userMessage = `${personalInfo}MATERIALI DELL'UTENTE DA ANALIZZARE:
${allMaterials.substring(0, 4000)}

TASK: Analizza questi materiali e formula la PRIMA domanda dell'intervista.
La domanda deve essere SPECIFICA e basata su dettagli concreti trovati nei materiali.
Se trovi menzione di progetti, tecnologie, ruoli o esperienze, usa quei dettagli per personalizzare la domanda.
Cerca di capire quali trade-off, fallimenti o decisioni difficili potrebbero essere nascosti dietro quello che l'utente ha scritto.`;

  try {
    const fetchPromise = callOpenRouter([
      { role: "system", content: INTERVIEWER_SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]);

    const text = await Promise.race([fetchPromise, timeout(15000)]) as string;
    if (!text || text.length < 5) throw new Error("AI non ha generato una domanda valida");

    return stripMarkdown(text);
  } catch (error) {
    // Ritenta con prompt semplificato
    try {
      const retryPromise = callOpenRouter([
        { role: "system", content: INTERVIEWER_SYSTEM_PROMPT },
        { role: "user", content: `Basandoti su questi materiali: "${allMaterials.substring(0, 1000)}", formula una domanda per capire i trade-off e le sfide reali affrontate da questa persona.` }
      ]);
      const retryText = await Promise.race([retryPromise, timeout(10000)]) as string;
      if (!retryText) throw new Error("AI non ha generato una domanda valida");
      return stripMarkdown(retryText);
    } catch {
      throw new Error("Impossibile generare domande. Verifica la connessione e riprova.");
    }
  }
};

export const continueInterview = async (history: ChatMessage[], answer: string, questionIndex: number): Promise<string> => {
  const wordCount = answer.trim().split(/\s+/).length;
  let adaptationContext = "";

  if (wordCount < 10) {
    adaptationContext = "L'utente e' stato vago/breve. Fai una domanda piu' specifica o chiedi un esempio concreto per farlo aprire.";
  } else if (wordCount > 40) {
    adaptationContext = "L'utente e' stato molto dettagliato. Usa un dettaglio specifico della sua risposta per approfondire.";
  } else {
    adaptationContext = "Risposta di media lunghezza. Cerca di andare piu' in profondita'.";
  }

  // Mappa domanda -> topic da esplorare
  const topicMap: Record<number, string> = {
    1: "DOMANDA 2 - METODOLOGIA/PROCESSO: Chiedi del suo processo di lavoro, come affronta i problemi, le sue regole personali.",
    2: "DOMANDA 3 - FALLIMENTI: Chiedi di un fallimento professionale e cosa ha imparato. Vuoi sentire una storia vera con una lezione concreta.",
    3: "DOMANDA 4 - COSA AMA/ODIA: Chiedi cosa lo fa impazzire del suo settore, cosa odia, cosa non sopporta delle pratiche comuni.",
    4: "DOMANDA 5 - ANTI-GOALS: Chiedi cosa rifiuta di fare, quali richieste declina sempre, cosa non fara' mai.",
    5: "DOMANDA 6 - FILOSOFIA: Ultima domanda. Chiedi della sua filosofia di lavoro, un consiglio per chi inizia, o una sua convinzione controcorrente."
  };

  const explorationFocus = topicMap[questionIndex] || "";

  // Costruisci messaggi per OpenRouter
  const messages: { role: string; content: string }[] = [
    { role: "system", content: INTERVIEWER_SYSTEM_PROMPT }
  ];

  // Aggiungi storia conversazione
  for (const h of history) {
    messages.push({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.content
    });
  }

  // Aggiungi ultima risposta e contesto
  messages.push({
    role: "user",
    content: `${answer}

---
CONTESTO PER L'AI: Questa e' la domanda numero ${questionIndex + 1} di 6.
${adaptationContext}

TOPIC OBBLIGATORIO PER QUESTA DOMANDA:
${explorationFocus}

IMPORTANTE:
- La domanda deve coprire il TOPIC indicato sopra
- Personalizzala in base a quello che l'utente ha detto finora
- NON ripetere domande su aree gia' esplorate
Genera la prossima domanda.`
  });

  try {
    const fetchPromise = callOpenRouter(messages);
    const text = await Promise.race([fetchPromise, timeout(15000)]) as string;

    if (!text || text.length < 5) {
      throw new Error("AI non ha generato una domanda valida");
    }

    return stripMarkdown(text);
  } catch (error) {
    // Ritenta
    try {
      const conversationSummary = history.map(h => `${h.role}: ${h.content.substring(0, 100)}`).join('\n');
      const retryPromise = callOpenRouter([
        { role: "system", content: INTERVIEWER_SYSTEM_PROMPT },
        { role: "user", content: `Conversazione finora:\n${conversationSummary}\n\nUltima risposta: ${answer}\n\nGenera una domanda di follow-up pertinente.` }
      ]);
      const retryText = await Promise.race([retryPromise, timeout(10000)]) as string;
      return stripMarkdown(retryText);
    } catch {
      throw new Error("Impossibile continuare l'intervista. Verifica la connessione.");
    }
  }
};

// --- VALIDATION LOGIC ---

const normalizeUrl = (url: string | undefined): string => {
  if (!url || url.toLowerCase() === 'unknown' || url.trim() === '') return '';
  let u = url.trim();
  u = u.replace(/github\.cm/g, 'github.com')
       .replace(/linkedin\.cm/g, 'linkedin.com')
       .replace(/behance\.nt/g, 'behance.net');

  if (!u.startsWith('http://') && !u.startsWith('https://')) {
    u = 'https://' + u;
  }
  return u;
};

const validateAPF = (data: AntiPortfolio, materials: UserMaterials): AntiPortfolio => {
  const userLinks = materials.projectLinks
    .split('\n')
    .map(l => normalizeUrl(l))
    .filter(l => l.length > 5);

  if (!data.meta) {
    data.meta = { name: "", location: "", primary_links: [] };
  }

  // Usa i dati personali forniti dall'utente se l'AI non li ha popolati
  if (!data.meta.name && materials.personalData.name) {
    data.meta.name = materials.personalData.name;
  }
  if (!data.meta.location && materials.personalData.location) {
    data.meta.location = materials.personalData.location;
  }
  if (!data.meta.contact && materials.personalData.contact) {
    data.meta.contact = materials.personalData.contact;
  }

  data.meta.primary_links = (data.meta.primary_links || []).map(normalizeUrl).filter(Boolean);

  if (data.meta.primary_links.length === 0 && userLinks.length > 0) {
    data.meta.primary_links = [...userLinks];
  }

  if (data.signature?.edge && data.signature.edge.includes('.')) {
    data.signature.edge = data.signature.edge.replace(/\.\s/g, ".\n");
  }

  if (!data.decision_patterns) data.decision_patterns = [];
  if (!data.method_stack) data.method_stack = [];
  if (!data.failure_ledger) data.failure_ledger = [];
  if (!data.projects) data.projects = [];
  if (!data.proof_layer) data.proof_layer = [];
  if (!data.superpowers) data.superpowers = [];

  if (!data.loves_hates) {
    data.loves_hates = { loves: [], hates: [], will_use_if_needed: [] };
  }

  if (data.projects && userLinks.length > 0) {
    data.projects = data.projects.map((p, i) => ({
      ...p,
      links: (p.links && p.links.length > 0) ? p.links : (userLinks[i] ? [userLinks[i]] : [])
    }));
  }

  if (!data.style_dna) {
    throw new Error("L'AI non ha generato lo stile visivo. Riprova.");
  }

  if (!data.style_dna.style_seed) {
    data.style_dna.style_seed = Math.floor(Math.random() * 999) + 1;
  }

  if (!data.style_dna.component_set && data.style_dna.archetype) {
    const arch = data.style_dna.archetype;
    if (arch === 'Manifesto' || arch === 'Gallery') data.style_dna.component_set = 'fluid';
    else if (arch === 'Terminal' || arch === 'Blueprint') data.style_dna.component_set = 'atomic';
    else data.style_dna.component_set = 'structured';
  }

  return data;
};

// --- JSON UTILS ---

const cleanJsonOutput = (text: string): string => {
  let cleaned = text.trim();
  // Rimuovi markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
};

const tryRepairJSON = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    let repaired = jsonString.trim();

    const openQuotes = (repaired.match(/"/g) || []).length;
    if (openQuotes % 2 !== 0) {
      repaired += '"';
    }

    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;

    for (let i = 0; i < (openBrackets - closeBrackets); i++) repaired += ']';
    for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}';

    try {
      return JSON.parse(repaired);
    } catch (e2) {
      return null;
    }
  }
};

// --- GENERATION FUNCTIONS ---

const FAST_TIMEOUT_MS = 90000;

const prepareInput = (materials: UserMaterials, limit: number = 20000): string => {
  const personalInfo = `DATI PERSONALI:
Nome: ${materials.personalData.name || 'Non specificato'}
Location: ${materials.personalData.location || 'Non specificata'}
Contatto: ${materials.personalData.contact || 'Non specificato'}
`;

  let combined = `${personalInfo}\nRAW TEXT:\n${materials.rawText}\nLINKEDIN:\n${materials.linkedInExport}\nLINKS:\n${materials.projectLinks}`;
  if (combined.length <= limit) return combined;
  return combined.substring(0, limit);
};

// Schema JSON come stringa per il prompt (OpenRouter non supporta responseSchema nativo)
const JSON_SCHEMA_INSTRUCTIONS = `
DEVI restituire SOLO un oggetto JSON valido con questa struttura esatta:
{
  "meta": {
    "name": "string",
    "location": "string",
    "contact": "string (opzionale)",
    "primary_links": ["array di URL"]
  },
  "anti_title": "string - titolo funzionale NON job title",
  "signature": {
    "one_sentence": "string - chi sono in 2 righe",
    "three_traits": ["array di 3 tratti"],
    "edge": "string - cosa faccio meglio di molti, 3 frasi",
    "non_goals": ["array - cosa NON faccio"]
  },
  "decision_patterns": [
    {
      "pattern_name": "string",
      "when_used": "string",
      "signals": ["array"],
      "tradeoffs": ["array"],
      "example": "string"
    }
  ],
  "method_stack": [
    {
      "step": "string - verbo attivo",
      "description": "string",
      "artifacts_produced": ["array"],
      "common_failure": "string",
      "mitigation": "string"
    }
  ],
  "failure_ledger": [
    {
      "failure": "string",
      "context": "string",
      "lesson": "string",
      "rule_created": "string",
      "what_changed": "string",
      "evidence_refs": ["array"]
    }
  ],
  "loves_hates": {
    "loves": ["array"],
    "hates": ["array - almeno 3 elementi"],
    "will_use_if_needed": ["array"]
  },
  "superpowers": [
    {
      "claim": "string",
      "why_true": "string",
      "scope": "string",
      "boundaries": "string",
      "evidence": ["array"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "role_function": "string",
      "problem": "string",
      "approach": "string",
      "outcome": "string",
      "metrics": ["array"],
      "links": ["array"]
    }
  ],
  "proof_layer": [
    {
      "claim_id": "string",
      "claim_text": "string",
      "verifiability": "HIGH|MED|LOW",
      "evidence": [{"url": "string", "label": "string", "note": "string"}]
    }
  ],
  "style_dna": {
    "theme_name": "string - nome creativo unico per questo stile",
    "section_order": ["array ORDINATO: hero|edge|methodology|failures|projects|patterns|proof|loves|hates|non_goals"],
    "layout": {
      "max_width": "string CSS - es: 800px, 1000px, 1200px",
      "content_align": "left|center|right",
      "section_spacing": "string CSS - es: 3rem, 5rem, 8rem",
      "inner_padding": "string CSS - es: 1.5rem, 2rem, 3rem"
    },
    "typography": {
      "heading_font": "string font-family - es: Georgia, serif | system-ui, sans-serif | Courier, monospace",
      "body_font": "string font-family",
      "heading_size": "string CSS - es: 2rem, 3rem, 4rem",
      "body_size": "string CSS - es: 1rem, 1.1rem",
      "heading_weight": "string - es: 300, 400, 700, 900",
      "body_weight": "string - es: 300, 400, 500",
      "line_height": "string - es: 1.5, 1.7, 2",
      "letter_spacing": "string CSS - es: 0, 0.05em, -0.02em",
      "text_transform": "none|uppercase|lowercase"
    },
    "palette": {
      "background": "#hex - SCEGLI COLORI UNICI E CREATIVI",
      "surface": "#hex - colore superfici/cards",
      "text": "#hex - DEVE ESSERE LEGGIBILE su background",
      "accent": "#hex - colore principale evidenziato",
      "secondary": "#hex - colore secondario",
      "border": "#hex - colore bordi"
    },
    "borders": {
      "radius": "string CSS - es: 0, 4px, 8px, 16px, 50%",
      "width": "string CSS - es: 0, 1px, 2px, 3px",
      "style": "none|solid|dashed|double"
    },
    "effects": {
      "shadow": "string CSS box-shadow o none - es: 0 4px 20px rgba(0,0,0,0.1)",
      "hover_transform": "string CSS transform o none - es: translateY(-4px), scale(1.02)",
      "transition": "string CSS - es: all 0.3s ease",
      "background_pattern": "none o CSS gradient/pattern"
    },
    "hero": {
      "layout": "centered|left-aligned|right-aligned",
      "name_size": "string CSS - es: 3rem, 4rem, 5rem",
      "show_avatar": true|false,
      "show_location": true|false,
      "decorative_element": "none|underline|background-shape"
    },
    "cards": {
      "style": "flat|elevated|bordered|minimal",
      "padding": "string CSS - es: 1rem, 1.5rem, 2rem",
      "gap": "string CSS - es: 1rem, 1.5rem, 2rem",
      "columns": "1|2|3|auto-fit"
    }
  },
  "section_labels": {
    "edge": "string - titolo sezione competenze",
    "methodology": "string - titolo sezione metodologia",
    "failures": "string - titolo sezione fallimenti",
    "patterns": "string - titolo sezione pattern",
    "evidence": "string - titolo sezione prove",
    "projects": "string - titolo sezione progetti",
    "anti_goals": "string - titolo sezione non-obiettivi",
    "hates": "string - titolo sezione cose odiate"
  }
}

RISPONDI SOLO CON IL JSON, NESSUN ALTRO TESTO.`;

export const generateAntiPortfolioWithRetry = async (
  history: ChatMessage[],
  materials: UserMaterials,
  mode: 'fast' | 'lite' = 'fast',
  variantIndex: number = 0
): Promise<AntiPortfolio> => {
  const charLimit = mode === 'lite' ? 15000 : 30000;
  const processedMaterials = prepareInput(materials, charLimit);
  const interviewContext = history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n');

  // Genera un seed casuale per forzare variazione
  const randomSeed = Math.random().toString(36).substring(2, 8);

  let dynamicInstruction = `
SEED DI VARIAZIONE: ${randomSeed}
Usa questo seed come ispirazione per creare uno stile UNICO.

IMPORTANTE - CREA UN DESIGN COMPLETAMENTE ORIGINALE:
- Il campo "theme_name" deve essere un NOME CREATIVO E UNICO (es: "Neon Rebel", "Quiet Storm", "Digital Monk", "Chaos Architect")
- NON usare nomi generici come "Professional", "Modern", "Clean"
- La palette colori deve essere DIVERSA ogni volta - sperimenta combinazioni inusuali
- Il layout deve riflettere la PERSONALITA' specifica di questa persona
`;

  if (variantIndex > 0) {
    dynamicInstruction += `
ATTENZIONE: Questa e' una RIGENERAZIONE (Iterazione ${variantIndex}).
L'utente vuole un portfolio COMPLETAMENTE DIVERSO dalla versione precedente.

OBBLIGATORIO:
1. CREA UN TEMA VISIVO TOTALMENTE NUOVO - nuovo theme_name, nuova palette, nuovo layout
2. ESPLORA UN TRATTO DIVERSO della personalita' - Ogni persona ha molte sfaccettature
3. CAMBIA L'ORDINE DELLE SEZIONI (section_order) - Prioritizza sezioni diverse
4. USA COLORI COMPLETAMENTE DIVERSI - Se prima era scuro, ora chiaro. Se freddo, ora caldo.
5. CAMBIA LA TIPOGRAFIA - Se prima era serif, ora sans. Se bold, ora light.
6. RISCRIVI TUTTI I CONTENUTI da una prospettiva diversa

ESEMPIO DI VARIAZIONE:
- Versione 1: Developer visto come "pragmatico" -> tema scuro, mono font, layout stretto, focus su methodology
- Versione 2: STESSO developer visto come "perfezionista" -> tema chiaro, serif font, layout ampio, focus su failures
- Versione 3: STESSO developer visto come "ribelle" -> colori vivaci, bold, layout asimmetrico, focus su hates

La persona e' la STESSA, ma ogni versione la racconta da un'angolazione COMPLETAMENTE DIVERSA.
`;
  }

  const systemPrompt = `SEI UN "PROFILER DI PRODOTTO" E BIOGRAFO TECNICO.
Il tuo compito e' costruire un "Anti-Portfolio" unico che mostra CHI E' questa persona.

${dynamicInstruction}

COS'E' UN ANTI-PORTFOLIO (CRITICO - LEGGI BENE):
NON e' un CV. NON e' una lista di job titles e screenshot.
E' un formato completamente nuovo che:
- Mostra COME questa persona PENSA e risolve problemi (non COSA ha fatto)
- Rivela il suo PROCESSO e metodologia (non solo output finale)
- Racconta la sua IMPRONTA UNICA (cosa la rende diversa da altri con stesso ruolo)
- Dimostra risultati con PROOF tangibili
- Espone FALLIMENTI e lezioni apprese
- Dichiara cosa NON fa e cosa ODIA

OBIETTIVO:
Scrivere in ITALIANO NATURALE, CHIARO, SEMPLICE.
NO: gergo aziendale vuoto, frasi da CV, liste di competenze generiche
SI: frasi brevi, verita' crude, onesta' radicale, dettagli specifici

REGOLE CONTENUTO ANTI-PORTFOLIO:

=== SEZIONE PIU' IMPORTANTE: EDGE ===
**signature.edge**: Questa e' LA SEZIONE CHIAVE dell'anti-portfolio.
Deve rispondere: "COSA SO FARE MEGLIO DI CHIUNQUE ALTRO?"
NON scrivere "sono bravo in X" - quello lo dicono tutti.
SCRIVI: "Quando gli altri fanno Y, io faccio Z perche'..."
Sii SPECIFICO. Sii UNICO. Sii MEMORABILE.
Esempio buono: "Quando altri designer partono dai wireframe, io parto dalle obiezioni del cliente. Costruisco prima tutti i 'no' che sentiro', poi progetto per demolirli uno a uno."
Esempio cattivo: "Sono un designer esperto con attenzione ai dettagli."

=== ALTRE REGOLE ===
0. **meta.name**: OBBLIGATORIO. Usa il NOME E COGNOME REALE della persona dai materiali.
0b. **meta.location**: OBBLIGATORIO. Usa la location REALE dai materiali.
1. **anti_title**: NON il job title. Una definizione che cattura l'ESSENZA di come lavora (es: "Quello che rompe tutto prima di costruire", "L'ossessionato dalla documentazione").
2. **signature.one_sentence**: Una frase che nessun altro con lo stesso ruolo direbbe. Deve essere MEMORABILE.
3. **signature.three_traits**: Tre caratteristiche del suo MODO DI PENSARE, non competenze tecniche.
4. **method_stack**: Il suo PROCESSO REALE. Come affronta un problema dall'inizio. Ogni step deve mostrare il suo modo di ragionare. MINIMO 4 step.
5. **failure_ledger**: Fallimenti VERI con lezioni CONCRETE. Regole che ha creato dopo l'errore. MINIMO 2 fallimenti.
6. **decision_patterns**: COME prende decisioni. Quali segnali cerca? Quali trade-off fa? MINIMO 2 pattern.
7. **signature.non_goals**: Cosa RIFIUTA di fare anche se altri lo fanno. MINIMO 3 elementi.
8. **loves_hates.hates**: Cosa lo fa IMPAZZIRE del suo settore. Onesta' brutale. MINIMO 3 elementi.
9. **projects**: Non lista di progetti, ma PROBLEMI INTERESSANTI che ha risolto e COME li ha affrontati. Servono come PROVA dell'edge e della metodologia.

---

STILE VISIVO (style_dna) - TU SEI IL DESIGNER:

NON esistono template. TU progetti OGNI aspetto visivo da zero.
Analizza la PERSONALITA' dalle risposte dell'intervista e crea uno stile UNICO.

STEP 1 - ANALIZZA IL TONO DELLA PERSONA:
- Come risponde? (secco, riflessivo, creativo, formale, provocatorio, minimalista)
- Usa frasi lunghe o corte? Formali o informali?
- E' ordinato o caotico? Aggressivo o gentile?

STEP 2 - PROGETTA IL LAYOUT:
- max_width: quanto largo? (800px per intimo, 1200px per espansivo)
- content_align: allineato a sinistra, centrato, o a destra?
- section_spacing: sezioni ravvicinate o distanziate?
- inner_padding: tanto spazio bianco o compatto?

STEP 3 - PROGETTA LA TIPOGRAFIA:
- heading_font: serif per elegante, sans per moderno, mono per tecnico
- heading_size: grande per impatto, piccolo per sottile
- heading_weight: 300 per leggero, 900 per bold
- text_transform: uppercase per gridare, none per conversare
- letter_spacing: stretto per denso, largo per arioso

STEP 4 - CREA LA PALETTE (COLORI UNICI E BELLI):
SCEGLI COMBINAZIONI AUDACI E MEMORABILI!

ESEMPI DI PALETTE CREATIVE:
- Neon su scuro: background "#0a0a0f", accent "#00ff88", text "#e0e0e0"
- Terracotta calda: background "#fdf6e3", accent "#d35400", surface "#fff8e7"
- Blu profondo: background "#1a1a2e", accent "#4fc3f7", secondary "#7c4dff"
- Rosa punk: background "#fff0f5", accent "#ff1493", text "#2d1f3d"
- Verde foresta: background "#1b2d1b", accent "#7fff00", surface "#2d4a2d"
- Oro elegante: background "#0d0d0d", accent "#ffd700", text "#f5f5f5"
- Oceano: background "#001f3f", accent "#00bcd4", secondary "#80deea"

NON usare sempre nero/bianco/grigio. Osa con colori che EMOZIONANO.
ASSICURATI che il testo sia LEGGIBILE sullo sfondo!

STEP 5 - PROGETTA BORDI E FORME:
- radius: 0 per spigoloso, 8px per morbido, 50% per rotondo
- border width e style: nessuno, sottile, spesso, tratteggiato

STEP 6 - AGGIUNGI EFFETTI VISIVI RICCHI:
QUESTO E' CRITICO - Il portfolio deve essere BELLO e MEMORABILE!

shadow - USA OMBRE CREATIVE:
- Ombre colorate: "0 10px 40px rgba(255,100,100,0.3)" (glow rosso)
- Ombre multiple: "0 4px 6px rgba(0,0,0,0.1), 0 10px 40px rgba(0,0,0,0.2)"
- Ombre drammatiche: "0 25px 50px -12px rgba(0,0,0,0.5)"

hover_transform - ANIMAZIONI COINVOLGENTI:
- "translateY(-8px) scale(1.02)" - lift elegante
- "rotate(1deg) scale(1.05)" - tilt giocoso
- "translateX(10px)" - slide laterale

transition - TRANSIZIONI FLUIDE:
- "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" - bounce
- "all 0.3s ease-out" - smooth
- "transform 0.5s ease, box-shadow 0.3s ease" - multi-property

background_pattern - PATTERN DI SFONDO:
- "radial-gradient(circle at 20% 80%, rgba(255,100,50,0.1) 0%, transparent 50%)" - blob
- "linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%)" - diagonal
- "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)" - stripes

STEP 7 - CONFIGURA HERO E CARDS:
hero.layout: "centered" per impatto centrale, "left-aligned" per professionale, "right-aligned" per unconventional
hero.name_size: "4rem" per statement bold, "2.5rem" per elegante, "6rem" per drammatico
hero.show_avatar: true per personale, false per minimalista
hero.decorative_element: "underline" per accent colorato, "background-shape" per blob decorativo, "none" per pulito

cards.style: "elevated" con ombre, "bordered" con bordi, "flat" minimalista, "glass" con blur
cards.padding: "2rem" per spazioso, "1rem" per compatto
cards.gap: "2rem" per arioso, "0.5rem" per denso
cards.columns: "1" per narrativo, "2" per bilanciato, "3" per overview, "auto-fit" per responsive

STEP 8 - SCEGLI ICONE PER OGNI SEZIONE:
Le icone danno personalita' e carattere visivo! Scegli simboli ASCII/Unicode che riflettono il tono.

section_icons - ESEMPI PER PERSONALITA':
- Tecnico/Hacker: edge ">>", methodology "01.", failures "[X]", projects "</>", patterns "?:", proof "[v]"
- Creativo/Artistico: edge "***", methodology "~>", failures "!!!", projects "++", patterns "&&", proof "**"
- Minimalista: edge ".", methodology "-", failures "x", projects "+", patterns ":", proof "="
- Bold/Punk: edge "!!!", methodology "###", failures "XXX", projects ">>>", patterns "???", proof "!!!"
- Elegante: edge "---", methodology "i.", failures "...", projects "o", patterns ":", proof "*"

STEP 9 - STILE HEADERS (TITOLI SEZIONE):
headers.style:
- "underline": linea colorata sotto il titolo
- "boxed": titolo in un box con bordo
- "pill": titolo in una pillola colorata
- "gradient": sfondo gradient dietro il titolo
- "minimal": solo testo, nessuna decorazione
- "bracket": titolo tra parentesi [ TITOLO ]

headers.icon_position: "before" (icona prima del titolo), "after" (icona dopo), "none"
headers.decoration_color: usa il colore accent o un colore custom

STEP 10 - ANIMAZIONI:
effects.animation - scegli un'animazione per le sezioni:
- "fadeIn": apparizione graduale
- "slideUp": scorrimento dal basso
- "slideLeft": scorrimento da sinistra
- "glow": effetto luminoso pulsante
- "typewriter": effetto macchina da scrivere (per tecnici)
- "none": nessuna animazione

STEP 11 - ORDINA LE SEZIONI:
Scegli quali sezioni mostrare e in che ordine.
Sezioni: hero, edge, methodology, failures, projects, patterns, proof, loves, hates, non_goals

RICORDA: OGNI PERSONA MERITA UN DESIGN UNICO. Non ripetere mai lo stesso stile.

${JSON_SCHEMA_INSTRUCTIONS}`;

  const userPrompt = `MATERIALI INPUT:
${processedMaterials}

CONTESTO INTERVISTA:
${interviewContext}

Genera il JSON dell'Anti-Portfolio basandoti su questi dati.`;

  const dynamicTemp = Math.min(0.85 + (variantIndex * 0.05), 1.0);

  try {
    const fetchPromise = callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      { temperature: dynamicTemp, max_tokens: 8192 }
    );

    const response = await Promise.race([fetchPromise, timeout(FAST_TIMEOUT_MS)]) as string;
    if (!response) throw new Error("Empty response");

    let jsonString = cleanJsonOutput(response);
    let parsedData: AntiPortfolio | null = null;

    try {
      parsedData = JSON.parse(jsonString) as AntiPortfolio;
    } catch (parseError) {
      console.warn("Parsing failed, attempting repair...");
      parsedData = tryRepairJSON(jsonString);
    }

    if (!parsedData) {
      console.error("JSON Parse Error (Fatal)", jsonString.substring(Math.max(0, jsonString.length - 200)));
      throw new Error("Generazione interrotta. Riprova.");
    }

    return validateAPF(parsedData, materials);

  } catch (error: any) {
    console.error(`Generation failed:`, error);
    throw error;
  }
};

export const regenerateStyleOnly = async (currentData: AntiPortfolio): Promise<StyleDNA> => {
  return currentData.style_dna;
};

// =============================================================================
// GENERAZIONE HTML COMPLETO - L'AI genera l'intera pagina HTML
// =============================================================================

const HTML_GENERATION_PROMPT = `SEI UN DESIGNER RADICALE che crea ANTI-PORTFOLIO.

COSA E' UN ANTI-PORTFOLIO (CRITICO - LEGGI BENE):
NON e' un CV. NON e' un portfolio tradizionale. NON e' una lista di job titles e screenshot.
E' un formato COMPLETAMENTE NUOVO che ROMPE tutte le convenzioni.

L'Anti-Portfolio mostra:
1. COME questa persona PENSA e risolve problemi (non COSA ha fatto)
2. Il suo PROCESSO e metodologia (non solo output finale)
3. La sua IMPRONTA UNICA - cosa la rende diversa da chiunque altro con lo stesso ruolo
4. I suoi FALLIMENTI e cosa ha imparato - trasparenza radicale
5. Cosa NON fa e cosa ODIA - onesta' brutale
6. PROOF tangibili - non autodichiarazioni vuote

PRINCIPI DI DESIGN ANTI-PORTFOLIO:
- La sezione piu' importante e' "COSA SO FARE MEGLIO DI CHIUNQUE ALTRO" - deve dominare
- I FALLIMENTI devono essere visibili e celebrati come apprendimento
- Il PROCESSO/METODOLOGIA deve essere chiaro e visuale
- NON mostrare liste di skill generiche (tutti sanno usare Excel)
- NON usare layout da CV (foto tonda, timeline, lista esperienze)
- NON usare frasi da LinkedIn ("passionate professional", "team player")
- ROMPI le aspettative visive - sorprendi chi guarda

STRUTTURE ANTI-CONVENZIONALI (scegli o inventa):
- Hero che inizia con un FALLIMENTO invece del nome
- Sezione "COSA NON FACCIO" piu' grande di "cosa faccio"
- Metodologia come FLOWCHART o DIAGRAMMA interattivo
- Pattern decisionali come IF/THEN/ELSE visuale
- Fallimenti come TIMELINE con frecce verso le lezioni
- "ODIA" in evidenza con design aggressivo
- Proof come CITAZIONI VERIFICABILI con link
- Layout asimmetrico che guida l'occhio verso il contenuto importante
- Tipografia che URLA le parti importanti e sussurra i dettagli

GERARCHIA VISIVA (in ordine di importanza):
1. EDGE - "Cosa so fare meglio di chiunque altro" - MASSIMA visibilita'
2. METODOLOGIA - Come lavora, il suo processo unico
3. FALLIMENTI - Errori e lezioni apprese
4. PATTERN DECISIONALI - Come prende decisioni
5. NON-GOALS - Cosa rifiuta di fare
6. PROGETTI - Solo come PROVA di quanto sopra, non come lista

REGOLE TECNICHE:
- HTML+CSS puro, nessun framework
- CSS inline nel tag <style>
- Responsive con media queries
- Google Fonts con @import
- Animazioni CSS per enfasi
- Il testo deve essere LEGGIBILE

OUTPUT:
Restituisci SOLO il codice HTML completo, iniziando con <!DOCTYPE html>`;

export const generateHTMLFromPortfolio = async (
  data: AntiPortfolio,
  variantIndex: number = 0
): Promise<string> => {
  const randomSeed = Math.random().toString(36).substring(2, 10);

  const portfolioSummary = `
=== DATI PER L'ANTI-PORTFOLIO ===

IDENTITA':
Nome: ${data.meta?.name || 'Sconosciuto'}
Location: ${data.meta?.location || 'Non specificata'}
Anti-Titolo (NON e' un job title): ${data.anti_title || ''}
Chi sono in una frase: ${data.signature?.one_sentence || ''}

=== SEZIONE PIU' IMPORTANTE: EDGE ===
COSA SO FARE MEGLIO DI CHIUNQUE ALTRO:
${data.signature?.edge || 'Non specificato'}

Tratti distintivi del mio modo di pensare:
${data.signature?.three_traits?.map(t => '- ' + t).join('\n') || 'Nessuno'}

=== METODOLOGIA - IL MIO PROCESSO ===
Come affronto i problemi (${data.method_stack?.length || 0} step):
${data.method_stack?.map((s, i) => `STEP ${i+1}: ${s.step}
   ${s.description}
   Produce: ${s.artifacts_produced?.join(', ') || 'N/A'}
   Errore comune: ${s.common_failure || 'N/A'}`).join('\n\n') || 'Non specificata'}

=== FALLIMENTI - TRASPARENZA RADICALE ===
Errori che mi hanno insegnato qualcosa (${data.failure_ledger?.length || 0}):
${data.failure_ledger?.map(f => `FALLIMENTO: ${f.failure}
   Contesto: ${f.context || 'N/A'}
   Lezione: ${f.lesson || 'N/A'}
   REGOLA CREATA: ${f.rule_created}
   Cosa e' cambiato: ${f.what_changed || 'N/A'}`).join('\n\n') || 'Nessuno'}

=== PATTERN DECISIONALI - COME PRENDO DECISIONI ===
${data.decision_patterns?.map(p => `PATTERN: ${p.pattern_name}
   Quando: ${p.when_used}
   Segnali che cerco: ${p.signals?.join(', ') || 'N/A'}
   Trade-off: ${p.tradeoffs?.join(', ') || 'N/A'}`).join('\n\n') || 'Nessuno'}

=== COSA NON FACCIO - ONESTA' BRUTALE ===
${data.signature?.non_goals?.map(g => '- ' + g).join('\n') || 'Nessuno specificato'}

=== COSA ODIO ===
${data.loves_hates?.hates?.map(h => '- ' + h).join('\n') || 'Nessuno'}

=== COSA AMO ===
${data.loves_hates?.loves?.map(l => '- ' + l).join('\n') || 'Nessuno'}

=== PROGETTI (come PROVA, non come lista) ===
${data.projects?.map(p => `${p.name}
   Problema risolto: ${p.problem}
   Il mio approccio: ${p.approach}
   Risultato: ${p.outcome}
   Metriche: ${p.metrics?.join(', ') || 'N/A'}
   Link: ${p.links?.join(', ') || 'N/A'}`).join('\n\n') || 'Nessuno'}

=== PROOF VERIFICABILI ===
${data.proof_layer?.map(p => `[${p.verifiability}] ${p.claim_text}
   ${p.evidence?.map(e => `-> ${e.label}: ${e.url}`).join('\n   ') || 'Nessun link'}`).join('\n') || 'Nessuna'}
`;

  const variantInstructions = variantIndex > 0
    ? `\n\nQUESTA E' UNA RIGENERAZIONE (iterazione ${variantIndex}).
CREA UN DESIGN COMPLETAMENTE DIVERSO dalla versione precedente.
Cambia: layout, palette colori, tipografia, effetti, struttura.
Esplora un aspetto DIVERSO della personalita' di questa persona.`
    : '';

  const userPrompt = `SEED: ${randomSeed}
${variantInstructions}

${portfolioSummary}

GENERA L'ANTI-PORTFOLIO HTML.

RICORDA:
- L'EDGE ("cosa so fare meglio di chiunque altro") deve DOMINARE visivamente
- I FALLIMENTI devono essere CELEBRATI, non nascosti
- La METODOLOGIA deve essere visualizzata come processo/flowchart
- "COSA NON FACCIO" e "COSA ODIO" devono essere prominenti
- I PROGETTI servono solo come PROVA, non come lista di cose fatte
- ROMPI le convenzioni dei portfolio tradizionali
- NON usare layout da CV o LinkedIn

Restituisci SOLO il codice HTML (inizia con <!DOCTYPE html>).`;

  try {
    const response = await callOpenRouter(
      [
        { role: "system", content: HTML_GENERATION_PROMPT },
        { role: "user", content: userPrompt }
      ],
      { temperature: 0.9, max_tokens: 16000 }
    );

    if (!response) throw new Error("Empty HTML response");

    // Pulisci l'output
    let html = response.trim();

    // Rimuovi eventuali markdown code blocks
    if (html.startsWith('```html')) {
      html = html.replace(/^```html\s*/, '').replace(/\s*```$/, '');
    } else if (html.startsWith('```')) {
      html = html.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Verifica che sia HTML valido
    if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
      throw new Error("L'AI non ha generato HTML valido");
    }

    return html.trim();
  } catch (error: any) {
    console.error('HTML generation failed:', error);
    throw new Error("Impossibile generare l'HTML del portfolio. Riprova.");
  }
};

// Genera portfolio completo con HTML
export const generateCompleteAntiPortfolio = async (
  history: ChatMessage[],
  materials: UserMaterials,
  mode: 'fast' | 'lite' = 'fast',
  variantIndex: number = 0
): Promise<AntiPortfolio> => {
  // Step 1: Genera i dati strutturati
  const portfolioData = await generateAntiPortfolioWithRetry(history, materials, mode, variantIndex);

  // Step 2: Genera l'HTML completo basato sui dati
  try {
    const generatedHtml = await generateHTMLFromPortfolio(portfolioData, variantIndex);
    portfolioData.generated_html = generatedHtml;
  } catch (htmlError) {
    console.warn('HTML generation failed, using fallback:', htmlError);
    // Se fallisce la generazione HTML, il renderer usera' il fallback React
  }

  return portfolioData;
};

export const generateAntiPortfolio = generateCompleteAntiPortfolio;
