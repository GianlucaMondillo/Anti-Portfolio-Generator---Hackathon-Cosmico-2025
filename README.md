# Anti-Portfolio Generator

**Tool AI-powered per generare portfolio professionali che rompono tutte le convenzioni.**

Creato per l'Hackathon Cosmico Dicembre 2025.

---

## Cosa e' un Anti-Portfolio?

Non e' un CV. Non e' un portfolio tradizionale. E' un formato completamente nuovo che:

- Mostra **COME pensi** e risolvi problemi, non solo COSA hai fatto
- Rivela il tuo **PROCESSO** e metodologia personale
- Espone **FALLIMENTI** e lezioni apprese - trasparenza radicale
- Dichiara cosa **NON FAI** e cosa **ODI** - onesta' brutale
- Focus su "**Cosa so fare meglio di chiunque altro**"

L'Anti-Portfolio valorizza l'unicita' umana in un mondo dove l'AI puo' fare quasi tutto: le tue cicatrici, le tue opinioni, il tuo metodo - cose che nessuna AI puo' replicare.

---

## Requisiti

- Node.js (v18+)
- Chiave API OpenRouter (https://openrouter.ai - gratuita)

---

## Installazione

```bash
# 1. Clona il repository
git clone https://github.com/USERNAME/anti-portfolio-generator.git
cd anti-portfolio-generator

# 2. Installa le dipendenze
npm install

# 3. Configura la chiave API
# Apri il file .env e sostituisci il placeholder con la tua chiave OpenRouter

# 4. Avvia il server di sviluppo
npm run dev
```

Apri http://localhost:3000 nel browser.

### Ottenere la API Key (Gratuita)

1. Vai su https://openrouter.ai
2. Crea un account gratuito
3. Vai su https://openrouter.ai/keys
4. Crea una nuova API key
5. Copia la chiave nel file `.env` (sostituisci il placeholder)

---

## Come Funziona

### Step 1: Inserisci i Materiali

Incolla i tuoi dati professionali nei 3 campi:
- **Primary Data Stream**: Copia-incolla il contenuto del tuo CV, note, post-mortem di progetti
- **Bio / LinkedIn Dump**: Copia-incolla la sezione "About" o esperienza lavorativa da LinkedIn
- **Evidence Links**: Incolla i link a GitHub, Behance, case study, articoli

### Step 2: Intervista AI Adattiva (6 Domande)

L'AI ti fara' 6 domande personalizzate basate sui tuoi materiali:

1. **Edge/Unicita'**: Cosa sai fare meglio di chiunque altro con il tuo stesso ruolo?
2. **Metodologia/Processo**: Qual e' il tuo processo quando affronti un problema nuovo?
3. **Fallimenti e Lezioni**: Qual e' l'errore professionale che ti ha insegnato di piu'?
4. **Cosa Ami/Odi**: Cosa ti fa impazzire del tuo settore? Cosa non sopporti?
5. **Anti-Goals**: Cosa rifiuti di fare anche se tutti lo fanno?
6. **Filosofia/Valori**: Qual e' la tua filosofia di lavoro in una frase?

Le domande si adattano dinamicamente alle tue risposte.

### Step 3: Generazione Portfolio

L'AI genera un portfolio HTML completo e unico:
- **Design visivo unico**: colori, font, layout derivati dalla tua personalita'
- **Sezione EDGE dominante**: cosa ti rende diverso da chiunque altro
- **Fallimenti celebrati**: errori trasformati in asset di credibilita'
- **Metodologia visuale**: il tuo processo come flowchart
- **Export HTML standalone**: file pronto per essere pubblicato

---

## Output

- **Web Preview**: anteprima live del portfolio generato
- **HTML Export**: file HTML standalone (funziona senza dipendenze)
- **JSON Export**: dati strutturati in formato APF
- **Markdown Export**: versione testuale

---

## Portfolio Esempio

Tre portfolio generati per profili professionali diversi:

| Profilo | Stile | File |
|---------|-------|------|
| **Designer** (Elena Visconti) | Rosso/arancione, hero inizia con "FALLIMENTO #0" | [examples/1 - Designer/](examples/1%20-%20Designer/) |
| **Developer** (Marco Ferretti) | Dark mode, rosa/cyan, monospace | [examples/2 - Developer/](examples/2%20-%20Developer/) |
| **Marketer** (Luca Martinelli) | Chiaro, nero/rosso, animazioni CSS | [examples/3 - Marketer/](examples/3%20-%20Marketer/) |

Ogni portfolio e' **completamente diverso** per layout, colori, tipografia e struttura - generato dalla stessa AI analizzando personalita' diverse.

---

## Comandi

```bash
npm install      # Installa dipendenze
npm run dev      # Avvia dev server (porta 3000)
npm run build    # Build produzione
npm run preview  # Preview build
```

---

## Architettura

```
anti-portfolio-generator/
|-- index.tsx              # Entry point React
|-- types.ts               # Schema APF (Anti-Portfolio Format)
|-- services/
|   |-- geminiService.ts   # Logica AI (intervista + generazione HTML)
|-- components/
|   |-- Step1Materials.tsx # Upload materiali (PDF, DOCX, TXT)
|   |-- Step2Interview.tsx # Intervista AI adattiva (6 domande)
|   |-- Step3Output.tsx    # Output, preview e export
|   |-- DynamicRenderer.tsx# Rendering portfolio in iframe
|-- examples/              # 3 portfolio esempio
|-- FRAMEWORK.md           # Documento filosofia Anti-Portfolio
|-- CLAUDE.md              # Istruzioni per Claude Code
```

---

## Stack Tecnologico

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI Engine**: OpenRouter API (Gemini 2.5 Flash Lite)
- **Build**: Vite
- **Privacy**: Zero data persistence, elaborazione client-side

---

## Framework Document

Vedi [FRAMEWORK.md](./FRAMEWORK.md) per la filosofia completa:

- **Assunti base**: Cosa rende un portfolio "anti-traditional"
- **Pattern e domande**: Come raccogliamo i dati (3 fasi)
- **Principi di design**: 5 principi che guidano la generazione
- **8 elementi distintivi**: Zero job titles, Failure Ledger, Non-Goals, Decision Patterns, Loves/Hates, Superpowers con boundaries, Metriche reali, Section Labels personalizzati
- **Visione AI-Native**: Portfolio per un mondo dove l'AI e' sempre esistita

---

## Principi di Design

1. **Zero hardcoding**: nessun dato predeterminato, tutto generato dall'AI
2. **Domande adattive**: ogni intervista e' unica, basata sui materiali specifici
3. **Stile derivato**: il design emerge dalla personalita', non da template
4. **Onesta' radicale**: fallimenti in primo piano, non nascosti
5. **AI genera HTML**: l'AI crea l'intera pagina, non riempie template

---

## Licenza

MIT License

---

## Autore

**Gianluca Mondillo, MD**

Progetto creato interamente con Claude Code per l'Hackathon Cosmico Dicembre 2025.

---

*"Il portfolio tradizionale mostra cosa hai fatto. L'Anti-Portfolio mostra chi sei diventato facendolo."*
