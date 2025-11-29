# Imprevisti FC26 – Vanilla JS

App senza framework per estrarre imprevisti **pre‑partita** e di **mercato** per FC.

## Avvio in locale
1. Apri la cartella in VS Code
2. Installa l'estensione **Live Server** (Ritwick Dey)
3. Clic destro su `index.html` → **Open with Live Server**

> In alternativa: apri `index.html` direttamente nel browser.

## Struttura
- `assets/css/` stili separati (base, layout, components)
- `assets/js/` moduli JS: dati, store (localStorage), RNG, picker, UI, bootstrap

## Deploy su GitHub Pages
1. Inizializza repo Git e pubblica su GitHub
2. Settings → Pages → Source: `Deploy from a branch`
3. Branch: `main` (root `/`) → Save


Guida “da zero” (A→Z) per GitHub Pages
A. Avvio in locale (ultra semplice)

Apri la cartella in VS Code.

Installa l’estensione Live Server (di Ritwick Dey).

Click destro su index.html → Open with Live Server.

(Opc.) Per test immediati: apri http://localhost:xxxx/index.html?demo=1.

Senza Live Server puoi anche fare doppio click su index.html. Tutto funziona, inclusi export/import JSON.

B. Prepara il repository

Crea un repo GitHub, es. imprevisti-fc26-vanilla.

Copia i file dello ZIP nella radice del repo:

index.html
404.html
assets/
README.md


Fai commit & push su main.

C. Attiva GitHub Pages

Vai su Settings → Pages del repo.

In Source scegli: Deploy from a branch.

In Branch seleziona main e cartella / (root).

Salva. Dopo poco vedrai il messaggio “Your site is published at …”.

Se preferisci pubblicare da /docs, sposta index.html, 404.html e la cartella assets/ in docs/ e imposta Branch: main /docs.

D. Rifinisci l’Open Graph (facoltativo ma consigliato)

Apri index.html e aggiorna og:url con l’URL del tuo sito su GitHub Pages.

Se vuoi cambiare l’immagine social, sostituisci assets/img/og-image.png con una tua (1200×630).

Dove ho messo le cose

Catalogo imprevisti: assets/js/data.js (pieno di esempi reali)

Logica estrazione: assets/js/picker.js + assets/js/rng.js

UI e binding: assets/js/ui.js

Persistenza (localStorage): assets/js/store.js

Bootstrap + demo mode: assets/js/app.js (apri con ?demo=1)

Stili responsive: assets/css/ (base/layout/components)

Logo / Favicon / OG image: assets/img/logo.svg, assets/img/favicon.png, assets/img/og-image.png

Fallback SPA: 404.html