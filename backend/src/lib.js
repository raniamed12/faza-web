// Fonctions partagées par les routes.
export const PLACE_SELECT = `
  SELECT p.*, g.slug gov_slug, g.name gov_name, g.name_ar gov_name_ar,
    (SELECT ROUND(AVG(rating),1) FROM reviews r WHERE r.place_id=p.id AND r.hidden=0) rating,
    (SELECT COUNT(*) FROM reviews r WHERE r.place_id=p.id AND r.hidden=0) review_count
  FROM places p JOIN governorates g ON g.id = p.governorate_id`;

export function formatPlace(r, favs) {
  return {
    id: r.id, slug: r.slug, name: r.name, category: r.category, description: r.description,
    address: r.address, lat: r.lat, lng: r.lng, precision: r.precision, price: r.price,
    tags: JSON.parse(r.tags || "[]"), scene: r.scene, image: r.image,
    instagram: r.instagram, facebook: r.facebook, website: r.website,
    hours: r.hours, closedDay: r.closed_day, priceFactor: r.price_factor,
    palette: r.palette ? JSON.parse(r.palette) : null, mapX: r.map_x, mapY: r.map_y,
    isGem: !!r.is_gem, source: r.source, status: r.status,
    rating: r.rating ?? null, reviewCount: r.review_count ?? 0,
    gov: { slug: r.gov_slug, name: r.gov_name, nameAr: r.gov_name_ar },
    favorite: favs ? favs.has(r.id) : false,
  };
}

export const favSet = (db, user) =>
  user ? new Set(db.prepare("SELECT place_id FROM favorites WHERE user_id=?").all(user.id).map((r) => r.place_id)) : null;

export function formatEvent(e) {
  return {
    id: e.id, slug: e.slug, title: e.title, category: e.category, description: e.description,
    start: e.start_date, end: e.end_date, confirmed: !!e.confirmed, price: e.price, venue: e.venue,
    scene: e.scene, instagram: e.instagram, facebook: e.facebook, link: e.link,
    gov: { slug: e.gov_slug, name: e.gov_name, nameAr: e.gov_name_ar },
  };
}

export const EVENT_SELECT = `SELECT e.*, g.slug gov_slug, g.name gov_name, g.name_ar gov_name_ar
  FROM events e JOIN governorates g ON g.id = e.governorate_id`;

// Accepte une URL ou un identifiant (@nom) et renvoie une URL du bon réseau, ou null.
export function normalizeSocial(value, network) {
  if (value == null || String(value).trim() === "") return { ok: true, value: null };
  let v = String(value).trim();
  const hosts = network === "instagram" ? ["instagram.com", "www.instagram.com"] : ["facebook.com", "www.facebook.com", "fb.com", "m.facebook.com"];
  if (!/^https?:\/\//i.test(v)) {
    const handle = v.replace(/^@/, "");
    if (!/^[A-Za-z0-9._-]{2,60}$/.test(handle)) return { ok: false };
    return { ok: true, value: `https://${network === "instagram" ? "www.instagram.com" : "www.facebook.com"}/${handle}` };
  }
  try {
    const u = new URL(v);
    if (!hosts.includes(u.hostname)) return { ok: false };
    return { ok: true, value: u.toString() };
  } catch {
    return { ok: false };
  }
}

export const inTunisia = (lat, lng) => lat >= 30 && lat <= 37.6 && lng >= 7.5 && lng <= 11.7;
