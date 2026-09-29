# AI Models Comparator — Récapitulatif projet

Software Engineering A4 (2026-2027). Sources : `../TP1/TP1.pdf`, `../TP2/TP2.pdf`, `../TP3/TP3.pdf`, modèles `../TP2/SHMS_*.pdf`.

## 1. Concept

Application web de comparaison de modèles d'IA reposant sur deux classements et un espace de débat :

- **Classement communautaire** : les utilisateurs notent les modèles.
- **Classement benchmarks** : scores récupérés automatiquement depuis des sources externes. Le système de classement (Elo ou autre) reste à décider.
- **Commentaires** : chaque modèle a un espace de débat sur ses performances.

**Stack imposée :** React (frontend) et Node.js/Express (backend).

### Décisions prises

| Sujet | Décision |
| --- | --- |
| Note | Une note par utilisateur et par modèle, modifiable |
| Commentaires | Plusieurs commentaires par utilisateur et par modèle |
| Comptes utilisateurs | Nécessaires (notes et commentaires sont rattachés à un utilisateur) |

### Questions ouvertes

- [ ] Note modifiée : conserve-t-on l'historique ou seulement la dernière valeur ?
- [ ] Note et commentaire : une seule classe ou deux ? Laquelle est une classe d'association ?
- [ ] Réponses aux commentaires : un seul niveau ou un fil sans limite ? Comment le modéliser en UML ?
- [ ] Benchmark : où ranger son nom, son échelle et son sens (« plus haut = mieux ») ?
- [ ] Score de benchmark : quelle structure entre modèle et benchmark ?
- [ ] Classement communautaire : moyenne simple ou méthode tenant compte du nombre de votes ?
- [ ] Vote : note absolue (étoiles) ou duels entre modèles (Elo) ?
- [ ] Modération : qui modère les commentaires ? Quels sont les acteurs du système ?
- [ ] Sources de benchmarks : lesquelles ? Accès API, licence, attribution ?
- [ ] Multiplicités de toutes les associations

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
