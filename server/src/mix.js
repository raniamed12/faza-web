// FAZA MIX — composition d’un programme par RÈGLES SIMPLES (pas d’IA).
//
//  1. On liste les lieux du gouvernorat, par catégorie.
//  2. On découpe chaque jour en créneaux : matin (activité), midi (repas), après-midi (activité), soir (repas),
//     et une nuit d’hébergement entre deux jours.
//  3. Le budget par personne est réparti entre hébergement, repas et activités.
//  4. Pour chaque créneau, on prend le lieu le mieux noté selon les préférences, dans la part de budget prévue.
//  5. Si le total dépasse le budget, on remplace l’étape la plus chère par une alternative moins chère.

export const SLOTS = {
  matin: { label: "Matin", cats: ["do", "discover"] },
  midi: { label: "Midi", cats: ["eat"] },
  "apres-midi": { label: "Après-midi", cats: ["discover", "do"] },
  soir: { label: "Soir", cats: ["eat"] },
  nuit: { label: "Nuit", cats: ["sleep"] },
};
export const PREFS = ["nature", "culture", "gastronomie", "sport", "detente", "mer", "desert"];

// Petit générateur pseudo-aléatoire reproductible (même graine = même programme).
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function parsePlace(r) {
  return {
    id: r.id, slug: r.slug, name: r.name, category: r.category, description: r.description,
    price: r.price, tags: JSON.parse(r.tags || "[]"), scene: r.scene, image: r.image,
    lat: r.lat, lng: r.lng, precision: r.precision, address: r.address,
    instagram: r.instagram, facebook: r.facebook,
    isGem: !!r.is_gem, source: r.source,
    gov: { slug: r.gov_slug, name: r.gov_name },
  };
}

const PLACE_SQL = `SELECT p.*, g.slug gov_slug, g.name gov_name FROM places p
  JOIN governorates g ON g.id = p.governorate_id
  WHERE p.status='approved' AND g.slug = ?`;

export function validateParams(p) {
  const errors = {};
  const budget = Number(p.budget), days = Number(p.days), people = Number(p.people);
  if (!p.governorate) errors.governorate = "Choisis un gouvernorat.";
  if (!Number.isFinite(budget) || budget < 10 || budget > 2000) errors.budget = "Le budget par personne doit être entre 10 et 2000 DT.";
  if (!Number.isInteger(days) || days < 1 || days > 3) errors.days = "La durée doit être de 1 à 3 jours.";
  if (!Number.isInteger(people) || people < 1 || people > 12) errors.people = "Le groupe doit compter de 1 à 12 personnes.";
  return errors;
}

export function generateProgram(db, params) {
  const budget = Number(params.budget), days = Number(params.days), people = Number(params.people);
  const prefs = (params.prefs || []).filter((x) => PREFS.includes(x));
  const rnd = mulberry32(Number.isFinite(+params.seed) ? +params.seed : Date.now() % 100000);

  const gov = db.prepare("SELECT * FROM governorates WHERE slug=?").get(params.governorate);
  if (!gov) throw Object.assign(new Error("Gouvernorat inconnu."), { status: 400 });

  const own = db.prepare(PLACE_SQL).all(gov.slug).map(parsePlace);
  const regional = db
    .prepare(`SELECT p.*, g.slug gov_slug, g.name gov_name FROM places p JOIN governorates g ON g.id=p.governorate_id
              WHERE p.status='approved' AND g.region=? AND g.slug<>?`)
    .all(gov.region, gov.slug).map(parsePlace);

  const notes = [];
  const score = (p) => 1 + 2 * p.tags.filter((t) => prefs.includes(t)).length + (p.isGem ? 0.5 : 0) + rnd() * 0.8;
  const pool = (cats) => {
    let list = own.filter((p) => cats.includes(p.category));
    if (list.length < 2) {
      const extra = regional.filter((p) => cats.includes(p.category));
      if (extra.length) { list = list.concat(extra); notes.push(`Quelques étapes viennent de la région (${gov.region}), faute de lieux dans ${gov.name}.`); }
    }
    return list.map((p) => ({ p, s: score(p) })).sort((a, b) => b.s - a.s);
  };

  const nights = days - 1;
  const share = nights > 0 ? { sleep: 0.35, eat: 0.35, act: 0.3 } : { sleep: 0, eat: 0.5, act: 0.5 };
  const plan = [];
  for (let d = 1; d <= days; d++) {
    plan.push({ day: d, slot: "matin" }, { day: d, slot: "midi" }, { day: d, slot: "apres-midi" }, { day: d, slot: "soir" });
    if (d < days) plan.push({ day: d, slot: "nuit" });
  }
  const count = (kind) => plan.filter((x) => (kind === "act" ? ["matin", "apres-midi"].includes(x.slot) : kind === "eat" ? ["midi", "soir"].includes(x.slot) : x.slot === "nuit")).length;
  const cap = (slot) => {
    const kind = slot === "nuit" ? "sleep" : ["midi", "soir"].includes(slot) ? "eat" : "act";
    return (budget * share[kind]) / Math.max(1, count(kind));
  };

  const used = new Set();
  const pools = {};
  const items = [];
  for (const step of plan) {
    const cats = SLOTS[step.slot].cats;
    const key = cats.join("|");
    pools[key] ||= pool(cats);
    const free = pools[key].filter((x) => !used.has(x.p.id));
    let chosen = free.find((x) => x.p.price <= cap(step.slot));
    if (!chosen) chosen = [...free].sort((a, b) => a.p.price - b.p.price)[0];
    if (!chosen) { notes.push(`Aucun lieu disponible pour « ${SLOTS[step.slot].label} » (jour ${step.day}).`); continue; }
    used.add(chosen.p.id);
    items.push({ day: step.day, slot: step.slot, place: chosen.p, cost: chosen.p.price, _key: key });
  }

  // Rééquilibrage : si on dépasse le budget, on remplace l’étape la plus chère par une alternative moins chère.
  const total = () => items.reduce((a, b) => a + b.cost, 0);
  for (let guard = 0; guard < 30 && total() > budget; guard++) {
    const sorted = [...items].sort((a, b) => b.cost - a.cost);
    let swapped = false;
    for (const it of sorted) {
      const alt = pools[it._key].find((x) => !used.has(x.p.id) && x.p.price < it.cost);
      if (alt) { used.delete(it.place.id); used.add(alt.p.id); it.place = alt.p; it.cost = alt.p.price; swapped = true; break; }
    }
    if (!swapped) break;
  }
  if (total() > budget) notes.push("Le budget est serré : retire une étape ou augmente-le un peu pour plus de choix.");

  const res = items.map((it) => ({
    day: it.day, slot: it.slot, cost: it.cost, place: it.place,
    alternatives: pools[it._key].filter((x) => !used.has(x.p.id)).slice(0, 5).map((x) => x.p),
  }));
  const perPerson = res.reduce((a, b) => a + b.cost, 0);
  const label = days === 1 ? "Journée" : days === 2 ? "Week-end" : `${days} jours`;
  return {
    title: `${label} à ${gov.name}`,
    governorate: { slug: gov.slug, name: gov.name, nameAr: gov.name_ar },
    budget, days, people, prefs, seed: params.seed ?? null,
    items: res, perPerson, groupTotal: perPerson * people, leftover: Math.round((budget - perPerson) * 10) / 10, notes,
  };
}
