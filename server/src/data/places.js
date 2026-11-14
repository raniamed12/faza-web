// Lieux de démonstration. À ENRICHIR par l’équipe avec de vraies adresses.
//
// Format : [gouvernorat, catégorie, nom, description, tags, prix (DT par personne), lat, lng, précision, scène]
//   catégorie : sleep | eat | do | discover
//   précision : "exact" (le site est connu et localisable), "ville" (position approximative du secteur),
//               "quartier" (centre du quartier). Les lieux de type « typologie » (maison d’hôtes, spécialité
//               culinaire…) ne sont PAS des établissements réels : remplacez-les par de vraies adresses.
//   prix : entrée, repas ou nuitée par personne — valeurs INDICATIVES.
//   tags : nature, culture, gastronomie, sport, detente, mer, desert
//
// Les liens Instagram / Facebook sont volontairement vides : ajoutez-les (champs instagram, facebook)
// quand vous avez vérifié les vraies pages. L’interface propose une recherche en attendant.
export const PLACES = [
  // ───────── TUNIS
  ["tunis", "discover", "Médina de Tunis", "Un labyrinthe de souks classé à l’UNESCO autour de la mosquée Zitouna. Venez tôt le matin, avant la foule, et laissez-vous perdre.", ["culture", "detente"], 0, 36.7986, 10.1706, "exact", "medina"],
  ["tunis", "discover", "Musée national du Bardo", "L’une des plus belles collections de mosaïques romaines du monde, dans un ancien palais beylical.", ["culture"], 13, 36.8092, 10.1346, "exact", "medina"],
  ["tunis", "discover", "Thermes d’Antonin, Carthage", "Les grands thermes romains en bord de mer, l’ensemble le plus spectaculaire de la cité antique.", ["culture", "mer"], 12, 36.8528, 10.3235, "exact", "ruins"],
  ["tunis", "discover", "Sidi Bou Saïd", "Le village blanc et bleu au-dessus du golfe. Montez tôt, prenez un thé aux pignons en terrasse.", ["detente", "culture", "mer"], 0, 36.8687, 10.3416, "exact", "sea"],
  ["tunis", "do", "Corniche de La Marsa", "Promenade de bord de mer, glaciers et cafés. Idéale en fin d’après-midi.", ["detente", "mer"], 0, 36.8782, 10.3247, "quartier", "sea"],
  ["tunis", "do", "Parc du Belvédère", "Grand parc au-dessus de la ville, avec un zoo et des vues sur le lac. Parfait pour un pique-nique.", ["nature", "detente"], 0, 36.8227, 10.179, "exact", "forest"],
  ["tunis", "sleep", "Maison d’hôtes dans la médina de Tunis", "Ancienne demeure à patio : chambres autour d’une cour, petit-déjeuner sur la terrasse.", ["culture", "detente"], 85, 36.7986, 10.1706, "quartier", "hotel"],
  ["tunis", "sleep", "Hôtel en bord de mer à Gammarth", "Chambres avec vue sur la mer, plages privées et restaurants au bord de l’eau.", ["mer", "detente"], 120, 36.922, 10.286, "quartier", "hotel"],

  // ───────── ARIANA
  ["ariana", "do", "Plage de Raoued", "Longue plage de sable au nord de Tunis, à 30 minutes du centre. Surtout agréable hors saison.", ["mer", "detente"], 0, 36.9333, 10.1833, "ville", "sea"],
  ["ariana", "discover", "Kalâat el-Andalous", "Village de caractère aux maisons andalouses, dans la campagne au nord de l’Ariana.", ["culture", "nature"], 0, 37.0728, 10.1203, "ville", "medina"],
  ["ariana", "sleep", "Appart-hôtel à Ennasr", "Studios équipés dans un quartier calme, pratiques pour un séjour de quelques jours.", ["detente"], 60, 36.865, 10.165, "quartier", "hotel"],

  // ───────── BEN AROUS
  ["ben-arous", "do", "Parc national du Boukornine", "Sentiers de randonnée dans les pins d’Alep, avec vue sur le golfe de Tunis. À 20 minutes de la capitale.", ["nature", "sport"], 0, 36.7, 10.33, "ville", "mountain"],
  ["ben-arous", "discover", "Front de mer de Hammam-Lif", "Station balnéaire de la fin du XIXᵉ siècle : villas anciennes, plage et promenade face au golfe.", ["culture", "mer"], 0, 36.7287, 10.3405, "ville", "sea"],
  ["ben-arous", "sleep", "Gîte au pied du Boukornine", "Chambres simples près de la montagne, point de départ des randonnées.", ["nature"], 55, 36.7, 10.33, "ville", "hotel"],
  ["ben-arous", "eat", "Poisson grillé à Radès", "Poisson du jour grillé et salades, comme on le mange sur la côte sud du golfe.", ["gastronomie", "mer"], 30, 36.7667, 10.2747, "ville", "food"],

  // ───────── MANOUBA
  ["manouba", "discover", "Tebourba, ville andalouse", "Ancienne ville de la vallée de la Medjerda marquée par l’héritage des Andalous venus d’Espagne.", ["culture"], 0, 36.83, 9.84, "ville", "medina"],
  ["manouba", "do", "Vélo dans la campagne de la Manouba", "Pistes agricoles plates, vergers et petits villages : une sortie facile à la journée.", ["nature", "sport"], 0, 36.81, 10.0863, "ville", "forest"],
  ["manouba", "eat", "Pain tabouna et mlaoui de village", "Pain cuit au four en terre et crêpe feuilletée à la harissa, au bord de la route.", ["gastronomie"], 5, 36.81, 10.0863, "ville", "food"],
  ["manouba", "sleep", "Chambre d’hôtes à la ferme", "Une nuit au calme, petit-déjeuner avec les produits de la ferme.", ["nature", "detente"], 60, 36.81, 10.0863, "ville", "hotel"],

  // ───────── NABEUL
  ["nabeul", "discover", "Kerkouane, cité punique", "Les vestiges d’une ville punique du Cap Bon, classés à l’UNESCO, face à la mer.", ["culture", "mer"], 10, 36.9569, 11.0889, "ville", "ruins"],
  ["nabeul", "do", "Médina et plage de Hammamet", "Kasbah, ruelles blanches et plage de sable fin : la sortie classique du Cap Bon.", ["detente", "mer", "culture"], 0, 36.3995, 10.6125, "exact", "sea"],
  ["nabeul", "do", "Marché du vendredi à Nabeul", "Poterie, épices, vannerie : le grand marché de Nabeul se tient le vendredi.", ["culture", "gastronomie"], 0, 36.4513, 10.7357, "ville", "medina"],
  ["nabeul", "discover", "Fort et plage de Kélibia", "Forteresse qui domine la mer et plage de sable blanc, tout au bout du Cap Bon.", ["culture", "mer"], 5, 36.847, 11.102, "exact", "sea"],
  ["nabeul", "sleep", "Maison d’hôtes à Hammamet", "Maison blanche à patio à quelques pas de la médina et de la plage.", ["detente", "mer"], 90, 36.3995, 10.6125, "quartier", "hotel"],
  ["nabeul", "eat", "Fruits de mer à Kélibia", "Poisson et fruits de mer frais, directement depuis le port.", ["gastronomie", "mer"], 35, 36.847, 11.102, "ville", "food"],

  // ───────── ZAGHOUAN
  ["zaghouan", "discover", "Temple des Eaux de Zaghouan", "Monument romain à la source d’où partait l’aqueduc vers Carthage. Cadre frais et vue sur la ville.", ["culture", "nature"], 0, 36.4033, 10.1425, "exact", "ruins"],
  ["zaghouan", "do", "Randonnée au Jebel Zaghouan", "Montée dans le calcaire jusqu’aux crêtes, avec de grandes vues sur la plaine. Partez tôt.", ["nature", "sport"], 0, 36.35, 10.1167, "ville", "mountain"],
  ["zaghouan", "sleep", "Gîte de montagne", "Hébergement simple au pied du massif, idéal pour une randonnée au lever du soleil.", ["nature"], 45, 36.4029, 10.1429, "ville", "hotel"],
  ["zaghouan", "eat", "Cuisine du terroir à Zaghouan", "Olives, huile, miel et plats mijotés de la région.", ["gastronomie"], 15, 36.4029, 10.1429, "ville", "food"],

  // ───────── BIZERTE
  ["bizerte", "discover", "Vieux Port de Bizerte", "Un port de pêche aux quais colorés, avec son vieux fort et ses cafés au bord de l’eau.", ["detente", "culture", "mer"], 0, 37.2744, 9.8739, "exact", "sea"],
  ["bizerte", "do", "Ras Angela, pointe nord de l’Afrique", "Le cap le plus septentrional du continent, avec falaises, phare et vue sur la Méditerranée.", ["nature", "mer"], 0, 37.3437, 9.7427, "ville", "sea"],
  ["bizerte", "do", "Parc national d’Ichkeul", "Lac et montagne classés à l’UNESCO, étape des oiseaux migrateurs en hiver.", ["nature"], 5, 37.16, 9.67, "ville", "forest"],
  ["bizerte", "eat", "Poisson frais au Vieux Port", "Poisson grillé et salades face aux bateaux de pêche.", ["gastronomie", "mer"], 30, 37.2744, 9.8739, "ville", "food"],
  ["bizerte", "sleep", "Hôtel sur la corniche de Bizerte", "Chambres avec vue sur la mer, à quelques minutes du vieux port.", ["mer", "detente"], 100, 37.2744, 9.8739, "ville", "hotel"],

  // ───────── BÉJA
  ["beja", "discover", "Dougga (Thugga)", "L’un des sites romains les mieux conservés d’Afrique du Nord, classé à l’UNESCO, avec son théâtre sur la colline.", ["culture"], 12, 36.4233, 9.2203, "exact", "ruins"],
  ["beja", "discover", "Testour, village andalou", "Village aux tuiles rouges et au minaret original, connu pour son festival de malouf.", ["culture"], 0, 36.5517, 9.4425, "ville", "medina"],
  ["beja", "do", "Randonnée dans les forêts du Nord-Ouest", "Chemins de forêt, chênes-lièges et villages perchés : le vert intense du nord du pays.", ["nature", "sport"], 0, 36.7256, 9.1817, "ville", "forest"],
  ["beja", "sleep", "Maison d’hôtes près de Téboursouk", "Chambres dans la campagne, à quelques kilomètres de Dougga.", ["culture", "nature"], 70, 36.4642, 9.2467, "ville", "hotel"],
  ["beja", "eat", "Agneau et blé : cuisine de la Medjerda", "Plats généreux à base de blé, d’agneau et de légumes de la plaine.", ["gastronomie"], 20, 36.7256, 9.1817, "ville", "food"],

  // ───────── JENDOUBA
  ["jendouba", "do", "Forêt de chênes-lièges d’Aïn Draham", "Sentiers ombragés dans l’une des régions les plus arrosées du pays. Ambiance de chalets.", ["nature", "sport"], 0, 36.7783, 8.6906, "exact", "forest"],
  ["jendouba", "do", "Fort génois et plages de Tabarka", "Petit port, fort sur son rocher et criques où l’on peut plonger ou se baigner.", ["mer", "sport", "detente"], 5, 36.956, 8.758, "exact", "sea"],
  ["jendouba", "discover", "Bulla Regia et ses maisons souterraines", "Cité romaine où les riches habitaient sous terre pour échapper à la chaleur. Mosaïques en place.", ["culture"], 12, 36.5583, 8.7556, "exact", "ruins"],
  ["jendouba", "sleep", "Chalet en forêt à Aïn Draham", "Cheminée, bois et brume : le décor idéal d’un week-end d’hiver.", ["nature", "detente"], 70, 36.7783, 8.6906, "ville", "hotel"],
  ["jendouba", "eat", "Grillades de montagne à Aïn Draham", "Viandes grillées et plats mijotés, parfaits après une randonnée.", ["gastronomie"], 20, 36.7783, 8.6906, "ville", "food"],

  // ───────── LE KEF
  ["le-kef", "discover", "Kasbah du Kef", "Forteresse qui domine la ville, avec une grande vue sur les plaines vers l’Algérie.", ["culture"], 5, 36.1814, 8.7147, "exact", "ruins"],
  ["le-kef", "discover", "Basilique Dar el-Kous", "Ruines romaines au cœur de la vieille ville, bordées de ruelles et de terrasses.", ["culture"], 0, 36.18, 8.715, "exact", "ruins"],
  ["le-kef", "do", "Source de Ras el-Aïn", "Petite place de la source, cafés et escaliers : l’endroit où les Kéfois se retrouvent.", ["detente", "culture"], 0, 36.1826, 8.7148, "ville", "medina"],
  ["le-kef", "sleep", "Maison d’hôtes au Kef", "Maison de ville à patio dans les hauteurs, avec vue sur la vallée.", ["culture", "detente"], 70, 36.1826, 8.7148, "ville", "hotel"],
  ["le-kef", "eat", "Cuisine du Haut-Tell", "Couscous à l’agneau, plats mijotés et pains de campagne.", ["gastronomie"], 18, 36.1826, 8.7148, "ville", "food"],

  // ───────── SILIANA
  ["siliana", "discover", "Makthar, cité numide et romaine", "Site de haute altitude avec arc de triomphe, thermes et nécropole, presque sans touristes.", ["culture"], 12, 35.85, 9.2, "ville", "ruins"],
  ["siliana", "do", "Parc national du Jebel Serj", "Sentiers sur un plateau de calcaire, avec de beaux points de vue sur les montagnes.", ["nature", "sport"], 0, 35.8, 9.4, "ville", "mountain"],
  ["siliana", "sleep", "Gîte rural près de Makthar", "Chambres chez l’habitant, petit-déjeuner de campagne.", ["nature"], 45, 35.85, 9.2, "ville", "hotel"],
  ["siliana", "eat", "Cuisine de terroir à Siliana", "Plats mijotés, pain de campagne et huile d’olive du plateau.", ["gastronomie"], 15, 36.0849, 9.3708, "ville", "food"],

  // ───────── SOUSSE
  ["sousse", "discover", "Médina de Sousse et Ribat", "Médina classée à l’UNESCO : montez au sommet du ribat pour voir toute la ville.", ["culture"], 10, 35.8259, 10.6409, "exact", "medina"],
  ["sousse", "do", "Plage de Boujaffar", "La grande plage urbaine de Sousse, avec cafés et promenade, de jour comme de nuit.", ["mer", "detente"], 0, 35.833, 10.641, "quartier", "sea"],
  ["sousse", "discover", "Takrouna, village berbère perché", "Village de pierre sur un piton rocheux, avec vue sur les oliveraies jusqu’à la mer.", ["culture", "nature"], 0, 36.0167, 10.4333, "ville", "mountain"],
  ["sousse", "sleep", "Hôtel face à la mer à Port El Kantaoui", "Chambres avec vue sur la marina, piscine et plages à proximité.", ["mer", "detente"], 110, 35.8895, 10.5958, "quartier", "hotel"],
  ["sousse", "eat", "Poisson et salades de la médina", "Petits restaurants de poisson grillé autour du port.", ["gastronomie", "mer"], 28, 35.8256, 10.6369, "ville", "food"],

  // ───────── MONASTIR
  ["monastir", "discover", "Ribat de Monastir", "Forteresse du VIIIᵉ siècle au bord de l’eau, décor de plusieurs films.", ["culture", "mer"], 10, 35.7765, 10.8346, "exact", "ruins"],
  ["monastir", "discover", "Mausolée de Bourguiba", "Grand mausolée à coupoles dorées, visible de loin depuis la ville.", ["culture"], 0, 35.7623, 10.812, "ville", "medina"],
  ["monastir", "do", "Plage de Skanès", "Plage de sable et eau claire au nord de la ville.", ["mer", "detente"], 0, 35.7708, 10.7803, "ville", "sea"],
  ["monastir", "sleep", "Maison d’hôtes à Monastir", "Chambres calmes à quelques minutes de la mer et du ribat.", ["detente", "mer"], 80, 35.7643, 10.8113, "ville", "hotel"],
  ["monastir", "eat", "Cuisine du Sahel : poisson et pâtisseries", "Poisson grillé, pâtisseries aux amandes et douceurs du Sahel.", ["gastronomie", "mer"], 25, 35.7643, 10.8113, "ville", "food"],

  // ───────── MAHDIA
  ["mahdia", "discover", "Amphithéâtre d’El Jem", "L’un des plus grands amphithéâtres romains conservés, qui accueille un festival de musique en été.", ["culture"], 12, 35.2965, 10.7068, "exact", "ruins"],
  ["mahdia", "discover", "Skifa el-Kahla et médina de Mahdia", "Porte fatimide de la cité, médina sur son cap et cimetière face à la mer.", ["culture", "mer"], 0, 35.5047, 11.0622, "exact", "medina"],
  ["mahdia", "do", "Plage et corniche de Mahdia", "Sable clair, eau calme et promenade qui fait le tour du cap.", ["mer", "detente"], 0, 35.5047, 11.0622, "ville", "sea"],
  ["mahdia", "sleep", "Maison d’hôtes à Mahdia", "Maison traditionnelle près du port, avec terrasse sur la mer.", ["detente", "mer"], 85, 35.5047, 11.0622, "ville", "hotel"],
  ["mahdia", "eat", "Poisson du port de Mahdia", "Poisson frais grillé, directement à la criée.", ["gastronomie", "mer"], 25, 35.5047, 11.0622, "ville", "food"],

  // ───────── SFAX
  ["sfax", "discover", "Médina de Sfax", "Médina fortifiée presque intacte, avec ses souks de ferronnerie et ses remparts du IXᵉ siècle.", ["culture"], 0, 34.7387, 10.76, "exact", "medina"],
  ["sfax", "discover", "Dar Jellouli, musée des arts et traditions", "Maison de notable sfaxien transformée en musée, avec patios et objets de la vie quotidienne.", ["culture"], 5, 34.7389, 10.7619, "ville", "medina"],
  ["sfax", "do", "Îles Kerkennah à vélo", "Une traversée de ferry et des pistes plates entre palmiers, pêcheries de charfia et plages.", ["nature", "detente", "mer"], 0, 34.7, 11.1, "ville", "sea"],
  ["sfax", "sleep", "Maison d’hôtes à Kerkennah", "Chambres au bord de l’eau, rythme tranquille et poisson frais.", ["detente", "mer"], 70, 34.7, 11.1, "ville", "hotel"],
  ["sfax", "eat", "Poulpe et poisson au port de Sfax", "Cuisine sfaxienne à base de poisson et de poulpe, très épicée.", ["gastronomie", "mer"], 25, 34.7406, 10.7603, "ville", "food"],

  // ───────── KAIROUAN
  ["kairouan", "discover", "Grande Mosquée de Kairouan", "L’une des plus anciennes mosquées du Maghreb, avec sa cour immense et son minaret massif.", ["culture"], 0, 35.6804, 10.0999, "exact", "medina"],
  ["kairouan", "discover", "Bassins des Aghlabides", "Deux grands bassins circulaires qui alimentaient la ville en eau au IXᵉ siècle.", ["culture"], 3, 35.6845, 10.1052, "ville", "ruins"],
  ["kairouan", "discover", "Médina de Kairouan et tapis", "Ruelles blanches, ateliers de tapis noués à la main et boutiques de cuivre.", ["culture"], 0, 35.6781, 10.0963, "ville", "medina"],
  ["kairouan", "eat", "Makroudh de Kairouan", "Le gâteau de semoule fourré aux dattes, frit et trempé dans le miel : la spécialité de la ville.", ["gastronomie"], 5, 35.6781, 10.0963, "ville", "food"],
  ["kairouan", "sleep", "Maison d’hôtes dans la médina de Kairouan", "Patio, chambres voûtées et toit-terrasse avec vue sur les minarets.", ["culture", "detente"], 80, 35.6781, 10.0963, "quartier", "hotel"],

  // ───────── KASSERINE
  ["kasserine", "discover", "Sbeïtla (Sufetula)", "Forum romain intact et trois temples côte à côte, dans la steppe et presque sans visiteurs.", ["culture"], 12, 35.238, 9.113, "exact", "ruins"],
  ["kasserine", "do", "Jebel Chambi (1 544 m)", "Le plus haut sommet du pays : montée dans les pins d’Alep, vue sur la frontière algérienne.", ["nature", "sport"], 0, 35.2, 8.6833, "ville", "mountain"],
  ["kasserine", "sleep", "Gîte au pied du Chambi", "Chambre simple chez l’habitant, départ de randonnée à l’aube.", ["nature"], 45, 35.2, 8.6833, "ville", "hotel"],
  ["kasserine", "eat", "Méchoui et pain de campagne", "Agneau cuit lentement et pain de la montagne.", ["gastronomie"], 20, 35.1676, 8.8365, "ville", "food"],

  // ───────── SIDI BOUZID
  ["sidi-bouzid", "do", "Parc national de Bou-Hedma", "Savane et steppe protégées où l’on a réintroduit des antilopes. À cheval sur Sidi Bouzid et Gafsa.", ["nature"], 5, 34.5, 9.7, "ville", "desert"],
  ["sidi-bouzid", "discover", "Marché hebdomadaire de Sidi Bouzid", "Le rendez-vous des agriculteurs du centre : olives, piments, dattes et bétail.", ["culture", "gastronomie"], 0, 35.0382, 9.4849, "ville", "medina"],
  ["sidi-bouzid", "sleep", "Chambre d’hôtes en bordure de steppe", "Hébergement rural, grand ciel étoilé.", ["nature"], 45, 35.0382, 9.4849, "ville", "hotel"],
  ["sidi-bouzid", "eat", "Cuisine du centre : couscous et piments", "Plats épicés et pain cuit au feu.", ["gastronomie"], 12, 35.0382, 9.4849, "ville", "food"],

  // ───────── GABÈS
  ["gabes", "discover", "Oasis maritime de Gabès", "Rare oasis qui touche la mer : palmiers, grenadiers, henné et marchés d’ombre.", ["nature", "culture"], 0, 33.8881, 10.0975, "ville", "oasis"],
  ["gabes", "discover", "Matmata, maisons troglodytes", "Habitations creusées dans la terre autour d’un cratère : un décor connu du cinéma.", ["culture"], 5, 33.5436, 9.9697, "exact", "desert"],
  ["gabes", "do", "Balade dans la palmeraie de Gabès", "Visite à pied ou en calèche sous les palmiers, étages de grenadiers et de vignes.", ["nature", "detente"], 15, 33.8881, 10.0975, "ville", "oasis"],
  ["gabes", "sleep", "Nuit en maison troglodyte à Matmata", "Chambres creusées dans la roche, fraîches en été et chaudes en hiver.", ["culture", "desert"], 60, 33.5436, 9.9697, "ville", "hotel"],
  ["gabes", "eat", "Marqa et couscous au poisson", "Plats du Sud-Est : ragoût de légumes et de viande, couscous au poisson.", ["gastronomie"], 18, 33.8815, 10.0982, "ville", "food"],

  // ───────── MÉDENINE
  ["medenine", "discover", "Houmt Souk, capitale de Djerba", "Souks, ancien fondouk et petit port : le cœur de l’île.", ["culture"], 0, 33.875, 10.857, "exact", "medina"],
  ["medenine", "discover", "Synagogue de la Ghriba", "L’un des plus anciens lieux de culte juifs d’Afrique du Nord, à Er-Riadh. Visite selon les horaires.", ["culture"], 0, 33.806, 10.857, "ville", "medina"],
  ["medenine", "do", "Plages de Djerba", "Sable blanc et eau turquoise sur la côte est de l’île, surtout agréable au printemps.", ["mer", "detente"], 0, 33.85, 11.0, "ville", "sea"],
  ["medenine", "sleep", "Houch djerbien (maison d’hôtes)", "Ancienne ferme à cour blanche, entourée d’oliviers.", ["culture", "detente"], 90, 33.875, 10.857, "ville", "hotel"],
  ["medenine", "eat", "Poisson grillé au port de Houmt Souk", "Poisson du jour et fruits de mer, à partager.", ["gastronomie", "mer"], 30, 33.875, 10.857, "ville", "food"],

  // ───────── TATAOUINE
  ["tataouine", "discover", "Ksar Ouled Soltane", "Grenier fortifié à ghorfas superposées, entre les décors du désert.", ["culture"], 3, 32.7, 10.4, "ville", "desert"],
  ["tataouine", "discover", "Chenini et Douiret", "Villages berbères perchés sur des crêtes, avec mosquée blanche et maisons troglodytes.", ["culture"], 0, 32.91, 10.2833, "ville", "mountain"],
  ["tataouine", "do", "Circuit 4×4 sur la route des ksour", "Pistes et paysages entre les ksour : à faire avec un guide local.", ["nature", "desert", "sport"], 60, 32.9297, 10.4518, "ville", "desert"],
  ["tataouine", "sleep", "Nuit dans un ksar aménagé", "Chambres dans d’anciennes ghorfas, fraîches même en été.", ["culture", "desert"], 55, 32.9297, 10.4518, "ville", "hotel"],
  ["tataouine", "eat", "Cuisine berbère : bsissa et couscous", "Plats simples et copieux du Sud, souvent à base d’orge.", ["gastronomie"], 15, 32.9297, 10.4518, "ville", "food"],

  // ───────── GAFSA
  ["gafsa", "discover", "Bassins romains de Gafsa", "Deux bassins d’eau chaude naturelle en plein centre-ville, où se baignent les enfants.", ["culture", "detente"], 0, 34.425, 8.7842, "ville", "ruins"],
  ["gafsa", "do", "Train du Lézard Rouge à Metlaoui", "Ancien train du Bey qui traverse les gorges de Selja, entre rochers rouges et canyons.", ["nature", "culture"], 40, 34.3167, 8.4, "ville", "desert"],
  ["gafsa", "sleep", "Maison d’hôtes à Gafsa", "Chambres calmes près de l’oasis.", ["detente"], 55, 34.425, 8.7842, "ville", "hotel"],
  ["gafsa", "eat", "Dattes et pain du sud-ouest", "Dattes du jour, pain cuit au four et thé à la menthe.", ["gastronomie"], 10, 34.425, 8.7842, "ville", "food"],

  // ───────── TOZEUR
  ["tozeur", "discover", "Oasis et quartier d’Ouled el-Hadef", "Briques jaunes disposées en motifs géométriques, ruelles ombragées et palmeraie voisine.", ["culture", "nature"], 0, 33.9197, 8.1335, "exact", "oasis"],
  ["tozeur", "discover", "Chebika, Tamerza et Mides", "Trois oasis de montagne avec cascades, canyons et village abandonné.", ["nature", "culture"], 15, 34.3925, 7.9381, "ville", "mountain"],
  ["tozeur", "do", "Chott el-Jérid", "L’immense lac salé aux couleurs changeantes, à traverser en voiture ou à pied.", ["nature", "desert"], 0, 33.85, 8.4, "ville", "desert"],
  ["tozeur", "do", "Ong Jmel : le décor de cinéma des dunes", "Dunes et rochers où plusieurs films de science-fiction ont été tournés, près de Nefta.", ["desert", "culture"], 30, 33.8736, 7.8761, "ville", "desert"],
  ["tozeur", "sleep", "Maison d’hôtes dans l’oasis de Tozeur", "Chambres entre les palmiers, petit-déjeuner de dattes et de pain chaud.", ["nature", "detente"], 70, 33.9197, 8.1335, "ville", "hotel"],
  ["tozeur", "eat", "Dattes Deglet Nour", "La datte de Tozeur : à déguster nature, fourrée ou en pâtisserie.", ["gastronomie"], 10, 33.9197, 8.1335, "ville", "food"],

  // ───────── KÉBILI
  ["kebili", "discover", "Douz, porte du Sahara", "Ville de départ des excursions : marché, palmeraie et dunes à l’horizon.", ["desert", "culture"], 0, 33.4567, 9.0214, "exact", "desert"],
  ["kebili", "do", "Dromadaire dans les dunes de Douz", "Balade au lever ou au coucher du soleil, avec guide local.", ["desert", "nature"], 30, 33.4567, 9.0214, "ville", "desert"],
  ["kebili", "do", "Source chaude de Ksar Ghilane", "Oasis au milieu des dunes avec source chaude et ruines d’un fort romain.", ["desert", "detente"], 90, 32.9833, 9.6333, "ville", "oasis"],
  ["kebili", "sleep", "Bivouac sous tente dans les dunes", "Nuit sous les étoiles, dîner et petit-déjeuner au feu de bois.", ["desert", "nature"], 80, 33.4567, 9.0214, "ville", "hotel"],
  ["kebili", "eat", "Pain sous le sable (mella)", "Pain cuit sous la braise et le sable, avec méchoui et thé.", ["gastronomie", "desert"], 15, 33.4567, 9.0214, "ville", "food"],
];

// Pépites proposées par l’équipe FAZA (lieux mis en avant dans « Blayes mkhabbya »).
// Elles désignent des lieux déjà présents ci-dessus (par leur nom).
export const TEAM_GEMS = [
  "Takrouna, village berbère perché",
  "Source de Ras el-Aïn",
  "Chebika, Tamerza et Mides",
  "Îles Kerkennah à vélo",
  "Bulla Regia et ses maisons souterraines",
  "Temple des Eaux de Zaghouan",
  "Sbeïtla (Sufetula)",
  "Ras Angela, pointe nord de l’Afrique",
];
