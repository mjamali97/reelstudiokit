# Reel Studio · le guide complet

**Langues :** [English](en.md) · [فارسی](fa.md) · [العربية](ar.md) · [Türkçe](tr.md) · [Deutsch](de.md) · Français · [Italiano](it.md)

Reel Studio est un studio de contenu qui tourne dans [Claude Code](https://claude.com/claude-code). Tu parles à Claude dans ta
langue ; il planifie tes publications, les écrit avec la voix de ta marque, monte tes reels dans 13 styles animés, crée
carrousels, stories et couvertures de stories à la une aux couleurs et polices de ta marque, publie via Zernio après ton ✅,
et t'envoie les chiffres chaque matin sur Telegram. Il convient à toute page : boulangerie, restaurant, studio photo, salon,
cabinet, boutique en ligne, expert, page personnelle, ou agence avec plusieurs clients.

---

## 1 · Essaie d'abord (5 minutes, sans compte)

```bash
git clone https://github.com/mjamali97/reelstudiokit.git my-studio
cd my-studio
bash tools/install.sh
bash telegram-bot/demo/demo.sh fr
```

Une page s'ouvre avec trois colonnes : ton **bot Studio**, ton **bot Publisher** et ta **chaîne**. Appuie sur 📝 Brouillons → ✅ sur
la publication → le ✅ final dans la colonne Publisher, et regarde-la arriver dans la chaîne. Ouvre 📊 Tableau de bord et 💬 Boîte de
réception, envoie un lien. Rien ne quitte ton ordinateur. Arrête avec Ctrl-C.

Les exemples visuels sont dans `examples/bakery/` (une boulangerie inventée) : 10 modèles de carrousel, 10 modèles de story,
des couvertures à la une. `fonts/gallery.html` montre les 30 polices. Dans Claude Code, `/demo` te fait tout visiter.

## 2 · Ce qu'il te faut

| | |
|---|---|
| Ordinateur | macOS, Linux, ou Windows avec WSL2 |
| Logiciels | git, Node 20+, Python 3.11+, ffmpeg, Google Chrome, uv (`bash tools/install.sh` indique ce qui manque et comment l'installer) |
| Claude Code | un abonnement Claude ou une clé API |
| Comptes (seulement pour passer en ligne) | un compte Instagram professionnel, [Zernio](https://zernio.com) (publication et statistiques), Telegram, une clé Gemini gratuite, un compte Cloudflare gratuit, GitHub |

Niveaux d'installation : `bash tools/install.sh` (base : carrousels, stories, sous-titres, outils de marque, bots) · `video`
(moteur de reels, minutage des mots WhisperX, correcteur typographique persan) · `all` (compétences HyperFrames et extension
d'éditeur vidéo NextWork) · `check` (rapport seulement). Tous les outils et leurs licences : `tools/STACK.md`.

## 3 · Comment se passe la configuration

Ouvre le dossier dans un terminal, lance `claude` et tape **`/setup`**. C'est une conversation, pas un formulaire ; arrête-toi
quand tu veux, il reprendra là où il s'est arrêté (`profile/SETUP-STATUS.md`). Environ une heure au total.

| phase | ce qui se passe | ce que tu fais |
|---|---|---|
| 0 Accueil | ta langue, configuration complète / démo d'abord / client d'agence | tu choisis |
| 1 Découverte | quel type d'activité, ce qui existe déjà | tu coches : site, Instagram, charte ou logo, carte ou liste de prix, Google Maps ; tu partages liens et fichiers |
| 2 Lecture | Claude lit ton site (couleurs, polices, logo, prix), tes captures Instagram et tes fichiers, puis affiche **« Voici ce que j'ai compris »** avec un aperçu de ta marque sur de vraies images | tu corriges |
| 3 Profil et voix | seulement les questions auxquelles tes documents n'ont pas répondu ; puis **la voix** : ton, tutoiement ou vouvoiement, mots utilisés et évités, et un test d'échantillons (« lequel des trois te ressemble ? ») | tu réponds, choisis, modifies |
| 4 Système de design | ton style actuel importé, ou trois pistes côte à côte ; puis appliqué à tous les outils | tu choisis ou mélanges |
| 5 Premier audit | ta page à partir des données publiques : forces, faiblesses, 5 corrections prioritaires, bio et couvertures prêtes | tu appliques les gains rapides |
| 6 Plan et formats | ton guide métier, tes propres formats de légende, carrousel, story et publication, le plan des deux premières semaines | tu choisis |
| 7–8 Comptes et bots | Zernio, chaîne et deux bots Telegram, Cloudflare et GitHub, déploiement en **mode test** | tu cliques, tu saisis toi-même les clés dans `.env` ou GitHub |
| 9 Point de départ | tes vrais chiffres, les meilleures heures de publication, l'audit complet | tu lis |
| 10 Mise en ligne | les publications arrivent dans la chaîne, Zernio quitte le mode essai | tu dis « mets en ligne » |

Tu ne colles jamais de mot de passe ni de clé dans la conversation. Claude ouvre la bonne page ; tu saisis le secret à sa place.

## 4 · Ta marque, et la modifier plus tard

Tout ce que crée le studio lit trois fichiers :
- `brand/brand.json` : couleurs, polices, logo, nom, identifiant, langue. Polices issues de la bibliothèque libre `fonts/` ou ta propre police sous licence.
- `profile/CREATOR.md` : les faits : ce que tu vends, les prix (chacun avec sa source), horaires, façon de commander, clientèle, preuves, objectifs.
- `profile/VOICE.md` : la voix : personnalité, ton, forme d'adresse, mots, emojis, réponses aux clients, phrases qui collent ou non à la marque.

Modifie tout avec **`/brand`** (« réchauffe nos couleurs », « on ne dit jamais “pas cher” », « voici notre nouveau logo »). Un aperçu
d'abord, puis `node tools/brand/apply.mjs` répercute le changement dans les styles vidéo, les couleurs et la voix du bot.

## 5 · Créer du contenu

**La boucle hebdomadaire :** `/content-plan` → tourner la liste de plans → `/reel-idea` pour chaque reel → `/reel-style` → montage →
ton ✅ → `/publish` → ✅ sur la carte dans Telegram → `/analytics` une fois par semaine.

| tu veux | tape | tu obtiens |
|---|---|---|
| une idée vérifiée et un script | `/reel-idea` (ou un lien envoyé au bot Studio) | des faits vérifiés, un script avec ta voix, un score viral avec le point faible, 2–3 styles avec leurs chances |
| un reel monté | `/reel-style`, puis le style | un montage animé 9:16 sur ta prise, contrôlé |
| un carrousel | `/carousel` | des slides 1080×1350 parmi 10 modèles : conseils, étapes, mythe/réalité, avant/après, carte de prix, FAQ, comparaison, avis client, check-list, vitrine produit |
| des stories | `/story` | des images 1080×1920 parmi 10 modèles, avec la place pour l'autocollant sondage, question, lien ou compte à rebours |
| des couvertures à la une | `/story` → à la une | jeux d'icônes pour restauration, boutique, service, créateur en trois styles |
| des sous-titres | `/captions` | sous-titres incrustés dans ta police, dans la zone sûre d'Instagram, mot à mot en option |

**Les 13 styles vidéo :**

| style | ambiance | idéal pour |
|---|---|---|
| `/clean` | tes couleurs, cartes calmes | style maison pour toute activité |
| `/vogue` | magazine | une personne ou un produit phare en héros |
| `/luxe` | noir et or, lent | bijoux, salons, gastronomie |
| `/vox` | collage et tableau d'enquête | histoires chiffrées, mythe ou réalité |
| `/swiss` | typographie géante sur grille | listes, prix, offres, actus |
| `/brutal` | bordures épaisses, couleurs vives | public jeune, boutiques, apps |
| `/pop` | bande dessinée | snacks, jouets, fêtes, street food |
| `/retro` | affiche années 70 | boulangeries, cafés, lieux familiaux |
| `/neon` | enseignes de nuit | activités du soir, bars, beauté |
| `/chalk` | ardoise du menu | cafés, restaurants, enseignement |
| `/receipt` | imprimante à tickets | prix, « ce que tu as pour ton argent », livraison |
| `/hud` | interface écran | commande, réservation, boutique en ligne |
| `/doodle` | dessiné à la main | tutoriels, recettes, astuces |

Aperçu sans rendu : `node tools/style-reel/stills.mjs neon --sheet`.

Chaque reel passe un contrôle automatique (`qa.py` : pas de visage là où il ne faut pas, pas d'image figée ni vide) et une
vérification à l'œil d'une planche à 3 images par seconde avant que tu ne le voies. Chaque carrousel et story est vérifié en planche.

## 6 · Publier

Rien n'est publié sans ton ✅. `/publish` envoie le rendu validé sur Zernio **en brouillon**, écrit la légende dans ton format,
règle le déclencheur commentaire-vers-DM et envoie une carte à ton bot Studio. Un ✅ programme Instagram (et YouTube s'il est
connecté). Les publications de la chaîne Telegram demandent un second ✅ final dans le bot Publisher, qui montre le message exact.

## 7 · Les bots Telegram

Deux bots sur un Cloudflare Worker gratuit. Leur menu parle ta langue (`LANG` dans `telegram-bot/wrangler.jsonc` : fr pour le français).

| bouton | rôle |
|---|---|
| 🎬 Reels · 💡 Idées · 📝 Brouillons | ta chaîne de production ; tout lien ou texte envoyé devient une idée, puis est analysé et noté |
| 📅 Planning | le calendrier de contenu : ce qui est programmé, ce qui manque |
| 📸 Stories · 📰 Actus | une idée de story chaque matin avec ta voix, un résumé de l'actualité de ton domaine (optionnel) |
| 🔎 Recherche | une réponse sourcée |
| 📊 Tableau de bord | une page privée : abonnés, portée, score de la page, audience, meilleures heures, toutes les publications, calendrier, concurrents |
| 💬 Boîte de réception | nouveaux commentaires et DM avec une réponse suggérée dans ta voix et tes faits : ✅ envoyer, ✏️ écrire moi-même, ❌ ignorer |
| ⚙️ État | ce qui est activé, ce qui est en mode test |
| 👥 Clients | mode agence uniquement |

**Messages automatiques :** le rapport quotidien à 09:00 (abonnés d'hier, tendance sur 7 jours, score de la page sur 100 avec ses
cinq composantes), un rapport 24 heures et 7 jours après chaque publication (vues comparées à ta médiane, enregistrements, partages,
commentaires déclencheurs, abonnements), un rapport hebdomadaire sur les concurrents et un rapport PDF mensuel.

## 8 · Chiffres et audits

`/analytics` récupère tes chiffres depuis Zernio et met à jour ce qui marche : accroches, scores des styles, jours de publication.
`/page-audit` audite toute la page (profil, grille, mix de contenus, rétention, audience vs clientèle, timing, conversion,
concurrents) : forces, faiblesses, 5 corrections prioritaires, plan sur deux semaines. Une fois par mois suffit.

## 9 · Mode agence (plusieurs clients)

```bash
node tools/client.mjs init my-first-client
node tools/client.mjs new boulangerie-lyon "Boulangerie Lyon"
node tools/client.mjs use boulangerie-lyon
```

Lance `/setup` pour chaque client (« Configurer un client »). Un compte Zernio avec un **profil** par client, une paire de bots avec
`AGENCY: "on"` : ajoute-les depuis 👥 Clients ; chaque client peut rejoindre via un lien d'invitation et recevoir ses propres rapports,
et `node tools/client.mjs sync <slug> --id <n>` donne à l'assistant de réponses la voix et les faits de ce client. Détails : `playbook/AGENCY.md`.

## 10 · Mettre à jour

Tape `/update` (ou `bash tools/update.sh`). Il récupère la nouvelle version, garde tout ce qui t'appartient (profil, marque,
formats, reels, réglages du bot ; liste dans `.gitattributes`) et montre les nouveautés et si une action est nécessaire.

## 11 · Langues

- **Contenu :** toute langue que Claude écrit ; les moteurs de rendu gèrent la droite-à-gauche (persan, arabe) et la gauche-à-droite avec polices et chiffres adaptés.
- **Menus des bots :** `LANG` = `en`, `fa`, `ar`, `tr`, `de`, `fr`, `it`.
- **Ce guide :** dans les sept langues, liens en haut de page.

## 12 · Sécurité et confidentialité

- Rien n'est publié sans ton ✅ (deux fois pour Telegram). Les envois sont des brouillons.
- Les clés vivent dans `.env` (jamais commité) et dans les secrets GitHub/Cloudflare. Claude ne te demande jamais de coller une clé dans la conversation.
- Ton dépôt est privé ; le kit lui-même ne contient aucune donnée personnelle.
- Seuls les faits sourcés vont à l'écran ou en légende ; aucun prix, avis ou chiffre inventé.
- Les tests des bots tournent sur des simulations : `bash telegram-bot/test/all.sh`.

## 13 · Dépannage

| problème | solution |
|---|---|
| `install.sh` signale qu'il manque quelque chose | installe-le avec la commande affichée, relance |
| un rendu indique qu'une police n'a pas chargé | l'identifiant de police dans `brand/brand.json` n'existe pas dans `fonts/fonts.json`, ou le chemin `css` de ta police est faux |
| le bot ne répond pas | ouvre toi-même `<BOT_URL>/setup?key=<SETUP_KEY>&info=1` et vérifie les deux webhooks |
| pas de chiffres dans le rapport | le compte Instagram doit être professionnel et connecté dans Zernio ; un nouveau compte a besoin de quelques jours de données |
| la démo ne démarre pas | le port 8787 ou 8790 est occupé ; ferme l'autre programme ou regarde `telegram-bot/test/dev.log` |

## 14 · FAQ

**Dois-je montrer mon visage ?** Non. Chaque guide métier propose des formats mains seules ou produit seul.
**Est-ce seulement pour les pages persanes ?** Non. L'anglais est la langue principale ; persan, arabe, turc, allemand, français et italien sont intégrés.
**Combien ça coûte ?** Le kit est gratuit (MIT). Tu paies Claude, et Zernio au-delà de son offre gratuite.
**Puis-je utiliser mes polices ?** Oui si leur licence autorise les réseaux sociaux et la vidéo ; ajoute-la en `{"name","css"}` dans `brand/brand.json`.
**Une mise à jour écrase-t-elle mon travail ?** Non. Tes fichiers sont protégés par `.gitattributes`.

## 15 · Toutes les commandes

`/setup` `/brand` `/demo` · `/content-plan` `/reel-idea` `/reel-style` · `/clean` `/vogue` `/luxe` `/vox` `/swiss` `/brutal`
`/pop` `/retro` `/neon` `/chalk` `/receipt` `/hud` `/doodle` · `/carousel` `/story` `/captions` · `/publish` `/telegram-post` ·
`/analytics` `/page-audit` · `/update`
