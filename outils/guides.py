"""Textes des guides de jeu (Sept Merveilles, Joyaux de la Renaissance, Duel des Âges)."""
chip = lambda c, t: f'<span class="gd-chip" style="--c:{c}"></span>{t}'
def steps(*li): return '<ol class="gd-steps">' + ''.join(f'<li><span>{x}</span></li>' for x in li) + '</ol>'
def grid(*kv): return '<div class="gd-grid">' + ''.join(f'<div><b>{k}</b>{v}</div>' for k, v in kv) + '</div>'
def table(rows, head=None, cls=''): return f'<table class="gd-table {cls}">' + (('<tr>' + ''.join(f'<th>{h}</th>' for h in head) + '</tr>') if head else '') + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</table>'
tip = lambda t: f'<div class="gd-tip">{t}</div>'
wrap = lambda h: '<div class="gd">' + h + '</div>'

SEPT = [
 ('Première partie', wrap(
  '<p>Une partie dure trois âges de six tours. Voici un tour, puis ce qu’il faut viser à chaque âge.</p>'
  + steps('Tu reçois 7 cartes. Touche-en une : l’étiquette dit si tu peux la construire tout de suite, ce qu’elle coûte en commerce, ou si elle est gratuite par chaîne.',
          'Choisis quoi en faire : la <b>construire</b>, la glisser sous ta merveille pour <b>bâtir une étape</b>, ou la <b>défausser</b> contre 3 pièces.',
          'Tout le monde révèle son choix en même temps, puis les mains passent au voisin.',
          'Après six cartes jouées, la septième est défaussée et les conflits se règlent avec tes deux voisins.')
  + '<h5>Quoi viser</h5>'
  + grid(('Âge I : les ressources', 'Deux ou trois cartes marron variées et une grise. Sans elles, tout coûtera cher ensuite.'),
         ('Âge II : une direction', 'Complète ce qui te manque, puis choisis ta voie : science, bâtiments bleus ou armée.'),
         ('Âge III : les points', 'Les ressources ne servent plus à rien. Prends les bleues, les guildes et les dernières étapes de ta merveille.'))
  + tip('Pour découvrir le jeu, joue sans extension, à 3 ou 4 cités.'))),
 ('Marquer des points', wrap(
  table([(chip('#3f7cf0', 'Bâtiments bleus'), 'points de la carte'), ('Merveille', 'points des étapes bâties'),
         (chip('#e5383b', 'Conflits, par voisin battu'), '+1, +3 puis +5'), ('Conflit perdu', '−1'),
         ('Pièces', '1 point pour 3'), (chip('#3fb56b', 'Science'), 'voir ci-dessous'),
         (chip('#ffc93c', 'Jaunes') + ' et ' + chip('#8757e6', 'guildes'), 'selon tes cartes ou tes voisins')], ['D’où viennent les points', ''])
  + '<h5>La science</h5><p>Chaque symbole rapporte le carré de son nombre d’exemplaires, et chaque série des trois symboles rapporte 7 points de plus.</p>'
  + table([('1 symbole', '1'), ('2 identiques', '4'), ('3 identiques', '9'), ('4 identiques', '16'), ('1 compas + 1 engrenage + 1 tablette', '1 + 1 + 1 + 7 = 10')])
  + tip('La science rapporte beaucoup à partir de quatre ou cinq cartes vertes, presque rien avec une ou deux. Fais-la à fond ou pas du tout.'))),
 ('Conseils', wrap(grid(
  ('Regarde tes voisins', 'Tu ne commerces et ne te bats qu’avec eux. S’ils produisent déjà une ressource, tu peux la leur acheter au lieu de la construire.'),
  ('Garde quelques pièces', 'Une ressource achetée coûte 2 pièces. Avec 4 à 6 pièces de côté, tu n’es jamais bloqué.'),
  ('Un bouclier de plus suffit', 'Gagner un conflit de 1 ou de 5 boucliers rapporte la même chose. Dépasse tes voisins de peu.'),
  ('Prive ton voisin', 'La carte que tu ne joues pas part chez lui. S’il en attend une, glisse-la sous ta merveille ou défausse-la.'),
  ('Suis les chaînes', 'Un petit bâtiment de l’âge I peut rendre gratuit un bâtiment bien plus fort aux âges suivants.'),
  ('Bâtis ta merveille', 'Une étape transforme une carte qui ne te sert pas en points ou en pouvoir.')))),
 ('Aide-mémoire', wrap(table([
  ('Sens de passe', 'à gauche aux âges I et III, à droite à l’âge II'), ('Cartes jouées', '6 par âge, la 7ᵉ est défaussée'),
  ('Acheter une ressource', '2 pièces au voisin, 1 avec un comptoir ou un marché'), ('Défausser', '+3 pièces'),
  ('Conflits', '+1, +3, +5 par victoire selon l’âge, −1 par défaite'), ('Pièces en fin de partie', '3 pièces = 1 point'),
  ('Doublons', 'jamais deux bâtiments identiques'), ('Égalité', 'le plus riche gagne')], cls='l')
  + '<h5>Les couleurs</h5><p>' + ' &nbsp; '.join([chip('#9a6a3a', 'ressources'), chip('#9aa3b5', 'produits'), chip('#3f7cf0', 'points'), chip('#ffc93c', 'commerce'), chip('#e5383b', 'boucliers'), chip('#3fb56b', 'science'), chip('#8757e6', 'guildes')]) + '</p>')),
 ('Extensions', wrap('<p>Ajoute-les une par une, dans cet ordre, quand le jeu de base est acquis.</p>' + steps(
  '<b>Meneurs.</b> La plus simple : un personnage recruté au début de chaque âge oriente ta partie.',
  '<b>Cités.</b> Plus d’interaction : impôts qui font perdre des pièces aux autres, diplomatie pour éviter un conflit.',
  '<b>Armada.</b> Quatre flottes à faire avancer en payant 1 pièce de plus. Les parties sont plus longues.',
  '<b>Édifices.</b> Un projet commun par âge : participer rapporte, s’abstenir peut coûter.')
  + '<p>Le détail de chaque extension est dans l’Aide.</p>')),
]

JOYAUX = [
 ('Première partie', wrap(steps(
  'À ton tour, fais une seule action : prendre des jetons, réserver une carte ou en acheter une.',
  'Les premiers tours, prends 3 jetons de couleurs différentes et achète des cartes du niveau I, peu chères.',
  'Chaque carte achetée te donne un <b>bonus</b> permanent de sa couleur : tous tes achats suivants coûtent un jeton de moins dans cette couleur.',
  'Quand tes bonus s’accumulent, les cartes des niveaux II et III deviennent abordables. Ce sont elles qui rapportent les points.',
  'Le premier à 15 points déclenche le dernier tour : on le termine pour que chacun ait joué autant de fois.')
  + tip('Les cartes que tu peux acheter tout de suite ont une bordure verte.'))),
 ('Les quatre actions', wrap(grid(
  ('3 jetons différents', 'L’action de base, pour préparer un achat précis.'),
  ('2 jetons identiques', 'Possible seulement s’il en reste au moins 4 dans la banque. Utile quand une carte demande beaucoup d’une couleur.'),
  ('Réserver', 'Tu mets la carte de côté et tu prends 1 or. Pour une carte forte que tu ne peux pas encore payer, ou pour la retirer à un adversaire.'),
  ('Acheter', 'Tu paies le coût, moins tes bonus. L’or remplace n’importe quelle couleur.'))
  + tip('À la fin de ton tour, tu ne gardes que 10 jetons : inutile d’en amasser plus.'))),
 ('Marquer des points', wrap(table([
  ('Cartes du niveau I', '0 ou 1'), ('Cartes du niveau II', '1 à 3'), ('Cartes du niveau III', '3 à 5'), ('Noble', '3')], ['Source', 'Points'])
  + '<h5>Les nobles</h5><p>Un noble vient tout seul à la fin de ton tour quand tes bonus atteignent ses exigences : 4 bonus dans deux couleurs, ou 3 bonus dans trois couleurs. Les jetons ne comptent pas, seulement les cartes.</p>'
  + tip('Repère dès le début une couleur demandée par deux nobles : chaque carte de cette couleur te rapproche des deux.'))),
 ('Conseils', wrap(grid(
  ('Les bonus d’abord', 'Une carte sans point mais pas chère te fait gagner un jeton à chaque achat suivant. C’est ton moteur.'),
  ('Vise un ou deux nobles', 'Concentre tes achats sur leurs couleurs plutôt que de t’éparpiller.'),
  ('Réserve au bon moment', 'Trois réservations au maximum. Garde-les pour les cartes à 4 ou 5 points et pour gêner un adversaire.'),
  ('Surveille les scores', 'À 12 ou 13 points chez un adversaire, il n’est plus temps de construire : prends les points disponibles.'),
  ('Regarde la banque', 'Une couleur épuisée bloque tout le monde. Si elle te manque, l’or d’une réservation la remplace.'),
  ('En cas d’égalité', 'Celui qui a le moins de cartes gagne : à score égal, les grosses cartes valent mieux que beaucoup de petites.')))),
 ('Aide-mémoire', wrap(table([
  ('Jetons par couleur', '4 à 2 joueurs, 5 à 3, 7 à 4'), ('Or', '5 jetons'), ('Limite de jetons', '10 à la fin du tour'),
  ('Réservations', '3 au maximum'), ('Noble', '3 points, un seul par tour'), ('Fin de partie', '15 points, puis on finit le tour'), ('Égalité', 'le moins de cartes')], cls='l'))),
 ('Modules', wrap('<p>Les modules se jouent un seul à la fois. Commence par le jeu de base, puis essaie-les dans cet ordre.</p>' + steps(
  '<b>Les Orients.</b> Des cartes spéciales à côté de chaque rangée : jumelage, double bonus, or qui compte double. Le plus accessible.',
  '<b>Les Comptoirs.</b> Des pouvoirs permanents à débloquer avec tes bonus.',
  '<b>Les Cités.</b> Elles remplacent les nobles et changent la fin : la première cité conquise termine la partie.',
  '<b>Les Forteresses.</b> Chaque achat pose un fort qui bloque une carte. Le module le plus agressif.')
  + '<p>Le détail de chaque module est dans l’Aide.</p>')),
]

AGES = [
 ('debut', 'Première partie', wrap(steps(
  'Avant de jouer, chaque joueur choisit 4 merveilles.',
  'À ton tour, touche une carte <b>dorée</b> de la pyramide et choisis : la <b>construire</b>, la <b>défausser</b> contre des pièces, ou t’en servir pour <b>bâtir une merveille</b>.',
  'Prendre une carte en libère d’autres, parfois retournées face visible à ce moment-là. Regarde ce que tu offres à l’adversaire avant de jouer.',
  'À la fin d’un âge, le joueur le plus faible militairement ouvre le suivant.',
  'Si personne n’a gagné avant, on compte les points après l’Âge III.')
  + '<h5>Quoi viser</h5>' + grid(
  ('Âge I : les ressources', 'Des cartes marron et grises variées, et un ou deux dépôts jaunes pour payer moins cher.'),
  ('Âge II : prendre l’avantage', 'Les paires de symboles scientifiques donnent des jetons progrès. C’est aussi le moment de pousser le pion conflit.'),
  ('Âge III : conclure', 'Guildes et gros bâtiments bleus pour les points. Surveille les deux victoires immédiates jusqu’à la dernière carte.'))
  + tip('Pour découvrir le jeu, joue sans extension contre l’IA facile.'))),
 ('victoires', 'Gagner et se défendre', wrap(grid(
  ('Par les armes', 'Chaque bouclier pousse le pion conflit d’une case. À 9 cases, il atteint la capitale adverse et la partie s’arrête. En chemin, les cases 3 et 6 pillent l’adversaire : −2 puis −5 pièces.<br><b>Pour t’en défendre</b> : construis des cartes rouges, ou retire-les à l’adversaire en les défaussant.'),
  ('Par la science', 'Réunis 6 symboles scientifiques différents. Deux symboles identiques donnent un jeton progrès.<br><b>Pour t’en défendre</b> : compte ses symboles. À partir du quatrième, prends les cartes vertes qui lui manquent, même pour les défausser.'),
  ('Par le Sénat (Agora)', 'Contrôle les 6 chambres en même temps.<br><b>Pour t’en défendre</b> : garde la majorité dans au moins une chambre.'),
  ('Aux points', 'Après l’Âge III : bâtiments bleus, merveilles, jetons progrès, guildes, et 1 point pour 3 pièces. Ton score provisoire s’affiche en vert à côté de tes pièces.')))),
 ('argent', 'Argent et commerce', wrap(table([
  ('Ressource qui te manque', '2 pièces + 1 par exemplaire que produit l’adversaire'), ('Avec un dépôt (carte jaune)', 'cette ressource coûte 1 pièce'),
  ('Défausser une carte', '2 pièces + 1 par carte jaune que tu possèdes'), ('Chaînage', 'gratuit si tu as déjà le symbole demandé'), ('Fin de partie', '3 pièces = 1 point')], cls='l')
  + tip('Le jeu achète tout seul ce qui te manque. Le détail du prix s’affiche sous le bouton Construire.')
  + '<p>Plus l’adversaire produit une ressource, plus elle te coûte cher. Si tu es seul à produire une ressource rare, c’est lui qui paiera le prix fort.</p>')),
 ('conseils', 'Conseils', wrap(grid(
  ('Compte ce que tu libères', 'Avant de prendre une carte, regarde lesquelles deviennent jouables pour l’adversaire. Parfois la bonne carte est celle qui ne libère rien.'),
  ('Garde un « Rejoue »', 'Une merveille qui fait rejouer permet de prendre deux cartes de suite : idéal pour saisir une carte que tu viens de libérer.'),
  ('Sept merveilles, pas huit', 'Seules 7 merveilles peuvent être bâties. La huitième est abandonnée : ne laisse pas la tienne pour la fin.'),
  ('Varie tes ressources tôt', 'Une ressource que tu ne produis pas et que l’adversaire produit en double te coûtera 4 pièces à chaque fois.'),
  ('Défausser n’est pas perdre', 'Défausser une carte que l’adversaire attendait te donne des pièces et lui retire une occasion.'),
  ('Évite les pillages', 'Perdre 5 pièces à la case 6 peut t’empêcher de construire au pire moment. Un bouclier bien placé suffit souvent.')))),
 ('extensions', 'Extensions', wrap('<p>Les deux extensions peuvent se jouer séparément ou ensemble. Essaie-les une par une.</p>' + grid(
  ('Panthéon', 'Des dieux à invoquer à la place de ta prise de carte, dès l’Âge II. Les sceaux de l’Âge I décident quels dieux entrent en jeu.'),
  ('Agora', 'Un Sénat à six chambres, des décrets, des complots secrets, et une troisième victoire immédiate.'))
  + '<p>Chacune est expliquée pas à pas dans l’Aide, onglets Panthéon et Agora.</p>')),
]
