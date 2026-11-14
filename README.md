# FAZA — فازة · La Tunisie à ta façon

> *Fazza* (فازة), en derja : l’envie soudaine de bouger, de sortir, de faire un truc.
> FAZA répond à une seule question : **on sort où ?**

Guide collaboratif de la Tunisie pour trouver où dormir, manger, sortir et découvrir, selon son budget et son ambiance, dans les 24 gouvernorats.

**Équipe :** Rania Mediouni, Nour Elhadj · **Cours :** Dr. Maroua Nouioua
**Site en ligne :** https://faza-tunisie.netlify.app/

---

## Sommaire
1. [Le concept](#1-le-concept)
2. [Lancer le projet en local](#2-lancer-le-projet-en-local)
3. [Visite guidée des pages](#3-visite-guidée-des-pages)
4. [FAZA MIX : comment le programme est calculé](#4-faza-mix--comment-le-programme-est-calculé)
5. [Architecture et choix techniques](#5-architecture-et-choix-techniques)
6. [API REST](#6-api-rest)
7. [Base de données](#7-base-de-données)
8. [Sécurité](#8-sécurité)
9. [Données : ce qui est réel, ce qui est à remplacer](#9-données--ce-qui-est-réel-ce-qui-est-à-remplacer)
10. [Déploiement](#10-déploiement)
11. [Structure du code](#11-structure-du-code)

---

## 1. Le concept

Les guides classiques sont souvent génériques, chers ou périmés. FAZA veut être un guide **local, honnête et participatif** : les adresses viennent aussi de la communauté, et chaque lieu affiche sa vraie localisation et ses pages Instagram ou Facebook.

Le site s’organise en **rubriques**, chacune nommée en derja :

| Rubrique | Question | Contenu |
|---|---|---|
| **Win nbatou ?** | Où dormir ? | Hôtels, maisons d’hôtes, campings |
| **Benna** | Où manger ? | Restaurants, street food, plats typiques |
| **Win nemchiw ?** | Que faire ? | Activités, sorties, sport, plages |
| **Lakta** (لقطة) | Que découvrir ? | Sites historiques, médinas, paysages |
| **Jaw Tounsna** (جو تونسنا) | Quoi de neuf ? | Festivals, concerts, marchés, événements |
| **Secret spot** (بلايص مخبّية) | Les pépites du coin | Les adresses que les guides oublient |

À côté des rubriques :
- **FAZA MIX** compose automatiquement un programme de sortie qui respecte un budget.
- **La communauté** propose des lieux, laisse des avis et gagne des points.

---

## 2. Lancer le projet en local

**Prérequis :** Node.js **20.19 ou plus** (exigé par Angular 22) (testé jusqu’à Node 24) et npm.

```bash
# 1. À la racine du projet : installe l’outil qui lance les deux serveurs
npm install

# 2. Installe les dépendances du serveur (backend) et du site Angular (frontend)
npm run install:all

# 3. Lance l’API et le site en même temps
npm run dev
```

- Le site s’ouvre sur **http://localhost:5173**.
- L’API répond sur **http://localhost:4000/api**. Par exemple, `/api/health` renvoie `{ ok: true }`.
- Au premier démarrage, la base SQLite est **créée et remplie automatiquement**. Il n’y a rien à configurer.

### Commandes utiles

| Commande | Effet |
|---|---|
| `npm run dev` | Lance l’API (port 4000) et le site (port 5173) avec rechargement automatique |
| `npm run seed` | Réinitialise la base avec les données de démonstration |
| `npm test` | Lance les tests automatiques du back end |
| `npm run build` | Produit la version de production du site dans `frontend/dist` |

### Compte de démonstration

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | `admin@faza.tn` | `Faza2026!` |

Pour changer ces identifiants ou la clé secrète JWT, copiez `backend/.env.example` vers `backend/.env` et modifiez les valeurs.

### En cas de problème
- **Le site s’affiche mais reste vide :** l’API ne tourne pas. Vérifiez dans le terminal que la ligne `api` ne montre pas d’erreur.
- **Erreur `better-sqlite3` à l’installation :** vérifiez votre version avec `node -v` (il faut Node 20.19 ou plus), puis relancez `npm run install:all`.
- **Les cartes sont grises :** les tuiles OpenStreetMap ont besoin d’une connexion Internet.

---

## 3. Visite guidée des pages

| URL | Page | Ce qu’on y fait |
|---|---|---|
| `/` | **Accueil** | Carte vivante de la Tunisie : on choisit une ambiance (mer, désert, culture…) et les gouvernorats concernés s’éclairent. Un clic ouvre le « billet » du gouvernorat, « Surprends-moi » en tire un au hasard, et un aperçu de FAZA MIX se recalcule en direct avec le budget. On y trouve aussi les portes vers les rubriques, les prochains événements, les secret spots en cartes postales et un petit dictionnaire de derja. |
| `/explorer` | **Explorer** | Recherche avec filtres (rubrique, gouvernorat, budget, mot-clé, secret spots), en vue liste ou en vue carte Leaflet. |
| `/gouvernorat/:slug` | **Gouvernorat** | Une page par gouvernorat : un onglet par rubrique, la carte des lieux et les gouvernorats voisins. |
| `/lieu/:slug` | **Fiche lieu** | Photo ou illustration, position sur la carte, boutons *Localisation / Instagram / Facebook / Itinéraire*, avis, photos et favoris. |
| `/benna` | **Benna** | Carnet gourmand illustré : des plats en autocollants sur 6 pages qu’on feuillette, un plan de Tunis dessiné qu’on peut glisser, zoomer et épingler, et une fiche par adresse (menu, photos, avis, ouvert ou fermé selon l’heure). |
| `/mix` | **FAZA MIX** | Générateur de programme : voir la [section 4](#4-faza-mix--comment-le-programme-est-calculé). |
| `/jaw-tounsna` | **Jaw Tounsna** | Agenda des événements groupés par mois, avec un compte à rebours vers le prochain, des filtres (catégorie, gouvernorat, gratuit) et la mention « date à confirmer » quand il le faut. |
| `/communaute` | **Communauté** | Fil d’activité (avis, pépites, programmes partagés), classement des plus actifs, badges et défis. |
| `/communaute/proposer` | **Proposer un lieu** | Formulaire réservé aux membres connectés. On pose la position exacte sur la carte et une page Instagram ou Facebook est **obligatoire**. Le lieu est ensuite validé par l’administrateur. |
| `/connexion`, `/inscription` | **Compte** | Formulaires validés dans le navigateur **et** sur le serveur. |
| `/mon-espace` | **Mon espace** | Favoris, programmes enregistrés (partager ou supprimer), propositions et leur statut. L’administrateur y modère les propositions et les avis. |
| `/programme/:code` | **Programme partagé** | Page publique d’un programme FAZA MIX, accessible par lien. |

Toutes les pages dynamiques lisent leurs données depuis l’API : rien n’est codé en dur dans le front.

### Système de points de la communauté

| Action | Points |
|---|---|
| Laisser un avis | +5 |
| Ajouter une photo | +3 |
| Partager un programme | +10 |
| Lieu proposé et publié | +20 |

---

## 4. FAZA MIX : comment le programme est calculé

FAZA MIX **n’utilise pas d’IA**. C’est un algorithme à règles simples, lisible et reproductible, codé dans `backend/src/mix.js`.

**Entrées :** gouvernorat, budget par personne (10 à 2000 DT), durée (1 à 3 jours), taille du groupe (1 à 12 personnes) et envies (nature, culture, gastronomie, sport, détente, mer, désert).

**Étapes :**
1. **Créneaux.** Chaque jour est découpé en *matin* (activité), *midi* (repas), *après-midi* (découverte) et *soir* (repas). Une *nuit* d’hébergement est ajoutée entre deux jours.
2. **Répartition du budget.** Avec nuitées : 35 % pour l’hébergement, 35 % pour les repas et 30 % pour les activités. Sans nuitée : 50 % pour les repas et 50 % pour les activités.
3. **Choix du lieu.** Pour chaque créneau, chaque lieu reçoit un score : `1 + 2 × (nombre d’envies correspondantes) + 0,5 si c’est une pépite + un petit aléa`. Le lieu le mieux noté qui tient dans sa part de budget est retenu.
4. **Rééquilibrage.** Si le total dépasse le budget, l’étape la plus chère est remplacée par une alternative moins chère, jusqu’à respecter le budget.
5. **Résultat.** Le programme jour par jour, le coût par personne et pour le groupe, et le reste du budget.

L’aléa vient d’un générateur pseudo-aléatoire à **graine** : avec la même graine, on obtient le même programme. On peut ensuite remplacer une étape (le total se recalcule), enregistrer le programme et le partager par lien.

---

## 5. Architecture et choix techniques

```
 Navigateur (Angular)──HTTP/JSON──▶  API Express (Node.js)  ──SQL──▶  SQLite (fichier faza.db)
   localhost:5173      /api/...         localhost:4000                backend/data/faza.db
```

| Couche | Choix | Pourquoi |
|---|---|---|
| Front end | **Angular 22** (composants autonomes, signals, Angular Router, HttpClient) | Composants réutilisables, navigation sans rechargement, chargement des pages à la demande, build rapide (esbuild) |
| Cartes | **Leaflet + OpenStreetMap**, plus une carte SVG des 24 gouvernorats (geoBoundaries, CC BY 4.0) | Position exacte des lieux, gratuit, sans clé d’API |
| Back end | **Node.js + Express** | Même écosystème que le front (JavaScript / TypeScript), API REST simple |
| Base de données | **SQLite** via better-sqlite3 | Aucun serveur à installer : toute la base tient dans un fichier |
| Authentification | **bcryptjs + JWT** (valable 7 jours) | Mots de passe hachés, sessions sans état côté serveur |
| Style | CSS pur (sans framework), polices auto-hébergées (Fontsource) | Identité visuelle propre : motifs zellige, couleurs de la Tunisie, typographie arabe et latine |

> **Écart avec le cadrage (Objectif 1) :** le cadrage citait Java pour le back end. Node.js a été retenu pour cet objectif. La logique (API REST, SQL, JWT) se transpose telle quelle en Spring Boot.

---

## 6. API REST

Toutes les routes commencent par `/api`. 🔒 = connexion requise, 👑 = administrateur.

**Authentification**

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Se connecter (renvoie un JWT) |
| GET | `/auth/me` 🔒 | Utilisateur connecté |

**Catalogue (public)**

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/categories` | Liste des rubriques |
| GET | `/governorates` | Les 24 gouvernorats avec leur nombre de lieux et d’événements |
| GET | `/governorates/:slug` | Un gouvernorat, ses lieux et ses événements |
| GET | `/places` | Lieux, filtrables par rubrique, gouvernorat, budget et recherche |
| GET | `/places/:slug` | Fiche d’un lieu, avec ses avis et photos |
| GET | `/events` | Agenda des événements |
| GET | `/benna` | Plats et adresses du carnet Benna |
| GET | `/challenges` | Défis de la communauté |
| POST | `/mix` | Générer un programme FAZA MIX (sans compte) |
| GET | `/programs/shared/:code` | Programme partagé par lien |

**Espace personnel** 🔒

| Méthode | Route | Rôle |
|---|---|---|
| GET / PUT / DELETE | `/favorites`, `/favorites/:placeId` | Lister, ajouter ou retirer un favori |
| GET / POST | `/programs` | Lister ou enregistrer ses programmes |
| GET / PATCH / DELETE | `/programs/:id` | Lire, modifier ou supprimer un programme |
| POST | `/places/:slug/reviews`, `/places/:slug/photos` | Laisser un avis ou ajouter une photo |

**Communauté et modération**

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/community/feed` | Fil d’activité |
| GET | `/community/leaderboard` | Classement |
| POST | `/community/places` 🔒 | Proposer un lieu |
| GET | `/community/mine` 🔒 | Mes propositions |
| POST | `/uploads` 🔒 | Envoyer une image |
| GET | `/admin/pending` 👑 | Propositions en attente |
| POST | `/admin/places/:id/:action` 👑 | Approuver ou refuser un lieu |
| POST | `/admin/reviews/:id/hide` 👑 | Masquer un avis |

---

## 7. Base de données

La base SQLite compte **13 tables**, créées dans `backend/src/db.js` et remplies par `backend/src/seed.js` :

- **Comptes :** `users` (rôle utilisateur ou admin, points et badges).
- **Catalogue :** `governorates`, `places` (catégorie, prix, tags, coordonnées, précision, réseaux sociaux, statut de modération), `events`.
- **Benna :** `dishes`, `place_dishes`, `menu_items`.
- **Contenus des membres :** `favorites`, `reviews`, `place_photos`.
- **FAZA MIX :** `programs`, `program_items`.
- **Communauté :** `challenges` (défis et badges à gagner).

Données de démonstration : 24 gouvernorats, environ 130 lieux et 14 événements.

---

## 8. Sécurité

- **Mots de passe** hachés avec bcrypt, jamais stockés en clair.
- **JWT** signé avec une clé secrète configurable (`JWT_SECRET`).
- **Requêtes SQL préparées** partout, contre l’injection SQL.
- **Droits par rôle :** les routes de modération vérifient le rôle administrateur.
- **Validation** des champs côté navigateur et côté serveur (e-mail, longueur du mot de passe, budget, coordonnées…).
- **Anti-force brute :** 15 tentatives de connexion ou d’inscription par minute au maximum.
- **Images :** la taille des envois est limitée.

---

## 9. Données : ce qui est réel, ce qui est à remplacer

FAZA ne prétend pas à une exactitude qu’il n’a pas :

- ✅ **Réel :** les 24 gouvernorats et leurs frontières, ainsi que les sites touristiques (Dougga, El Jem, médina de Tunis…) avec leurs coordonnées.
- ⚠️ **Exemples génériques :** les hébergements et les restaurants. Les 16 adresses de **Benna sont fictives** et servent à la démonstration.
- 🔗 **Instagram et Facebook :** aucun lien n’est inventé. Tant que la page officielle n’est pas renseignée, le bouton affiche « recherche » et lance une recherche. Les lieux proposés par la communauté doivent fournir une vraie page.
- 📍 **Précision :** chaque lieu indique si sa position est *exacte*, au *quartier* ou au *secteur*.
- 📅 **Prix et dates** sont indicatifs. Les événements non confirmés portent la mention « date à confirmer ».
- 🖼️ **Photos :** une illustration est affichée par défaut. On ajoute une vraie photo avec le champ `image`.

**Pour remplacer les données :** modifiez `backend/src/data/places.js` (et `benna.js` pour Benna), puis lancez `npm run seed`. Pour chaque lieu, renseignez `lat`, `lng`, `address`, `instagram`, `facebook` et `image`.

---

## 10. Déploiement

| Partie | Hébergeur | Configuration |
|---|---|---|
| Site (front end) | **Netlify** : https://faza-tunisie.netlify.app/ | `netlify.toml` construit `frontend/` et publie `frontend/dist` |
| API (back end) | **Render** | Service Node dont la racine est `backend/`, lancé avec `npm start` |

Netlify redirige `/api/*` et `/uploads/*` vers l’API hébergée sur Render. Le front appelle donc toujours `/api/...`, en local comme en production, sans changer de code.

---

## 11. Structure du code

```
faza/
├── package.json            Scripts racine (dev, seed, test, build)
├── netlify.toml            Déploiement du front
├── backend/                API Express
│   ├── .env.example        Variables d’environnement (port, JWT, admin)
│   ├── src/
│   │   ├── index.js        Démarrage du serveur et branchement des routes
│   │   ├── db.js           Schéma SQLite (13 tables)
│   │   ├── seed.js         Remplissage de la base
│   │   ├── auth.js         Hachage, JWT, validation, anti-force brute
│   │   ├── mix.js          Algorithme FAZA MIX
│   │   ├── routes/         auth · catalog · me · community
│   │   └── data/           governorates · places · events · benna
│   └── test/               Tests de l’API (node --test)
└── frontend/               Site Angular
    ├── angular.json        Configuration du build (styles, polices, sortie dans dist/)
    ├── proxy.conf.json     En local, /api et /uploads sont redirigés vers l’API (port 4000)
    ├── public/             Favicon, images des plats (benna/), icônes Leaflet
    └── src/
        ├── styles/         base · components · pages · benna · deco
        └── app/
            ├── app.ts            Squelette : en-tête, pages, pied de page, notifications
            ├── app.routes.ts     Routes de l’application (pages chargées à la demande)
            ├── app.config.ts     Routeur, HttpClient et intercepteur du jeton JWT
            ├── core/             ApiService, AuthService (+ garde de route), ToastService, fetchData
            ├── pages/            Une page par écran
            ├── components/       Cartes (SVG et Leaflet), cartes de lieux, décor (zellige, billets…)
            ├── benna/            Le carnet gourmand
            ├── data/             Carte des gouvernorats, plan de Tunis, images des plats
            └── lib/              Libellés, formats, liens réseaux sociaux
```
