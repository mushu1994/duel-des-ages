# Salle de jeux

Une ludothèque de jeux de société à jouer dans le navigateur, contre l'ordinateur ou à plusieurs sur le même écran. Chaque partie se sauvegarde toute seule.

**Jouer :** https://mushu1994.github.io/duel-des-ages/

Le portail classe les jeux par type, avec une recherche et des filtres (type de jeu, seul, contre l'ordinateur, à 2 ou à 3 et plus).

- **Jeux de cartes** : Duel des Âges, Duel des Joyaux, Plus Bas, Têtes de Bœuf, Joyaux de la Renaissance (dans l'esprit de Splendor, avec les quatre modules des Cités), Sept Merveilles (dans l'esprit de 7 Wonders, avec Meneurs, Cités, Armada et Édifices), La Bataille, Président, Tarot, Poker, Rami voleur, Dernière carte (dans l'esprit du Uno), Quitte ou Sept (dans l'esprit de Flip 7), Solitaire (cartes et billes).
- **Jeux de plateau** : Nouvelle Terre, Rails d'Europe, Remparts (dans l'esprit de Carcassonne), Conquête (dans l'esprit de Risk), Grand Propriétaire (avec le dé de rapidité), Échecs, Dames, Reversi, Quatre en ligne, Bataille Navale, Petits Chevaux.
- **Dés et dominos** : Approche finale (coopératif à deux ou avec l'IA, dans l'esprit de Sky Team), Dominos.
- **Lettres, chiffres et logique** : Sudoku, Mots croisés, Petit Bac, Code Secret.

## Jouer en ligne

Dernière carte, Quitte ou Sept, Joyaux de la Renaissance et Sept Merveilles se jouent aussi à plusieurs appareils : bouton « En ligne », création d'une salle avec un code de 4 lettres (ou un lien à partager), puis l'hôte lance la partie et peut compléter la table avec l'ordinateur. Pas de compte à créer.

Technique : salons Supabase Realtime (diffusion + présence, aucune base de données). Le navigateur de l'hôte fait tourner la partie et envoie l'état aux autres ; les invités envoient leurs actions. Reconnexion automatique après un rechargement, et l'hôte peut confier la place d'un absent à l'ordinateur. Code commun : `net.js` intégré dans chaque jeu compatible.

Les jeux sont des créations originales inspirées de mécaniques de jeux connus ; noms, cartes et illustrations sont propres à la salle.
