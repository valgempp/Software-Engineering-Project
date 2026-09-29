# AI Models Comparator — Récapitulatif projet

Software Engineering A4 (2026-2027). Sources : `../TP1/TP1.pdf`, `../TP2/TP2.pdf`, `../TP3/TP3.pdf`, modèles `../TP2/SHMS_*.pdf`.

## 1. Concept

Application web de comparaison de modèles d'IA. Chaque modèle est évalué de deux façons indépendantes : par l'avis de la communauté et par les résultats de benchmarks. Une page de débat accompagne chaque modèle.

### Fonctionnalités principales

1. **Classement communautaire**
   - Un utilisateur connecté vote pour un modèle : up ou down, comme sur Reddit.
   - Un seul vote par utilisateur et par modèle. Re-cliquer sur la flèche active retire le vote, cliquer sur l'autre flèche l'inverse.
   - Score communautaire = % de votes up (up ÷ total), affiché dès le premier vote. Un modèle n'obtient un rang qu'à partir de **10 votes** ; en dessous, il affiche « Pas assez de votes ».
2. **Classement benchmarks**
   - Le backend récupère automatiquement les scores publiés par des sources externes.
   - Seuls les benchmarks exprimés en pourcentage de réussite (0–100) sont retenus, ce qui les rend comparables sans conversion.
   - Score benchmarks d'un modèle = moyenne de ses scores disponibles. Un modèle n'obtient un rang qu'à partir de **3 benchmarks** ; en dessous, il affiche « Pas assez de benchmarks ».
   - Si deux sources donnent le même benchmark pour le même modèle, l'import le plus récent l'emporte.
3. **Commentaires par modèle**
   - Chaque modèle a un fil de discussion unique, sans réponses, comme un groupe WhatsApp. Le plus récent est en haut, le champ de saisie au-dessus du fil.
   - Un utilisateur peut publier autant de commentaires qu'il veut.
4. **News**
   - Actualités sur les nouveaux modèles d'IA, récupérées automatiquement et affichées telles quelles (titre, source, date, lien vers l'article).
5. **Administration**
   - L'admin supprime des commentaires, bloque ou débloque des utilisateurs, supprime des comptes et consulte l'état des imports.
   - Il relie les noms de modèles inconnus des sources à un modèle existant, ou crée le modèle et son lab (nom + logo déposé en image). L'import ne crée jamais de modèle tout seul.

L'intérêt de l'application est de confronter les deux classements : un modèle bien classé aux benchmarks convainc-t-il aussi les utilisateurs, et inversement ?

**Stack :** React (frontend) et Node.js/Express (backend), imposés par le cours. Tout en TypeScript (TSX pour React), pas de JavaScript. Base PostgreSQL via l'ORM TypeORM (demandé par le prof) : aucun SQL écrit à la main.

### Acteurs

| Acteur | Droits |
| --- | --- |
| Visiteur (abstrait) | Ce que tout le monde peut faire : consulter les modèles, les classements et les news |
| Invité (`Guest`) | Hérite du visiteur ; s'inscrire, se connecter |
| Utilisateur | Hérite du visiteur ; vote, commente, supprime ses commentaires et son compte, se déconnecte |
| Admin | Hérite de l'utilisateur ; modère commentaires et comptes, consulte les imports, relie les noms de modèles, gère les logos des labs |
| Sources externes | Fournissent les scores de benchmarks et les news |

### Règles métier

| Sujet | Règle |
| --- | --- |
| Vote | Un par couple (utilisateur, modèle), modifiable ; seule la dernière valeur est conservée (pas d'historique) |
| Blocage | Un utilisateur bloqué ne peut plus se connecter ; ses votes et commentaires restent visibles ; l'admin peut le débloquer |
| Suppression d'un compte | Par l'utilisateur ou l'admin : suppression totale de ses votes et commentaires (RGPD) |
| Données personnelles | Seuls l'e-mail, le nom d'utilisateur (`username`) et le mot de passe haché sont stockés (RGPD : minimisation) |
| Lab | Le créateur du modèle (Llama → Meta), pas l'hébergeur |
| Inscription | L'utilisateur est connecté automatiquement après l'inscription |
| Navigation | Menu : Models, Ranking, News, puis « Log in » (invité) ou « Account » + « Log out » (connecté). Aucun lien vers `/admin` : l'admin tape l'URL |
| Logo d'un lab | Déposé par l'admin (PNG, JPEG ou WebP, 1 Mo max) ; sans logo, on affiche l'initiale |
| URL d'un modèle | Un slug généré à partir du nom : `GPT-4o (2024-08-06)` → `/models/gpt-4o-2024-08-06` |

### Pages

| Route | Accès | Contenu | Actions |
| --- | --- | --- | --- |
| `/` | Public | Titre de l'application, 3 boutons | Aller vers Models, Ranking, News |
| `/login` | Public | Onglets Connexion / Inscription (e-mail, nom d'utilisateur, mot de passe) ; case d'acceptation de la politique de confidentialité | Se connecter, créer un compte ; message spécifique si le compte est bloqué |
| `/models` | Public | Mosaïque des labs (logo, nom) par ordre alphabétique ; sous chaque lab, ses modèles | Ouvrir la fiche d'un modèle |
| `/models/:slug` | Public ; actions réservées aux connectés | En-tête : nom, lab, date de sortie. Rangs communauté et benchmarks. Tableau des benchmarks (benchmark, score, source). Score communautaire (% up, nombre de votes). Fil de commentaires | Voter up/down ; commenter ; supprimer ses commentaires. Admin : « Supprimer » et « Bloquer l'auteur » sur chaque commentaire. Visiteur : « Connecte-toi pour voter ou commenter » |
| `/ranking` | Public | Classement ordonné ; chaque ligne : rang, modèle, lab, score, et rang dans l'autre classement. Modèles non classés listés en dessous | Bouton de bascule communauté / benchmarks ; ouvrir la fiche d'un modèle |
| `/news` | Public | Liste des news, de la plus récente à la plus ancienne : titre, source, date | Ouvrir l'article d'origine |
| `/account` | Connecté (bouton « Account » du menu) | Nom d'utilisateur, e-mail | Supprimer son compte (avec confirmation) |
| `/admin` | Admin (aucun lien, URL tapée à la main) | Utilisateurs (nom d'utilisateur, e-mail, état) ; derniers commentaires ; état des imports par source ; noms de modèles à relier ; labs | Bloquer, débloquer, supprimer un utilisateur ; supprimer un commentaire ; relier un nom ; créer un lab et déposer son logo |

États gérés sur toutes les pages : chargement, liste vide, erreur réseau, 404 (modèle inconnu), 403 (accès admin refusé). Interface responsive : les tableaux passent en cartes sur mobile.

### Diagrammes

La version à jour de tous les diagrammes est dans les documents : sources PlantUML dans `docs/*/figures/*.puml`, images `.png` à côté.

| Diagramme | Fichier |
| --- | --- |
| Classes (5 packages, 4 énumérations, classes d'association `Vote` et `Score`, `ModelAlias`) | `docs/SRS/figures/class.puml` |
| Cas d'utilisation (Visitor abstrait, Guest, Registered User, Administrator) | `docs/SRS/figures/usecase.puml` |
| États du compte utilisateur (Active avec LoggedIn / LoggedOut, Blocked) | `docs/SDD/figures/account-state.puml` |
| Entité-association (tables TypeORM / PostgreSQL) | `docs/SDD/figures/er.puml` |

Justifications du diagramme de classes :

- **`Vote` est une classe d'association** : exactement un vote par couple (utilisateur, modèle). **`Comment` n'en est pas une** : plusieurs commentaires par couple, d'où une classe ordinaire avec deux associations.
- **Composition User ◆— Comment** : supprimer un compte supprime ses commentaires (règle RGPD). Un composant n'a qu'un seul composite, d'où une association simple avec `LLMModel`.
- **`Score` est une classe d'association** : un score par couple (modèle, benchmark). Le nom du benchmark n'est stocké qu'une fois, dans `Benchmark`.
- **`ModelAlias`** : nom qu'une source donne à un modèle, relié à 0 ou 1 modèle tant que l'admin ne l'a pas vérifié. Évite les doublons de modèles.
- **Quatre énumérations** : `Role`, `UserStatus`, `VoteType`, `SourceType` (le TP1 en exige au moins une).

### Questions ouvertes

- [ ] Sources de benchmarks : lesquelles ? Accès API, licence, attribution, benchmarks en %
- [ ] Source des news : quelle API ou quel flux RSS (gratuit, clé nécessaire) ?

## 2. Sprint 1 : documents à rendre (TP2)

Échéance : avant la séance TP suivante. Structure à calquer sur les modèles SHMS ; on peut ajouter des détails.

### BRD — Pourquoi le logiciel est nécessaire

- [ ] 1. Project Overview : purpose, objectives, business goals, scope
- [ ] 2. Stakeholder Analysis : parties prenantes et leurs besoins
- [ ] 3. Business Requirements : fonctionnels, non fonctionnels, conformité (RGPD : comptes, commentaires)
- [ ] 4. Correspondance exigences métier → sections du SRS
- [ ] 5. Business Process Flow : entrées, sorties, un diagramme par processus
- [ ] 6. Risques et hypothèses
- [ ] 7. Stratégie de mise en œuvre par phases
- [ ] 8. Critères de succès chiffrés
- [ ] 9. Approbation

### SRS — Ce que le système doit faire

- [ ] 1. Introduction : but, périmètre, définitions, références, plan du document
- [ ] 2. Description générale : perspective, fonctionnalités, profils utilisateurs, contraintes, hypothèses
- [ ] 3. Exigences spécifiques : fonctionnelles (numérotées) et non fonctionnelles (performance, sécurité, maintenabilité)
- [ ] 4. Scénarios de cas d'utilisation : acteurs, description, étapes, diagramme associé
- [ ] 5. Diagrammes : classes, séquence, cas d'utilisation
- [ ] 6. Interfaces externes : UI (wireframes), logicielles (API des sources), communication (HTTPS)
- [ ] 7. Autres exigences : sécurité, confidentialité, compatibilité navigateurs
- [ ] 8. Annexes et glossaire

### SDD — Comment le système sera conçu

- [ ] 1. Introduction : but, périmètre, public, références (IEEE 1016)
- [ ] 2. Vue d'ensemble du système
- [ ] 3. Vues d'architecture : contexte, composants, déploiement
- [ ] 4. Conception des données : entités, relations, règles d'intégrité
- [ ] 5. Conception des interfaces : endpoints REST, écrans
- [ ] 6. Conception détaillée : responsabilités des composants, séquence d'un cas clé, gestion des erreurs
- [ ] 7. Sécurité et conformité : authentification, hachage des mots de passe, rôles, RGPD
- [ ] 8. Performance, montée en charge, disponibilité
- [ ] 9. Observabilité
- [ ] 10. Internationalisation et accessibilité
- [ ] 11. Justification des choix de conception
- [ ] 12. Hypothèses et contraintes
- [ ] 13. Points ouverts et évolutions

### Bonus

- [ ] STD (Software Test Documentation) : comment vérifier le logiciel par rapport au SRS
- [ ] Validation Plan : comment valider le logiciel par rapport aux besoins du BRD

## 3. Diagrammes UML (compétences du TP1)

| Diagramme | Document | À faire |
| --- | --- | --- |
| Classes et packages | SRS §5, SDD §4 | - [ ] Multiplicités, rôles, navigabilité, classe d'association, au moins une énumération |
| Cas d'utilisation | SRS §5 | - [ ] Acteurs, `include`/`extend`, généralisations |
| Activité (avec couloirs) | BRD §5 ou SRS §4 | - [ ] Au moins un nœud de décision |
| Séquence | SRS §5, SDD §6 | - [ ] Fragments `alt` et `loop` |
| États | SDD §6 | - [ ] Trouver l'objet du domaine qui a un vrai cycle de vie |
| Déploiement | SDD §3 | - [ ] Clients, API, base de données, sources externes |

Outils proposés : draw.io, Visual Paradigm Online, StarUML.

## 4. Sprints suivants : Jira (TP3)

### Phase 1 — Mise en place

- [ ] Espace Jira Cloud (plan Free) ; un membre crée le projet et invite les autres
- [ ] Projet avec le modèle Software Development → Scrum
- [ ] Attribuer les rôles : Product Owner, Scrum Master, Developers

### Phase 2 — Backlog

- [ ] Story map avec l'extension Easy Agile TeamRhythm
- [ ] Epics par grand domaine fonctionnel
- [ ] User stories au format « As a [user], I want to [goal], so that [benefit] »
- [ ] Critères d'acceptation sur chaque story
- [ ] Estimation en story points

### Phase 3 — Sprint

- [ ] Sprint de 2 semaines avec un Sprint Goal
- [ ] Stories assignées, sous-tâches si besoin
- [ ] Tableau To Do → In Progress → Done mis à jour à chaque daily

### Phase 4 — Suivi, revue, rétrospective

- [ ] Burndown, Velocity, Cumulative Flow, Control Chart
- [ ] Dashboard projet : Issues by Status, Burndown, Velocity, Team Workload
- [ ] Sprint Review : Complete Sprint, démonstration
- [ ] Rétrospective (Jira ou MetroRetro) ; une tâche Jira par action d'amélioration
- [ ] Export ou captures : Burndown, Velocity, synthèse de la rétrospective

**Attendu après 2 sprints (1 mois) :** projet Scrum structuré, story map, sprint board actif, rapports et dashboard, review et rétrospective documentées.

## 5. Suite du cours

Développement Node.js (backend) et React (frontend), avec implémentation et tests suivis dans Jira.
