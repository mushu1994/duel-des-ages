# Salle de jeux

Une ludothèque de jeux de société et de mini-jeux vidéo à jouer dans le navigateur, contre l'ordinateur ou à plusieurs sur le même écran. Chaque partie se sauvegarde toute seule.

**Jouer :** https://mushu1994.github.io/duel-des-ages/

Le portail classe les jeux par type, avec une recherche et des filtres (type de jeu, seul, contre l'ordinateur, à 2 ou à 3 et plus).

- **Jeux de cartes** : Duel des Âges, Duel des Joyaux, Plus Bas, Têtes de Bœuf, Joyaux de la Renaissance (dans l'esprit de Splendor, avec les quatre modules des Cités), Sept Merveilles (dans l'esprit de 7 Wonders, avec Meneurs, Cités, Armada et Édifices), La Bataille, Président, Tarot, Poker, Rami voleur, Dernière carte (dans l'esprit du Uno), Quitte ou Sept (dans l'esprit de Flip 7), Solitaire (cartes et billes).
- **Jeux de plateau** : Nouvelle Terre, Rails d'Europe, Remparts (dans l'esprit de Carcassonne), Conquête (dans l'esprit de Risk), Grand Propriétaire (avec le dé de rapidité), Échecs, Dames, Reversi, Quatre en ligne, Bataille Navale, Petits Chevaux.
- **Dés et dominos** : Approche finale (coopératif à deux ou avec l'IA, dans l'esprit de Sky Team), Dominos.
- **Lettres, chiffres et logique** : Sudoku, Mots croisés, Petit Bac, Code Secret.
- **Mini-jeux vidéo** (temps réel, en ligne de 1 à 8 joueurs, entraînement contre l'ordinateur) : Serpents (dans l'esprit de Snake, modes Survie et Chrono), Souricière (dans l'esprit de Pac-Man, modes Course aux miettes et Souris contre chats), Piaf (dans l'esprit de Flappy Bird, tous les oiseaux dans le même parcours).

## Profils, succès et défis

Page **Profil** (bouton en haut de l'accueil) : avatar, présentation, niveau et XP, statistiques (parties, victoires, en ligne, temps de jeu, jours d'affilée), top 3 des jeux, favoris (étoile sur chaque jeu de l'accueil), records des mini-jeux, 30 succès à débloquer, défis reçus et envoyés, lien de parrainage, classement des joueurs et code pour retrouver son profil sur un autre appareil. Un profil devient visible des autres joueurs après 4 parties jouées avec un pseudo ; un pseudo enregistré ne peut plus être pris par quelqu'un d'autre.

Technique : tables `profils` et `defis` dans Supabase, sans accès direct (RLS) ; tout passe par des fonctions qui vérifient le code secret du profil. Les parties sont détectées automatiquement dans chaque jeu.

## Performance, appli installable et fiabilité

- **Code commun** dans `common/` (salon, tables en ligne, profil, styles), chargé une fois puis gardé en cache : le site pèse environ deux fois moins (4,4 Mo → 2,2 Mo). Les cartes de Rails d'Europe sont codées en chemins relatifs, sans perte (468 Ko → 342 Ko).
- **Appli installable** (`manifest.webmanifest`, `icons/`, `sw.js`) : icône sur l'écran d'accueil, plein écran, tous les jeux jouables hors ligne. Bouton « Installer l'appli » sur l'accueil et dans le profil.
- **Jeu en ligne** : si l'hôte quitte la partie ou passe sur une autre appli, un autre joueur la reprend automatiquement là où elle en était (mini-jeux, Puissance 4, Échecs, Dames, Bataille, Dominos, Petits Chevaux, Rami, Remparts, Conquête, Joyaux, Sept Merveilles, Dernière carte, Quitte ou Sept). Dans les autres jeux, la partie attend l'hôte 30 secondes, puis un autre joueur peut la relancer avec les mêmes joueurs. Messages des mini-jeux allégés (Souricière : 1,9 Ko → 0,7 Ko par envoi). Réactions rapides (emoji), demande de revanche, parties en cours visibles et ouvertes aux spectateurs.
- **Mini-jeux** : réaction immédiate de son personnage, plein écran et mode paysage, tutoriel à la première partie, couleurs adaptées au daltonisme, vibrations, vitesse et taille d'arène réglables. Volume général des sons dans les réglages.
- **Tests** dans `tests/` : `smoke.py` (chaque page), `offline.py` (appli et hors ligne), `online.py` (partie à trois et reprise par un autre joueur). Ils tournent chaque lundi et après chaque mise à jour (`.github/workflows/tests.yml`).

Construction : `make.sh` (mini-jeux, profil, code commun, appli) dans l'espace de travail de Claude ; les pages publiées sont autonomes.

## Jouer en ligne

Tous les jeux à plusieurs se jouent aussi en ligne, chacun sur son appareil (28 jeux, tag « En ligne » et filtre dédié sur l'accueil). Seuls les jeux solo (Sudoku, Mots croisés, Solitaire…) restent hors ligne.

- **Le salon** : sur l'accueil et dans chaque jeu, on choisit un pseudo et on voit qui est connecté, où il joue et les tables ouvertes. Un pseudo ne peut pas être pris par deux personnes connectées en même temps (pas de compte ni de base de données : l'unicité est vérifiée parmi les présents).
- **Les tables** : bouton « Table » dans un jeu → créer une table (ouverte à tous ou privée), rejoindre une table ouverte en un clic, ou entrer un code de 4 lettres / suivre un lien.
- **Les invitations** : depuis le salon ou la table, « Inviter » envoie une invitation au joueur connecté ; il l'accepte d'un clic et arrive directement à la table.
- L'hôte règle les options, complète avec l'ordinateur (3 niveaux) et lance ; il peut confier la place d'un absent à l'ordinateur ou revenir au salon.

Mini-jeux vidéo : l'hôte fait tourner la simulation (8 à 10 envois par seconde) et les invités l'affichent en lissant les mouvements ; dans Piaf, chaque joueur calcule son propre oiseau (aucun délai) et n'envoie que ses battements d'ailes. Le navigateur de l'hôte doit rester au premier plan pendant la partie.

Technique : Supabase Realtime (diffusion + présence, aucune table). Le navigateur de l'hôte fait tourner la partie et envoie l'état ; les invités envoient leurs actions, validées par l'hôte. Reconnexion automatique après un rechargement. Code commun : `hall.js` (salon) et `net.js` (tables) intégrés dans chaque jeu. Limite connue : l'état complet transite par le navigateur, donc les informations cachées (mains adverses) restent techniquement lisibles par quelqu'un qui inspecte le code.

Les jeux sont des créations originales inspirées de mécaniques de jeux connus ; noms, cartes et illustrations sont propres à la salle.
