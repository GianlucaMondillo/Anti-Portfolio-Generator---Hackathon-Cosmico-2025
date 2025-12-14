# Portfolio di Esempio

Questa cartella contiene 3 Anti-Portfolio generati con il tool per dimostrare le capacita' del sistema.

## Struttura

```
examples/
  example-1/
    portfolio.json    # Dati APF completi
    portfolio.html    # Render HTML standalone
    portfolio.md      # Versione Markdown
  example-2/
    ...
  example-3/
    ...
```

## Come generare gli esempi

1. Avvia il tool: `npm run dev`
2. Vai su http://localhost:3000
3. Per ogni esempio:
   - Incolla i materiali (contenuto CV, bio, link progetti)
   - Completa l'intervista AI (6 domande)
   - Scarica i file generati (JSON, HTML, MD)
   - Salva nella sottocartella corrispondente

## Profili suggeriti per gli esempi

Per dimostrare la versatilita' del tool, genera portfolio per profili diversi:

1. **Profilo Tecnico** (es. Developer/Engineer)
   - Focus su trade-off architetturali, debugging, metodologie di sviluppo

2. **Profilo Creativo** (es. Designer/Product)
   - Focus su processi creativi, vincoli di design, iterazioni

3. **Profilo Ibrido** (es. Tech Lead/Founder)
   - Focus su decisioni strategiche, gestione team, fallimenti di prodotto

## Note

- Ogni portfolio deve essere generato con dati reali, non inventati
- L'AI adatta automaticamente lo stile visivo al profilo
- I file JSON contengono lo schema APF completo per interoperabilita'
