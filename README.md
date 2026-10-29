# Salle de jeux

Une ludothèque de jeux de société à jouer dans le navigateur, contre l'ordinateur ou à plusieurs sur le même écran. Chaque partie se sauvegarde toute seule.

**Jouer :** https://mushu1994.github.io/duel-des-ages/

Le portail classe les jeux par type, avec une recherche et des filtres (type de jeu, seul, contre l'ordinateur, à 2 ou à 3 et plus).

- **Jeux de cartes** : Duel des Âges, Duel des Joyaux, Plus Bas, Têtes de Bœuf, Joyaux de la Renaissance (dans l'esprit de Splendor, avec les quatre modules des Cités), Sept Merveilles (dans l'esprit de 7 Wonders, avec Meneurs, Cités, Armada et Édifices), La Bataille, Président, Tarot, Poker, Rami voleur, Dernière carte (dans l'esprit du Uno), Quitte ou Sept (dans l'esprit de Flip 7), Solitaire (cartes et billes).
- **Jeux de plateau** : Nouvelle Terre, Rails d'Europe, Remparts (dans l'esprit de Carcassonne), Conquête (dans l'esprit de Risk), Grand Propriétaire (avec le dé de rapidité), Échecs, Dames, Reversi, Quatre en ligne, Bataille Navale, Petits Chevaux.
- **Dés et dominos** : Approche finale (coopératif à deux ou avec l'IA, dans l'esprit de Sky Team), Dominos.
- **Lettres, chiffres et logique** : Sudoku, Mots croisés, Petit Bac, Code Secret.

## Jouer en ligne

Tous les jeux à plusieurs se jouent aussi en ligne, chacun sur son appareil (28 jeux, tag « En ligne » et filtre dédié sur l'accueil). Seuls les jeux solo (Sudoku, Mots croisés, Solitaire…) restent hors ligne.

- **Le salon** : sur l'accueil et dans chaque jeu, on choisit un pseudo et on voit qui est connecté, où il joue et les tables ouvertes. Un pseudo ne peut pas être pris par deux personnes connectées en même temps (pas de compte ni de base de données : l'unicité est vérifiée parmi les présents).
- **Les tables** : bouton « Table » dans un jeu → créer une table (ouverte à tous ou privée), rejoindre une table ouverte en un clic, ou entrer un code de 4 lettres / suivre un lien.
- **Les invitations** : depuis le salon ou la table, « Inviter » envoie une invitation au joueur connecté ; il l'accepte d'un clic et arrive directement à la table.
- L'hôte règle les options, complète avec l'ordinateur (3 niveaux) et lance ; il peut confier la place d'un absent à l'ordinateur ou revenir au salon.

Technique : Supabase Realtime (diffusion + présence, aucune table). Le navigateur de l'hôte fait tourner la partie et envoie l'état ; les invités envoient leurs actions, validées par l'hôte. Reconnexion automatique après un rechargement. Code commun : `hall.js` (salon) et `net.js` (tables) intégrés dans chaque jeu. Limite connue : l'état complet transite par le navigateur, donc les informations cachées (mains adverses) restent techniquement lisibles par quelqu'un qui inspecte le code.

Les jeux sont des créations originales inspirées de mécaniques de jeux connus ; noms, cartes et illustrations sont propres à la salle.
