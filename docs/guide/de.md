# Reel Studio · das komplette Handbuch

**Sprachen:** [English](en.md) · [فارسی](fa.md) · [العربية](ar.md) · [Türkçe](tr.md) · Deutsch · [Français](fr.md) · [Italiano](it.md)

Reel Studio ist ein Content-Studio, das in [Claude Code](https://claude.com/claude-code) läuft. Du sprichst mit Claude in deiner
Sprache; es plant deine Beiträge, schreibt sie in der Stimme deiner Marke, schneidet Reels in 13 Motion-Stilen, gestaltet
Karussells, Stories und Highlight-Cover in deinen Markenfarben und -schriften, veröffentlicht nach deinem ✅ über Zernio und
schickt dir jeden Morgen die Zahlen in Telegram. Es passt zu jeder Seite: Bäckerei, Restaurant, Fotostudio, Salon, Praxis,
Onlineshop, Expertin oder Experte, persönliche Seite – oder eine Agentur mit vielen Kunden.

---

## 1 · Erst ausprobieren (5 Minuten, ohne Konten)

```bash
git clone https://github.com/mjamali97/reelstudiokit.git my-studio
cd my-studio
bash tools/install.sh
bash telegram-bot/demo/demo.sh de
```

Eine Seite mit drei Spalten öffnet sich: dein **Studio-Bot**, dein **Publisher-Bot** und dein **Kanal**. Tippe 📝 Entwürfe →
✅ beim Beitrag → das finale ✅ in der Publisher-Spalte, und sieh zu, wie er im Kanal ankommt. Öffne 📊 Dashboard und 💬 Posteingang,
schick irgendeinen Link. Nichts verlässt deinen Rechner. Mit Ctrl-C beenden.

Die Beispiele liegen in `examples/bakery/` (eine erfundene Bäckerei): 10 Karussell-Vorlagen, 11 Story-Vorlagen, Highlight-Cover.
`fonts/gallery.html` zeigt die 51 Schriften. In Claude Code führt dich `/demo` durch alles.

## 2 · Was du brauchst

| | |
|---|---|
| Rechner | macOS, Linux oder Windows mit WSL2 |
| Software | git, Node 20+, Python 3.11+, ffmpeg, Google Chrome, uv (`bash tools/install.sh` sagt dir, was fehlt und wie du es installierst) |
| Claude Code | ein Claude-Abo oder ein API-Schlüssel |
| Konten (nur zum Live-Gehen) | professionelles Instagram-Konto, [Zernio](https://zernio.com) (Veröffentlichen und Zahlen), Telegram, ein kostenloser Gemini-Schlüssel, ein kostenloses Cloudflare-Konto, GitHub |

Installationsstufen: `bash tools/install.sh` (Basis: Karussells, Stories, Untertitel, Marken-Tools, Bots) · `video` (Reel-Engine,
WhisperX-Wortzeiten, persischer Typografie-Linter) · `all` (HyperFrames-Skills und das NextWork-Videoeditor-Plugin) · `check`
(nur Bericht). Alle Tools und Lizenzen: `tools/STACK.md`.

## 3 · So läuft die Einrichtung

Öffne den Ordner im Terminal, starte `claude` und tippe **`/setup`**. Es ist ein Gespräch, kein Formular; du kannst jederzeit
aufhören, es macht dort weiter (`profile/SETUP-STATUS.md`). Insgesamt etwa eine Stunde.

| Phase | was passiert | was du tust |
|---|---|---|
| 0 Begrüßung | deine Sprache, komplette Einrichtung / erst Demo / Agenturkunde | auswählen |
| 1 Erkunden | welches Geschäft, was es schon gibt | ankreuzen: Website, Instagram, Markenhandbuch oder Logo, Speisekarte oder Preisliste, Google Maps; Links und Dateien teilen |
| 2 Lesen | Claude liest deine Website (Farben, Schriften, Logo, Preise), deine Instagram-Screenshots und Dateien und zeigt **„Das habe ich verstanden“** mit einer Vorschau deiner Marke auf echten Frames | Fehler korrigieren |
| 3 Profil und Stimme | nur die Fragen, die dein Material nicht beantwortet; dann **die Markenstimme**: Tonfall, du oder Sie, Wörter, die du nutzt und meidest, und ein Probetest („Welcher der drei klingt nach dir?“) | antworten, wählen, bearbeiten |
| 4 Designsystem | dein bestehender Look wird übernommen, oder drei Richtungen nebeneinander zur Auswahl; dann auf alle Tools angewendet | wählen oder mischen |
| 5 Erstes Audit | deine Seite aus öffentlichen Daten: Stärken, Schwächen, Top-5-Korrekturen, fertige Bio und Highlight-Cover | Quick Wins umsetzen |
| 6 Plan und Formate | dein Branchen-Playbook, deine eigenen Formate für Caption, Karussell, Story und Beitrag, der Plan für die ersten zwei Wochen | auswählen |
| 7–8 Konten und Bots | Zernio, Telegram-Kanal und zwei Bots, Cloudflare und GitHub, Deployment im **Testmodus** | durchklicken, Schlüssel selbst in `.env` oder GitHub eintragen |
| 9 Ausgangswerte | deine echten Zahlen, beste Posting-Zeiten, das vollständige Audit | lesen |
| 10 Live gehen | Beiträge erreichen den Kanal, Zernio verlässt den Probemodus | „geh live“ sagen |

Du fügst nie ein Passwort oder einen Schlüssel in den Chat ein. Claude öffnet die richtige Seite; das Geheimnis trägst du selbst ein.

## 4 · Deine Marke – und sie später ändern

Alles, was das Studio macht, liest drei Dateien:
- `brand/brand.json`: Farben, Schriften, Logo, Name, Handle, Sprache. Schriften aus der Open-Licence-Bibliothek in `fonts/` oder deine eigene lizenzierte Schrift.
- `profile/CREATOR.md`: die Fakten: was du verkaufst, Preise (jeweils mit Quelle), Öffnungszeiten, wie bestellt wird, Kundschaft, Belege, Ziele.
- `profile/VOICE.md`: die Stimme: Persönlichkeit, Ton, Anrede, Wörter, Emojis, Antworten an Kunden, passende und unpassende Sätze.

Ändere alles mit **`/brand`** („mach unsere Farben wärmer“, „wir sagen nie ‚billig‘“, „hier ist unser neues Logo“). Erst kommt eine
Vorschau, dann überträgt `node tools/brand/apply.mjs` die Änderung in die Videostile, die Bot-Farben und die Bot-Stimme.

## 5 · Inhalte machen

**Der Wochenrhythmus:** `/content-plan` → die Shotliste drehen → `/reel-idea` je Reel → `/reel-style` → Schnitt → dein ✅ →
`/publish` → ✅ auf der Karte in Telegram → einmal pro Woche `/analytics`.

| du willst | tippe | du bekommst |
|---|---|---|
| eine geprüfte Idee mit Skript | `/reel-idea` (oder einen Link an den Studio-Bot) | geprüfte Fakten, ein Skript in deiner Stimme, einen Viral-Score mit der schwächsten Stelle, 2–3 Stile mit Chancen |
| ein geschnittenes Reel | `/reel-style`, dann den Stil | einen 9:16-Motion-Schnitt auf deiner Aufnahme, QA-geprüft |
| ein Karussell | `/carousel` | 1080×1350-Slides aus 10 Vorlagen: Tipps, Schritte, Mythos/Fakt, Vorher/Nachher, Preisliste, FAQ, Vergleich, Kundenstimme, Checkliste, Produktvitrine |
| Stories | `/story` | 1080×1920-Frames aus 10 Vorlagen, mit Platz für Umfrage-, Fragen-, Link- oder Countdown-Sticker |
| Highlight-Cover | `/story` → Highlights | Icon-Sets für Essen, Shop, Dienstleistung, Creator in drei Stilen |
| Untertitel im Video | `/captions` | eingebrannte Untertitel in deiner Schrift, im sicheren Bereich von Instagram, optional Wort für Wort |

**Die 13 Videostile:**

| Stil | Gefühl | ideal für |
|---|---|---|
| `/clean` | deine Markenfarben, ruhige Karten | Hausstil für jedes Geschäft |
| `/vogue` | Magazin | eine Person oder ein Signature-Produkt als Held |
| `/luxe` | Schwarz und Gold, langsam | Schmuck, Salons, gehobene Küche |
| `/vox` | Collage und Beweistafel | Geschichten mit Zahlen, Mythos vs. Fakt |
| `/swiss` | riesige Typo im Raster | Listen, Preise, Angebote, News |
| `/brutal` | dicke Rahmen, laute Farben | junges Publikum, Shops, Apps |
| `/pop` | Comic | Snacks, Spielzeug, Partys, Streetfood |
| `/retro` | 70er-Plakat | Bäckereien, Cafés, Familienlokale |
| `/neon` | Leuchtreklame | Abendgeschäft, Bars, Beauty |
| `/chalk` | Kreidetafel | Cafés, Restaurants, Unterricht |
| `/receipt` | Bondrucker | Preise, „was du fürs Geld bekommst“, Lieferung |
| `/hud` | Bildschirm-Interface | Bestellen, Buchen, Onlineshops |
| `/doodle` | handgezeichnet auf Papier | Anleitungen, Rezepte, Tipps |

Vorschau ohne Rendern: `node tools/style-reel/stills.mjs neon --sheet`.

**Bilder, Musik, Icons: nur, was du nutzen darfst** (`/assets`). Eingebaut: ~7.000 Icons (Lucide, Tabler, Phosphor, Heroicons),
CC0-Illustrationen in deinen Markenfarben (Open Doodles; Open-Peeps-Figuren aus jedem Wort), Noto-Emojis, 51 Open-Licence-Schriften
und eine `location`-Story, deren Karte in deinen Farben aus OpenStreetMap-Daten gezeichnet wird. Pro Reel mit Quellendatei:
`node tools/assets/fetch.mjs openverse|commons|pexels|pixabay|unsplash "<was>"` für Fotos, Video-B-Roll, CC0-Musik und Soundeffekte.
Nie nicht-kommerzielles oder Share-alike-Material, nie Google-Bilder oder Beiträge anderer Seiten; Stock ist „ein Kuchen“, nie „unser Kuchen“.

Jedes Reel durchläuft vor deinen Augen eine automatische QA (`qa.py`: kein Gesicht im B-Roll, keine eingefrorenen oder leeren
Frames) und eine Sichtprüfung eines Kontaktbogens mit 3 Bildern pro Sekunde. Jedes Karussell und jede Story wird als Kontaktbogen geprüft.

## 6 · Veröffentlichen

Nichts wird ohne dein ✅ veröffentlicht. `/publish` lädt das freigegebene Video als **Entwurf** zu Zernio hoch, schreibt die Caption
in deinem Format, richtet das Kommentar-zu-DM-Gate ein und schickt eine Karte an deinen Studio-Bot. Ein ✅ plant Instagram (und
YouTube, falls verbunden). Telegram-Kanalbeiträge brauchen ein zweites, finales ✅ im Publisher-Bot, der den Beitrag exakt zeigt.

## 7 · Die Telegram-Bots

Zwei Bots auf einem kostenlosen Cloudflare Worker. Ihr Menü spricht deine Sprache (`LANG` in `telegram-bot/wrangler.jsonc`: de für Deutsch).

| Taste | was sie tut |
|---|---|
| 🎬 Reels · 💡 Ideen · 📝 Entwürfe | deine Pipeline; jeder Link oder Text wird als Idee gespeichert, dann recherchiert und bewertet |
| 📅 Plan | der Content-Kalender: was geplant ist, was fehlt |
| 📸 Stories · 📰 News | jeden Morgen eine Story-Idee in deiner Stimme, ein News-Digest deiner Branche (optional) |
| 🔎 Suche | eine Antwort mit Quellen |
| 📊 Dashboard | eine private Seite: Follower, Reichweite, Seiten-Score, Publikum, beste Zeiten, alle Beiträge, Kalender, Wettbewerber |
| 💬 Posteingang | neue Kommentare und DMs mit Antwortvorschlag in deiner Stimme und mit deinen Fakten: ✅ senden, ✏️ selbst schreiben, ❌ ignorieren |
| ⚙️ Status | was an ist, was im Testmodus läuft |
| 👥 Kunden | nur im Agenturmodus |

**Automatische Nachrichten:** täglicher Bericht um 09:00 (Follower von gestern, 7-Tage-Trend, Seiten-Score von 100 mit seinen fünf
Teilen), ein Bericht 24 Stunden und 7 Tage nach jedem Beitrag (Aufrufe im Vergleich zu deinem Median, Speicherungen, Shares,
Gate-Kommentare, Follows), ein wöchentlicher Wettbewerbsbericht und ein monatlicher PDF-Bericht.

## 8 · Zahlen und Audits

`/analytics` holt deine Zahlen aus Zernio und aktualisiert, was funktioniert: Hooks, Stil-Scores, Posting-Tage.
`/page-audit` prüft die ganze Seite (Profil, Raster, Content-Mix, Verweildauer, Publikum vs. Kundschaft, Timing, Conversion,
Wettbewerber): Stärken, Schwächen, Top-5-Korrekturen, Zwei-Wochen-Plan. Einmal im Monat reicht.

## 9 · Agenturmodus (viele Kunden)

Die Nutzung für Kunden braucht eine kommerzielle Lizenz (`COMMERCIAL-LICENSE.md`); den Agenturmodus auszuprobieren ist kostenlos.

```bash
node tools/client.mjs init my-first-client
node tools/client.mjs new baeckerei-berlin "Bäckerei Berlin"
node tools/client.mjs use baeckerei-berlin
```

Führe `/setup` pro Kunde aus („Einen Kunden einrichten“). Ein Zernio-Konto mit einem **Profil** pro Kunde, ein Bot-Paar mit
`AGENCY: "on"`: über 👥 Kunden hinzufügen; jeder Kunde kann per Einladungslink beitreten und seine eigenen Berichte erhalten, und
`node tools/client.mjs sync <slug> --id <n>` gibt dem Posteingangs-Assistenten die Stimme und Fakten dieses Kunden. Details: `playbook/AGENCY.md`.

## 10 · Aktualisieren

Tippe `/update` (oder `bash tools/update.sh`). Es holt die neue Version, behält alles, was dir gehört (Profil, Marke, Formate,
Reels, Bot-Einstellungen; Liste in `.gitattributes`), und zeigt, was neu ist und ob du etwas tun musst.

## 11 · Sprachen

- **Inhalte:** jede Sprache, die Claude schreibt; die Renderer beherrschen Rechts-nach-links (Persisch, Arabisch) und Links-nach-rechts mit passenden Schriften und Ziffern.
- **Bot-Menüs:** `LANG` = `en`, `fa`, `ar`, `tr`, `de`, `fr`, `it`.
- **Dieses Handbuch:** in allen sieben Sprachen, oben verlinkt.

## 12 · Sicherheit und Datenschutz

- Nichts wird ohne dein ✅ veröffentlicht (bei Telegram zweimal). Uploads sind Entwürfe.
- Schlüssel liegen in `.env` (nie committet) und in GitHub-/Cloudflare-Secrets. Claude bittet dich nie, einen Schlüssel in den Chat zu kopieren.
- Dein Repository ist privat; das Kit selbst enthält keine persönlichen Daten.
- Auf den Bildschirm oder in die Caption kommt nur, was eine Quelle hat; keine erfundenen Preise, Bewertungen oder Zahlen.
- Die Bot-Tests laufen gegen Attrappen: `bash telegram-bot/test/all.sh`.

## 13 · Fehlerbehebung

| Problem | Lösung |
|---|---|
| `install.sh` meldet, dass etwas fehlt | mit dem angezeigten Befehl installieren, erneut ausführen |
| ein Render meldet, dass eine Schrift nicht geladen wurde | die Schrift-ID in `brand/brand.json` steht nicht in `fonts/fonts.json`, oder der `css`-Pfad deiner Schrift ist falsch |
| der Bot antwortet nicht | öffne selbst `<BOT_URL>/setup?key=<SETUP_KEY>&info=1` und prüfe beide Webhooks |
| keine Zahlen im Bericht | das Instagram-Konto muss professionell und in Zernio verbunden sein; neue Konten brauchen ein paar Tage Daten |
| die Demo startet nicht | Port 8787 oder 8790 ist belegt; anderes Programm schließen oder `telegram-bot/test/dev.log` ansehen |

## 14 · FAQ

**Muss ich mein Gesicht zeigen?** Nein. Jedes Playbook hat Formate nur mit Händen oder nur mit Produkt.
**Ist es nur für persische Seiten?** Nein. Englisch ist die Hauptsprache; Persisch, Arabisch, Türkisch, Deutsch, Französisch und Italienisch sind eingebaut.
**Was kostet es?** Für deine eigene Marke oder dein Geschäft kostenlos (Business Source License 1.1); eine Agentur, ein Studio oder Freelancer, die es für Kunden nutzen, brauchen eine kommerzielle Lizenz (`COMMERCIAL-LICENSE.md`). Jede Version wird nach vier Jahren Apache-2.0. Du zahlst für Claude und für Zernio über dessen Gratisstufe hinaus.
**Kann ich meine eigenen Schriften nutzen?** Ja, wenn die Lizenz Social Media und Video erlaubt; als `{"name","css"}` in `brand/brand.json` eintragen.
**Überschreibt ein Update meine Arbeit?** Nein. Deine Dateien sind über `.gitattributes` geschützt.

## 15 · Alle Befehle

`/setup` `/brand` `/demo` · `/content-plan` `/reel-idea` `/reel-style` · `/clean` `/vogue` `/luxe` `/vox` `/swiss` `/brutal`
`/pop` `/retro` `/neon` `/chalk` `/receipt` `/hud` `/doodle` · `/carousel` `/story` `/captions` · `/publish` `/telegram-post` ·
`/analytics` `/page-audit` · `/assets` · `/update`
