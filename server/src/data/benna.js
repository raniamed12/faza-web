// BENNA (بنّة) — la partie « où manger » de FAZA, reprise du prototype de l’équipe.
// ⚠ Les adresses ci-dessous sont des DONNÉES DE DÉMONSTRATION (noms fictifs) : à remplacer par de vrais lieux.
// Pour chaque lieu réel, renseignez : instagram, facebook, lat, lng (position exacte), address, hours.

// page = page du carnet (1 à 6)
export const DISHES = [
  { id: "matcha", name: "Matcha glacé", emoji: "🍵", color: "#d6e6bf", page: 1 },
  { id: "icedcoffee", name: "Café glacé", emoji: "🧋", color: "#e9d6bf", page: 1 },
  { id: "croissant", name: "Croissant", emoji: "🥐", color: "#f3dfb3", page: 1 },
  { id: "cinnamon", name: "Roulé à la cannelle", emoji: "🥯", color: "#ead0b1", page: 1 },
  { id: "donuts", name: "Donuts", emoji: "🍩", color: "#f6cfd6", page: 2 },
  { id: "macarons", name: "Macarons", emoji: "🍬", color: "#e3d4f0", page: 2 },
  { id: "sushi", name: "Sushi", emoji: "🍣", color: "#f6d3c6", page: 3 },
  { id: "pasta", name: "Spaghetti", emoji: "🍝", color: "#f5e2b8", page: 3 },
  { id: "burger", name: "Burger", emoji: "🍔", color: "#f0d4b0", page: 3 },
  { id: "brunch", name: "Brunch", emoji: "🥞", color: "#f7e3c4", page: 4 },
  { id: "pizza", name: "Pizza", emoji: "🍕", color: "#f4d0bd", page: 3 },
  { id: "drinks", name: "Boissons", emoji: "🍹", color: "#cfe6ea", page: 4 },
  { id: "thevert", name: "Thé aux pignons", emoji: "🫖", color: "#d3e3c6", page: 4 },
  { id: "bambalouni", name: "Bambalouni", emoji: "🍩", color: "#f2e0bf", page: 2 },
  { id: "fricasse", name: "Fricassé", emoji: "🥪", color: "#f3dcc0", page: 5 },
  { id: "mlaoui", name: "Mlaoui", emoji: "🌯", color: "#efdcc3", page: 5 },
  { id: "chapati", name: "Chapati", emoji: "🥙", color: "#ead9c0", page: 5 },
  { id: "brik", name: "Brik", emoji: "🥟", color: "#f2dcb4", page: 5 },
  { id: "couscous", name: "Couscous", emoji: "🍲", color: "#f1ddb1", page: 6 },
  { id: "lablebi", name: "Lablebi", emoji: "🥣", color: "#ecd3b5", page: 6 },
  { id: "ojja", name: "Ojja", emoji: "🍳", color: "#f4cdbb", page: 6 },
  { id: "mechouia", name: "Salade mechouia", emoji: "🫑", color: "#dfe8c4", page: 6 },
  { id: "bouza", name: "Bouza", emoji: "🍨", color: "#e9dccd", page: 2 },
  { id: "citronnade", name: "Citronnade", emoji: "🍋", color: "#f3ecb4", page: 4 },
];

// Prix de base en dinars ; chaque lieu applique son coefficient de prix (pf).
export const MENU = {
  matcha: [["Latte matcha glacé", 12], ["Matcha fraise", 14], ["Matcha coco", 13]],
  icedcoffee: [["Latte glacé", 9], ["Spanish latte glacé", 11], ["Cold brew", 10]],
  croissant: [["Croissant au beurre", 3.5], ["Croissant aux amandes", 5], ["Pain au chocolat", 3.8]],
  cinnamon: [["Roulé cannelle classique", 7], ["Roulé cannelle pistache", 9]],
  donuts: [["Donut glacé", 4.5], ["Donut Nutella", 6], ["Donut pistache", 6.5]],
  macarons: [["Macaron", 3.5], ["Boîte de 6 macarons", 18]],
  sushi: [["California roll (8 pièces)", 22], ["Nigiri saumon (2 pièces)", 14], ["Chirashi saumon", 32], ["Dragon roll", 28]],
  pasta: [["Spaghetti carbonara", 24], ["Penne arrabbiata", 19], ["Linguine aux fruits de mer", 36]],
  burger: [["Cheeseburger classique", 22], ["Double smash burger", 28], ["Burger poulet", 20]],
  brunch: [["Brunch complet", 35], ["Pancakes aux fruits rouges", 18], ["Toast avocat et œuf", 21]],
  pizza: [["Margherita", 16], ["Pizza thon et olives", 19], ["Pizza quatre fromages", 24]],
  drinks: [["Smoothie mangue", 11], ["Mojito sans alcool", 12], ["Jus d’orange frais", 7]],
  thevert: [["Thé vert à la menthe", 3], ["Thé aux pignons", 8], ["Thé aux amandes", 7]],
  bambalouni: [["Bambalouni au sucre", 2], ["Bambalouni au miel", 3]],
  fricasse: [["Fricassé thon et œuf", 2.5], ["Fricassé complet", 3.5]],
  mlaoui: [["Mlaoui thon et harissa", 4], ["Mlaoui fromage", 4.5], ["Mlaoui complet", 6]],
  chapati: [["Chapati thon", 5], ["Chapati poulet", 7.5]],
  brik: [["Brik à l’œuf", 3], ["Brik thon et câpres", 4]],
  couscous: [["Couscous agneau", 28], ["Couscous poisson", 32], ["Couscous légumes", 18]],
  lablebi: [["Lablebi classique", 5], ["Lablebi œuf et thon", 7]],
  ojja: [["Ojja merguez", 14], ["Ojja crevettes", 22]],
  mechouia: [["Salade mechouia", 8], ["Mechouia thon et œuf", 12]],
  bouza: [["Bouza noisette", 9], ["Bouza pignons", 14]],
  citronnade: [["Citronnade", 5], ["Citronnade à la menthe", 6]],
};

// x, y : position sur la carte dessinée de Tunis (0–1600 × 0–1000)
// lat, lng : position APPROXIMATIVE du quartier (à remplacer par l’adresse exacte)
// off : jour de fermeture (0 = dimanche, -1 = jamais)
export const SPOTS = [
  { id: "jasmin-matcha", name: "Jasmin & Matcha", area: "La Marsa", gov: "tunis", x: 1118, y: 262, lat: 36.8782, lng: 10.3247, sp: ["matcha", "icedcoffee", "cinnamon", "croissant", "brunch", "drinks"], pf: 1.1, h: "08:00-23:00", off: -1, pal: ["#cfe0b5", "#f3e6c9"], v: "Café lumineux à deux pas de la plage, des plantes partout et une playlist lo-fi.", ad: "Rue du Saf-Saf, La Marsa" },
  { id: "belvedere-bleu", name: "Le Belvédère Bleu", area: "Sidi Bou Saïd", gov: "tunis", x: 1196, y: 382, lat: 36.8687, lng: 10.3416, sp: ["thevert", "bambalouni", "citronnade", "bouza", "mechouia", "couscous"], pf: 1.2, h: "09:00-00:30", off: -1, pal: ["#9cc3e6", "#f4f1ea"], v: "Terrasse bleue et blanche au-dessus du golfe : thé aux pignons au coucher du soleil.", ad: "Rue Habib Thameur, Sidi Bou Saïd" },
  { id: "boulangerie-yasmine", name: "Maison Yasmine", area: "Lac 2", gov: "tunis", x: 905, y: 418, lat: 36.8386, lng: 10.2713, sp: ["croissant", "cinnamon", "donuts", "macarons", "icedcoffee"], pf: 1.05, h: "07:00-21:00", off: 1, pal: ["#f3d9c6", "#f7eee0"], v: "Viennoiseries au beurre, vitrines pastel et odeur de cannelle dès 7 h.", ad: "Les Berges du Lac 2" },
  { id: "sakura-lac", name: "Sakura Lac", area: "Les Berges du Lac", gov: "tunis", x: 812, y: 468, lat: 36.8335, lng: 10.229, sp: ["sushi", "matcha", "drinks"], pf: 1.3, h: "12:00-23:30", off: -1, pal: ["#f2c9cf", "#efe9e4"], v: "Comptoir japonais minimaliste, bois clair et lanternes en papier.", ad: "Rue du Lac Windermere, Les Berges du Lac" },
  { id: "nonna-carthage", name: "Nonna Carthage", area: "Carthage", gov: "tunis", x: 1148, y: 488, lat: 36.8528, lng: 10.3235, sp: ["pasta", "pizza", "brunch"], pf: 1.15, h: "12:00-23:00", off: 1, pal: ["#f1d2a8", "#e8efe0"], v: "Pâtes fraîches, nappes à carreaux et oliviers au milieu des ruines.", ad: "Avenue de la République, Carthage" },
  { id: "smash-kasbah", name: "Smash Kasbah", area: "Centre-ville", gov: "tunis", x: 590, y: 566, lat: 36.799, lng: 10.179, sp: ["burger", "drinks"], pf: 0.95, h: "11:30-01:00", off: -1, pal: ["#f0c49a", "#2f2a27"], v: "Smash burgers, néon rouge et frites maison, ouvert tard.", ad: "Avenue de Paris, Tunis" },
  { id: "bab-bhar", name: "Fricassé Bab Bhar", area: "Médina", gov: "tunis", x: 498, y: 612, lat: 36.7986, lng: 10.1706, sp: ["fricasse", "brik", "lablebi", "ojja", "mlaoui"], pf: 0.8, h: "06:30-16:00", off: 0, pal: ["#e9c48f", "#cfe0ee"], v: "Petit stand de la médina qui frit des fricassés dorés à la commande.", ad: "Souk El Attarine, Médina de Tunis" },
  { id: "dar-mlaoui", name: "Dar Mlaoui", area: "Ennasr", gov: "ariana", x: 518, y: 292, lat: 36.865, lng: 10.165, sp: ["mlaoui", "chapati", "thevert", "citronnade", "couscous"], pf: 0.85, h: "08:00-23:30", off: -1, pal: ["#efcf9b", "#f3ece0"], v: "Mlaoui cuit sur la tabouna devant vous, avec une harissa maison qui pique.", ad: "Avenue Hédi Nouira, Ennasr" },
  { id: "chapati-goulette", name: "Chez Hamadi", area: "La Goulette", gov: "tunis", x: 1086, y: 706, lat: 36.8183, lng: 10.305, sp: ["chapati", "brik", "fricasse", "ojja", "pizza"], pf: 0.9, h: "10:00-02:00", off: -1, pal: ["#a8cde0", "#f2dfc2"], v: "L’adresse des nuits d’été sur l’avenue : chapati et brik face au port.", ad: "Avenue Franklin Roosevelt, La Goulette" },
  { id: "bambalouni-sidibou", name: "Bambalouni Sidi Bou", area: "Sidi Bou Saïd", gov: "tunis", x: 1222, y: 318, lat: 36.8687, lng: 10.3416, sp: ["bambalouni", "thevert"], pf: 0.8, h: "07:00-22:00", off: -1, pal: ["#f4e2b8", "#9ec2e3"], v: "Bambalouni sucré bien chaud, à manger en montant vers le phare.", ad: "Montée de Sidi Bou Saïd" },
  { id: "dar-zitouna", name: "Dar Zitouna", area: "Médina", gov: "tunis", x: 462, y: 652, lat: 36.7986, lng: 10.1706, sp: ["couscous", "ojja", "mechouia", "thevert"], pf: 1.1, h: "12:00-22:30", off: 0, pal: ["#d9b98a", "#7fa7cc"], v: "Palais de la médina avec patio de faïences et couscous du vendredi.", ad: "Rue Jamaa Ezzitouna, Médina de Tunis" },
  { id: "petit-brunch", name: "Le Petit Brunch", area: "El Menzah", gov: "tunis", x: 606, y: 372, lat: 36.839, lng: 10.185, sp: ["brunch", "icedcoffee", "donuts", "matcha"], pf: 1, h: "08:00-17:00", off: 1, pal: ["#f6dcc8", "#e5ecd6"], v: "Brunch du week-end, piles de pancakes et vaisselle dépareillée.", ad: "Avenue Charles Nicolle, El Menzah" },
  { id: "umi-gammarth", name: "Umi Gammarth", area: "Gammarth", gov: "tunis", x: 1056, y: 122, lat: 36.922, lng: 10.286, sp: ["sushi", "drinks", "macarons"], pf: 1.35, h: "13:00-00:00", off: -1, pal: ["#a9d3dd", "#f3e2d7"], v: "Rooftop face à la mer : sushis et mocktails au coucher du soleil.", ad: "Corniche de Gammarth" },
  { id: "la-pasta-lac", name: "La Pasta del Lago", area: "Lac 1", gov: "tunis", x: 752, y: 440, lat: 36.8335, lng: 10.229, sp: ["pasta", "pizza", "burger"], pf: 1.05, h: "12:00-23:30", off: -1, pal: ["#f2d6a2", "#d7e7e4"], v: "Grande salle vitrée sur le lac, four à bois et spritz sans alcool.", ad: "Les Berges du Lac 1" },
  { id: "lablebi-hafsia", name: "Lablebi El Hafsia", area: "Médina", gov: "tunis", x: 540, y: 646, lat: 36.7986, lng: 10.1706, sp: ["lablebi", "brik", "citronnade"], pf: 0.75, h: "05:30-14:00", off: 0, pal: ["#e5b98a", "#efe3cc"], v: "Lablebi des lève-tôt : pain rassis, pois chiches, cumin, harissa.", ad: "Quartier Hafsia, Médina de Tunis" },
  { id: "glacier-marsa", name: "Glacier de la Corniche", area: "La Marsa", gov: "tunis", x: 1158, y: 214, lat: 36.8782, lng: 10.3247, sp: ["bouza", "macarons", "donuts", "citronnade", "drinks"], pf: 1, h: "10:00-01:00", off: -1, pal: ["#f6d6e0", "#bfe0e6"], v: "Bouza aux pignons, citronnade glacée et balade sur la corniche.", ad: "Corniche de La Marsa" },
];
