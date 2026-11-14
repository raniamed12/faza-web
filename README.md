# FAZA — فازة · La Tunisie à ta façon

Projet web — Objectif 3 (front end complet + back end minimal avec authentification).
Groupe X : Rania Mediouni, Nour Elhadj. Cours : Dr. Maroua Nouioua.

## 1. Le site en bref
Guide collaboratif de la Tunisie : dormir (**Win nbatou ?**), manger (**Benna**), sortir (**Win nemchiw ?**),
découvrir (**لقطة / Lakta**), les événements (**جو تونسنا / Jaw Tounsna**), les pépites cachées (**Blayes mkhabbya**),
un générateur de programmes selon le budget (**FAZA MIX**) et une communauté qui propose des lieux.

## 2. Choix techniques
| Couche | Choix | Pourquoi |
|---|---|---|
| Front end | **React 18 + Vite + React Router** | Composants réutilisables, routage sans rechargement, build rapide. |
| Cartes | **Leaflet + OpenStreetMap** ; carte des 24 gouvernorats en **SVG** (geoBoundaries, CC BY 4.0) | Localisation exacte des lieux, gratuit, sans clé d’API. |
| Back end | **Node.js 22 + Express** | Autorisé par le cours ; même langage que le front. |
| Base de données | **SQLite** (better-sqlite3), 14 tables | Aucun serveur à installer : un fichier `server/data/faza.db`. |
| Authentification | **bcryptjs** (mots de passe hachés) + **JWT** (7 jours) | Standard, sans état. |

> Écart avec le cadrage (Objectif 1), qui citait Java pour le back end : Node.js a été retenu pour cet objectif. La logique (API REST, SQL, JWT) se porte telle quelle en Spring Boot.

## 3. Lancer le projet
Prérequis : **Node.js 20 ou plus**.
```bash
npm run install:all     # installe serveur + client (+ concurrently)
npm install
npm run dev             # API sur :4000 et site sur http://localhost:5173
```
La base est créée et remplie automatiquement au premier démarrage. Pour la réinitialiser : `npm run seed`.
Tests du back end : `npm test` (8 tests). Version de production : `npm run build` (dossier `client/dist`).

Compte administrateur de démonstration : `admin@faza.tn` / `Faza2026!` (à changer via `server/.env`, voir `.env.example`).

## 4. Fonctionnalités (par page)
- **Accueil** : carte vivante de la Tunisie. On choisit une ambiance (mer, désert, culture…), les gouvernorats s’éclairent selon leurs vrais lieux ; un clic ouvre le « billet » du gouvernorat ; « Surprends-moi » tire un gouvernorat ; six portes tunisiennes mènent aux rubriques ; un aperçu FAZA MIX se recalcule en direct avec le budget.
- **Explorer** : filtres rubrique / gouvernorat (liste ou clic sur la carte) / budget / recherche / pépites ; vue liste ou carte Leaflet.
- **Gouvernorat** : une page par gouvernorat avec onglets Win nbatou, Benna, Win nemchiw, Lakta, Jaw Tounsna, Blayes mkhabbya.
- **Fiche lieu** : photo ou illustration, carte avec la position, boutons **Localisation / Instagram / Facebook / Itinéraire**, avis, photos, favoris.
- **Benna** : le carnet gourmand (plats en autocollants sur 6 pages, tourner les pages) + plan de Tunis dessiné (glisser, zoomer, épingles) + fiche d’adresse (menu, photos, avis, infos, ouvert/fermé selon l’heure).
- **FAZA MIX** : budget, durée, groupe, envies → programme jour par jour, remplacement d’étapes, total recalculé, enregistrement, partage par lien. Algorithme à règles (pas d’IA), reproductible.
- **Jaw Tounsna** : événements par mois, filtres, mention « date à confirmer ».
- **Communauté** : fil (avis, pépites, programmes), classement et badges, défis, **proposition d’un lieu** (position exacte posée sur la carte + page Instagram/Facebook obligatoires), modération par l’administrateur.
- **Inscription / connexion** : validation côté navigateur et côté serveur, mots de passe hachés, limitation des tentatives.
- **Mon espace** : favoris, programmes (partager / supprimer), propositions et leur statut, modération (admin).

Les pages dynamiques lisent toutes l’API (`/api/...`) : lieux, gouvernorats, événements, Benna, MIX, avis, favoris, programmes, communauté.

## 5. Back end (API REST)
`POST /api/auth/register|login`, `GET /api/auth/me` · `GET /api/governorates`, `/places`, `/places/:slug`, `/events`, `/benna`, `/challenges` ·
`POST /api/mix` · favoris et programmes (`/api/favorites`, `/api/programs`) · `POST /api/places/:slug/reviews|photos` ·
communauté (`/api/community/*`, `/api/uploads`) · modération (`/api/admin/*`).
Sécurité : requêtes SQL préparées, mots de passe bcrypt, JWT, droits par rôle (utilisateur / admin), validation des champs, taille des images limitée.

## 6. Données : ce qui est réel, ce qui est à remplacer
- Les 24 gouvernorats et leurs frontières sont réels. Les sites touristiques (Dougga, El Jem, médina de Tunis…) sont de vrais lieux, avec leurs coordonnées.
- **Les hébergements et restaurants sont des exemples génériques**, et les 16 adresses **Benna sont fictives** (démonstration). Remplacez-les par de vrais lieux dans `server/src/data/places.js` et `benna.js`, puis `npm run seed`. Pour chaque lieu : `lat`, `lng`, `address`, `instagram`, `facebook`, `image`.
- **Instagram / Facebook** : aucun lien n’est inventé. Tant que la page officielle n’est pas renseignée, le bouton affiche « recherche » et ouvre une recherche. Les lieux proposés par la communauté doivent fournir une vraie page.
- Le badge de précision indique « position exacte », « quartier » ou « secteur » : on ne prétend pas à une exactitude qu’on n’a pas.
- Prix et dates d’événements sont **indicatifs** ; les événements non confirmés portent « date à confirmer ».
- Photos : des illustrations sont affichées par défaut ; ajoutez de vraies photos via le champ `image` (ex. `/benna/dishes/…` ou `/uploads/…`).
- Les tuiles de la carte viennent d’OpenStreetMap : une connexion Internet est nécessaire pour les voir.

## 7. Structure
```
server/  src/{index,db,seed,auth,mix,lib}.js · routes/ · data/ · test/
client/  src/{pages,components,benna,styles,lib,data}  · public/benna/dishes
```
