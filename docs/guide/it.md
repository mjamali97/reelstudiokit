# Reel Studio · la guida completa

**Lingue:** [English](en.md) · [فارسی](fa.md) · [العربية](ar.md) · [Türkçe](tr.md) · [Deutsch](de.md) · [Français](fr.md) · Italiano

Reel Studio è uno studio di contenuti che gira dentro [Claude Code](https://claude.com/claude-code). Parli con Claude nella tua
lingua; pianifica i tuoi post, li scrive con la voce del tuo brand, monta i reel in 13 stili animati, crea caroselli, storie e
copertine delle storie in evidenza con i colori e i font del tuo brand, pubblica tramite Zernio dopo il tuo ✅ e ogni mattina ti
manda i numeri su Telegram. Va bene per qualsiasi pagina: pasticceria, ristorante, studio fotografico, salone, studio medico,
negozio online, professionista, pagina personale, o un'agenzia con molti clienti.

---

## 1 · Prima provalo (5 minuti, nessun account)

```bash
git clone https://github.com/mjamali97/reelstudiokit.git my-studio
cd my-studio
bash tools/install.sh
bash telegram-bot/demo/demo.sh it
```

Si apre una pagina con tre colonne: il tuo **bot Studio**, il tuo **bot Publisher** e il tuo **canale**. Premi 📝 Bozze → ✅ sul post →
il ✅ finale nella colonna Publisher, e guardalo arrivare nel canale. Apri 📊 Dashboard e 💬 Posta in arrivo, invia un link.
Nulla esce dal tuo computer. Fermalo con Ctrl-C.

Gli esempi visivi sono in `examples/bakery/` (una pasticceria inventata): 10 modelli di carosello, 11 modelli di storia, copertine
in evidenza. `fonts/gallery.html` mostra i 51 font. In Claude Code, `/demo` ti guida attraverso tutto.

## 2 · Cosa ti serve

| | |
|---|---|
| Computer | macOS, Linux, o Windows con WSL2 |
| Software | git, Node 20+, Python 3.11+, ffmpeg, Google Chrome, uv (`bash tools/install.sh` ti dice cosa manca e come installarlo) |
| Claude Code | un abbonamento Claude o una chiave API |
| Account (solo per andare online) | un account Instagram professionale, [Zernio](https://zernio.com) (pubblicazione e statistiche), Telegram, una chiave Gemini gratuita, un account Cloudflare gratuito, GitHub |

Livelli di installazione: `bash tools/install.sh` (base: caroselli, storie, sottotitoli, strumenti del brand, bot) · `video` (motore
dei reel, tempi delle parole con WhisperX, correttore tipografico persiano) · `all` (skill HyperFrames e plugin dell'editor video
NextWork) · `check` (solo rapporto). Tutti gli strumenti e le licenze: `tools/STACK.md`.

## 3 · Come funziona la configurazione

Apri la cartella nel terminale, avvia `claude` e scrivi **`/setup`**. È una conversazione, non un modulo; fermati quando vuoi,
riprenderà da dove si era fermato (`profile/SETUP-STATUS.md`). Circa un'ora in tutto.

| fase | cosa succede | cosa fai |
|---|---|---|
| 0 Benvenuto | la tua lingua, configurazione completa / prima la demo / cliente di un'agenzia | scegli |
| 1 Scoperta | che tipo di attività, cosa esiste già | spunti: sito, Instagram, manuale del brand o logo, menù o listino, Google Maps; condividi link e file |
| 2 Lettura | Claude legge il tuo sito (colori, font, logo, prezzi), gli screenshot di Instagram e i tuoi file, poi mostra **«Ecco cosa ho capito»** con un'anteprima del brand su fotogrammi reali | correggi |
| 3 Profilo e voce | solo le domande a cui il tuo materiale non ha risposto; poi **la voce**: tono, tu o Lei, parole che usi ed eviti, e un test di esempi («quale dei tre ti somiglia?») | rispondi, scegli, modifichi |
| 4 Design system | il tuo stile attuale importato, o tre direzioni affiancate; poi applicato a tutti gli strumenti | scegli o mescoli |
| 5 Primo audit | la tua pagina dai dati pubblici: punti di forza e deboli, 5 correzioni principali, bio e copertine pronte | applichi le vittorie rapide |
| 6 Piano e formati | il manuale della tua attività, i tuoi formati di didascalia, carosello, storia e post, il piano delle prime due settimane | scegli |
| 7–8 Account e bot | Zernio, canale e due bot Telegram, Cloudflare e GitHub, deploy in **modalità test** | clicchi, inserisci tu le chiavi in `.env` o su GitHub |
| 9 Punto di partenza | i tuoi numeri reali, gli orari migliori, l'audit completo | leggi |
| 10 Online | i post arrivano al canale, Zernio esce dalla modalità prova | dici «vai online» |

Non incolli mai una password o una chiave nella chat. Claude apre la pagina giusta; il segreto lo scrivi tu al suo posto.

## 4 · Il tuo brand, e cambiarlo in seguito

Tutto ciò che lo studio produce legge tre file:
- `brand/brand.json`: colori, font, logo, nome, handle, lingua. Font dalla libreria con licenza libera in `fonts/` o il tuo font con licenza.
- `profile/CREATOR.md`: i fatti: cosa vendi, i prezzi (ognuno con la sua fonte), orari, come si ordina, clientela, prove, obiettivi.
- `profile/VOICE.md`: la voce: personalità, tono, forma di cortesia, parole, emoji, risposte ai clienti, frasi in linea e fuori linea.

Cambia tutto con **`/brand`** («rendi i colori più caldi», «non diciamo mai “economico”», «ecco il nuovo logo»). Prima un'anteprima,
poi `node tools/brand/apply.mjs` porta la modifica negli stili video, nei colori e nella voce del bot.

## 5 · Creare contenuti

**Il ciclo settimanale:** `/content-plan` → gira la lista delle inquadrature → `/reel-idea` per ogni reel → `/reel-style` → montaggio →
il tuo ✅ → `/publish` → ✅ sulla scheda in Telegram → `/analytics` una volta a settimana.

| vuoi | scrivi | ottieni |
|---|---|---|
| un'idea verificata con copione | `/reel-idea` (o un link al bot Studio) | fatti verificati, un copione con la tua voce, un punteggio virale con il punto debole, 2–3 stili con le probabilità |
| un reel montato | `/reel-style`, poi lo stile | un montaggio animato 9:16 sulla tua ripresa, controllato |
| un carosello | `/carousel` | slide 1080×1350 da 10 modelli: consigli, passaggi, mito/realtà, prima/dopo, listino, FAQ, confronto, recensione, checklist, vetrina prodotto |
| storie | `/story` | fotogrammi 1080×1920 da 10 modelli, con lo spazio per l'adesivo sondaggio, domanda, link o conto alla rovescia |
| copertine in evidenza | `/story` → in evidenza | set di icone per cibo, negozio, servizi, creator in tre stili |
| sottotitoli sul video | `/captions` | sottotitoli impressi nel tuo font, nella zona sicura di Instagram, parola per parola a scelta |

**I 13 stili video:**

| stile | atmosfera | ideale per |
|---|---|---|
| `/clean` | i colori del tuo brand, schede calme | stile di casa per ogni attività |
| `/vogue` | rivista | una persona o un prodotto simbolo come protagonista |
| `/luxe` | nero e oro, lento | gioielli, saloni, alta cucina |
| `/vox` | collage e lavagna delle prove | storie con numeri, mito o realtà |
| `/swiss` | tipografia gigante su griglia | liste, prezzi, offerte, notizie |
| `/brutal` | bordi spessi, colori accesi | pubblico giovane, negozi, app |
| `/pop` | fumetto | snack, giocattoli, feste, street food |
| `/retro` | poster anni '70 | pasticcerie, caffè, locali per famiglie |
| `/neon` | insegne notturne | attività serali, bar, bellezza |
| `/chalk` | lavagna del menù | caffè, ristoranti, insegnamento |
| `/receipt` | stampante di scontrini | prezzi, «cosa ottieni con i tuoi soldi», consegne |
| `/hud` | interfaccia a schermo | ordini, prenotazioni, negozi online |
| `/doodle` | disegnato a mano su carta | tutorial, ricette, consigli |

Anteprima senza render: `node tools/style-reel/stills.mjs neon --sheet`.

**Immagini, musica, icone: solo ciò che puoi usare** (`/assets`). Incluso: ~7.000 icone (Lucide, Tabler, Phosphor, Heroicons),
illustrazioni CC0 ricolorate col tuo brand (Open Doodles; personaggi Open Peeps da qualsiasi parola), emoji Noto, 51 font a licenza libera
e una storia `location` con la mappa disegnata nei tuoi colori dai dati OpenStreetMap. Per ogni reel, con un file dei crediti:
`node tools/assets/fetch.mjs openverse|commons|pexels|pixabay|unsplash "<cosa>"` per foto, b-roll video, musica ed effetti sonori CC0.
Mai materiale non commerciale o share-alike, mai Google Immagini o il post di un'altra pagina; lo stock è «una torta», mai «la nostra torta».

Ogni reel passa un controllo automatico (`qa.py`: nessun volto dove non deve esserci, nessun fotogramma bloccato o vuoto) e un
controllo a occhio di un provino a 3 fotogrammi al secondo prima che tu lo veda. Ogni carosello e storia viene controllato come provino.

## 6 · Pubblicare

Nulla viene pubblicato senza il tuo ✅. `/publish` carica il render approvato su Zernio **come bozza**, scrive la didascalia nel tuo
formato, imposta il meccanismo commento-a-DM e invia una scheda al bot Studio. Un ✅ programma Instagram (e YouTube se collegato).
I post del canale Telegram richiedono un secondo ✅ finale nel bot Publisher, che mostra il post esatto.

## 7 · I bot Telegram

Due bot su un Cloudflare Worker gratuito. Il loro menù parla la tua lingua (`LANG` in `telegram-bot/wrangler.jsonc`: it per l'italiano).

| pulsante | cosa fa |
|---|---|
| 🎬 Reel · 💡 Idee · 📝 Bozze | la tua linea di produzione; ogni link o testo inviato diventa un'idea, poi viene analizzato e valutato |
| 📅 Calendario | il calendario dei contenuti: cosa è programmato, cosa manca |
| 📸 Storie · 📰 Notizie | ogni mattina un'idea per una storia con la tua voce, un riassunto delle notizie del tuo settore (opzionale) |
| 🔎 Cerca | una risposta con le fonti |
| 📊 Dashboard | una pagina privata: follower, copertura, punteggio della pagina, pubblico, orari migliori, tutti i post, calendario, concorrenti |
| 💬 Posta in arrivo | nuovi commenti e DM con una risposta suggerita nella tua voce e con i tuoi dati: ✅ invia, ✏️ scrivo io, ❌ ignora |
| ⚙️ Stato | cosa è attivo, cosa è in modalità test |
| 👥 Clienti | solo in modalità agenzia |

**Messaggi automatici:** il rapporto giornaliero alle 09:00 (follower di ieri, andamento a 7 giorni, punteggio della pagina su 100 con
le sue cinque parti), un rapporto 24 ore e 7 giorni dopo ogni post (visualizzazioni rispetto alla tua mediana, salvataggi,
condivisioni, commenti al meccanismo, nuovi follower), un rapporto settimanale sui concorrenti e un rapporto PDF mensile.

## 8 · Numeri e audit

`/analytics` prende i tuoi numeri da Zernio e aggiorna ciò che funziona: ganci, punteggi degli stili, giorni di pubblicazione.
`/page-audit` analizza tutta la pagina (profilo, griglia, mix di contenuti, ritenzione, pubblico rispetto ai clienti, tempistica,
conversione, concorrenti): punti di forza e deboli, 5 correzioni principali, piano di due settimane. Una volta al mese basta.

## 9 · Modalità agenzia (più clienti)

```bash
node tools/client.mjs init my-first-client
node tools/client.mjs new forno-roma "Forno Roma"
node tools/client.mjs use forno-roma
```

Esegui `/setup` per ogni cliente («Configura un cliente»). Un account Zernio con un **profilo** per cliente, una coppia di bot con
`AGENCY: "on"`: aggiungili da 👥 Clienti; ogni cliente può unirsi con un link di invito e ricevere i propri rapporti, e
`node tools/client.mjs sync <slug> --id <n>` dà all'assistente delle risposte la voce e i dati di quel cliente. Dettagli: `playbook/AGENCY.md`.

## 10 · Aggiornare

Scrivi `/update` (o `bash tools/update.sh`). Scarica la nuova versione, mantiene tutto ciò che è tuo (profilo, brand, formati, reel,
impostazioni del bot; elenco in `.gitattributes`) e mostra le novità e se serve un'azione da parte tua.

## 11 · Lingue

- **Contenuti:** qualsiasi lingua che Claude scrive; i renderer gestiscono la scrittura da destra a sinistra (persiano, arabo) e da sinistra a destra con font e cifre adatti.
- **Menù dei bot:** `LANG` = `en`, `fa`, `ar`, `tr`, `de`, `fr`, `it`.
- **Questa guida:** in tutte e sette le lingue, collegate in alto.

## 12 · Sicurezza e privacy

- Nulla viene pubblicato senza il tuo ✅ (due volte per Telegram). I caricamenti sono bozze.
- Le chiavi stanno in `.env` (mai nel commit) e nei segreti di GitHub/Cloudflare. Claude non ti chiede mai di incollare una chiave in chat.
- Il tuo repository è privato; il kit stesso non contiene dati personali.
- Sullo schermo o nelle didascalie vanno solo fatti con una fonte; nessun prezzo, recensione o numero inventato.
- I test dei bot girano su simulazioni: `bash telegram-bot/test/all.sh`.

## 13 · Risoluzione dei problemi

| problema | soluzione |
|---|---|
| `install.sh` dice che manca qualcosa | installalo con il comando che stampa, poi rilancia |
| un render dice che un font non è stato caricato | l'id del font in `brand/brand.json` non è in `fonts/fonts.json`, o il percorso `css` del tuo font è sbagliato |
| il bot non risponde | apri tu `<BOT_URL>/setup?key=<SETUP_KEY>&info=1` e controlla entrambi i webhook |
| nessun numero nel rapporto | l'account Instagram deve essere professionale e collegato in Zernio; un account nuovo ha bisogno di qualche giorno di dati |
| la demo non parte | la porta 8787 o 8790 è occupata; chiudi l'altro programma o guarda `telegram-bot/test/dev.log` |

## 14 · Domande frequenti

**Devo mostrare il viso?** No. Ogni manuale ha formati solo mani o solo prodotto.
**È solo per pagine persiane?** No. L'inglese è la lingua principale; persiano, arabo, turco, tedesco, francese e italiano sono inclusi.
**Quanto costa?** Il kit è gratuito (MIT). Paghi Claude, e Zernio oltre il piano gratuito.
**Posso usare i miei font?** Sì, se la licenza permette social e video; aggiungilo come `{"name","css"}` in `brand/brand.json`.
**Un aggiornamento cancella il mio lavoro?** No. I tuoi file sono protetti da `.gitattributes`.

## 15 · Tutti i comandi

`/setup` `/brand` `/demo` · `/content-plan` `/reel-idea` `/reel-style` · `/clean` `/vogue` `/luxe` `/vox` `/swiss` `/brutal`
`/pop` `/retro` `/neon` `/chalk` `/receipt` `/hud` `/doodle` · `/carousel` `/story` `/captions` · `/publish` `/telegram-post` ·
`/analytics` `/page-audit` · `/assets` · `/update`
