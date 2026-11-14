// Événements de démonstration — rendez-vous récurrents, avec DATES INDICATIVES.
// Vérifiez toujours auprès de l’organisateur : les programmations changent chaque année.
//
// [gouvernorat, titre, catégorie, début, fin, dates confirmées ?, prix indicatif (DT), lieu, description, scène]
//   catégorie : festival | concert | culture | sport | rando | gastronomie
export const EVENTS = [
  ["tunis", "Journées Cinématographiques de Carthage", "culture", "2026-11-14", "2026-11-28", 0, 10, "Salles de Tunis", "Le grand rendez-vous du cinéma arabe et africain, avec projections dans plusieurs salles de la capitale.", "medina"],
  ["kebili", "Festival international du Sahara", "festival", "2026-12-24", "2026-12-27", 0, 0, "Douz", "Courses de dromadaires, chants bédouins et fantasia aux portes du désert.", "desert"],
  ["tozeur", "Festival international de l’Oasis", "festival", "2026-12-18", "2026-12-21", 0, 0, "Tozeur", "Spectacles, artisanat et dégustations de dattes dans la palmeraie.", "oasis"],
  ["ben-arous", "Randonnée du dimanche au Boukornine", "rando", "2026-11-22", "2026-11-22", 0, 0, "Parc national du Boukornine", "Sortie collective à pied dans les pins d’Alep. Exemple d’événement à remplacer par ceux des clubs de randonnée locaux.", "mountain"],
  ["nabeul", "Marché du vendredi de Nabeul", "gastronomie", "2026-11-20", "2026-11-20", 1, 0, "Centre-ville de Nabeul", "Poterie, épices et produits du terroir, chaque vendredi.", "medina"],
  ["tunis", "Festival de la Médina", "festival", "2027-02-08", "2027-03-09", 0, 0, "Médina de Tunis", "Soirées de musique et de théâtre dans les ruelles et les cafés de la médina, pendant le Ramadan.", "medina"],
  ["tataouine", "Festival international des Ksour sahariens", "festival", "2027-03-25", "2027-03-28", 0, 0, "Tataouine", "Musique, danse et expositions dans les villages fortifiés du Sud.", "desert"],
  ["jendouba", "Festival international de Jazz à Tabarka", "concert", "2027-07-09", "2027-07-14", 0, 35, "Fort génois, Tabarka", "Concerts de jazz au bord de la mer, avec un décor de fort et de criques.", "sea"],
  ["beja", "Festival international du Malouf de Testour", "concert", "2027-07-15", "2027-07-19", 0, 20, "Testour", "Le malouf andalou et ses orchestres, dans un village à l’histoire espagnole.", "medina"],
  ["tunis", "Festival international de Carthage", "concert", "2027-07-10", "2027-08-20", 0, 40, "Théâtre romain de Carthage", "La grande saison de concerts d’été dans un théâtre antique.", "ruins"],
  ["nabeul", "Festival international de Hammamet", "concert", "2027-07-12", "2027-08-25", 0, 35, "Théâtre de Hammamet", "Concerts et théâtre en plein air face à la mer.", "sea"],
  ["mahdia", "Festival international de musique symphonique d’El Jem", "concert", "2027-07-20", "2027-07-30", 0, 45, "Amphithéâtre d’El Jem", "Orchestres symphoniques dans l’un des plus grands amphithéâtres romains du monde.", "ruins"],
  ["sousse", "Festival international de Sousse", "concert", "2027-07-25", "2027-08-15", 0, 30, "Théâtre de Sousse", "Concerts d’été au cœur de la ville.", "sea"],
  ["nabeul", "Festival international du film amateur de Kélibia", "culture", "2027-08-03", "2027-08-10", 0, 5, "Kélibia", "Courts métrages et jeunes réalisateurs dans une ville de bord de mer.", "sea"],
];

export const CHALLENGES = [
  ["Explorateur du Nord", "Visite 3 gouvernorats du Nord-Ouest et partage une photo de chacun.", 30, "Boussole"],
  ["Gourmand de chez nous", "Goûte 5 spécialités régionales et note-les dans Benna.", 25, "Cuillère"],
  ["Sortie à petit budget", "Compose un programme de moins de 50 DT par personne avec FAZA MIX.", 20, "Pièce"],
  ["Pépite du coin", "Propose un lieu peu connu et fais-le valider par l’équipe.", 40, "Étoile"],
];
