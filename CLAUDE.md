# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Anti-Portfolio Generator - un tool AI-powered che genera portfolio professionali unici, focalizzati su fallimenti, trade-off e metodologie personali invece che su job title e successi curati.

**IMPORTANTE**: Questo progetto NON deve contenere dati hardcoded, mock data, o contenuti predeterminati. Tutto il contenuto deve essere generato dinamicamente dall'AI basandosi sui materiali dell'utente.

## Commands

```bash
npm install      # Installa dipendenze
npm run dev      # Avvia dev server (porta 3000)
npm run build    # Build produzione
npm run preview  # Preview build
```

## Environment

Richiede `OPENROUTER_API_KEY` in `.env.local`

## Architecture

### Application Flow

1. **Step1Materials** - Input materiali (testo copia-incollato, link)
2. **Step2Interview** - Intervista AI adattiva (6 domande generate dinamicamente)
3. **Step3Output** - Generazione portfolio HTML con stile derivato dalla personalita'

### Key Files

- `types.ts` - Schema APF (Anti-Portfolio Format)
- `services/geminiService.ts` - Logica AI (intervista + generazione)
- `components/DynamicRenderer.tsx` - Renderer procedurale stili

### AI Integration

- Modello: `gemini-2.5-flash-lite` via OpenRouter
- Le domande dell'intervista sono generate dinamicamente basandosi sui materiali
- Lo style_dna (colori, font, layout) e' derivato dalla personalita' emersa
- Nessun fallback hardcoded - se l'AI non genera, si chiede di riprovare

### Style System

StyleDNA viene generato dall'AI in base alla personalita':
- Archetypes: Dossier, Gallery, Logbook, Manifesto, Terminal, Blueprint
- Component sets: atomic, monolithic, fluid, structured
- Visual motifs: brutalist, rounded, glass, borders, minimal, technical

## Design Principles

1. **Zero hardcoding**: Mai inserire dati predeterminati o mock
2. **Domande adattive**: Ogni intervista e' unica per la persona
3. **Stile derivato**: Il design emerge dalla personalita', non da template
4. **Validazione senza invenzione**: Se l'AI non genera un campo, resta vuoto

## Language

Interfaccia e output in italiano.
