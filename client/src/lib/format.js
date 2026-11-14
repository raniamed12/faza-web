export const dt = (n) => (n === 0 ? "Gratuit" : `${Number.isInteger(n) ? n : n.toFixed(1)} DT`);
export const priceFrom = (n) => (n === 0 ? "Gratuit" : `dès ${Number.isInteger(n) ? n : n.toFixed(1)} DT`);

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export function dateRange(start, end) {
  const a = new Date(start + "T12:00:00"), b = new Date(end + "T12:00:00");
  const fa = `${a.getDate()} ${MONTHS[a.getMonth()]}`, fb = `${b.getDate()} ${MONTHS[b.getMonth()]}`;
  if (start === end) return `${fa} ${a.getFullYear()}`;
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) return `${a.getDate()}–${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
  return `${fa} – ${fb} ${b.getFullYear()}`;
}
export const monthLabel = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

export const SLOT_LABEL = { matin: "Matin", midi: "Midi", "apres-midi": "Après-midi", soir: "Soir", nuit: "Nuit" };

// Les rubriques de FAZA, en dialecte tunisien.
export const RUBRIQUES = [
  { id: "sleep", name: "Win nbatou ?", ar: "وين نبيتو؟", fr: "Où dormir", color: "#17497A" },
  { id: "eat", name: "Benna", ar: "بنّة", fr: "Où manger", color: "#D62839" },
  { id: "do", name: "Win nemchiw ?", ar: "وين نمشيو؟", fr: "Que faire", color: "#C65D3B" },
  { id: "discover", name: "Lakta", ar: "لقطة", fr: "Que découvrir", color: "#0E2F4F" },
];
export const RUB = Object.fromEntries(RUBRIQUES.map((r) => [r.id, r]));
export const NEWS = { name: "Jaw Tounsna", ar: "جو تونسنا", fr: "Quoi de neuf" };
export const GEMS = { name: "Blayes mkhabbya", ar: "بلايص مخبّية", fr: "Les pépites du coin" };

export const TAG_LABEL = { nature: "Nature", culture: "Culture", gastronomie: "Gastronomie", sport: "Sport", detente: "Détente", mer: "Mer", desert: "Désert" };
export const EVENT_LABEL = { festival: "Festival", concert: "Concert", culture: "Culture", sport: "Sport", rando: "Randonnée", gastronomie: "Gastronomie" };

export const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
