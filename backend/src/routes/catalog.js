import { Router } from "express";
import { CATEGORIES } from "../data/governorates.js";
import { EVENT_SELECT, PLACE_SELECT, favSet, formatEvent, formatPlace } from "../lib.js";
import { authRequired } from "../auth.js";

export function catalogRoutes(db) {
  const r = Router();

  r.get("/categories", (_req, res) => res.json(CATEGORIES));

  // Les 24 gouvernorats, avec le nombre de lieux par rubrique et une « affinité » par ambiance
  // (utilisée pour colorer la carte de l’accueil).
  r.get("/governorates", (_req, res) => {
    const govs = db.prepare("SELECT * FROM governorates ORDER BY name").all();
    const places = db.prepare("SELECT governorate_id g, category, tags FROM places WHERE status='approved'").all();
    const events = db.prepare("SELECT governorate_id g, COUNT(*) n FROM events GROUP BY governorate_id").all();
    const evByGov = Object.fromEntries(events.map((e) => [e.g, e.n]));
    res.json(
      govs.map((g) => {
        const mine = places.filter((p) => p.g === g.id);
        const counts = { sleep: 0, eat: 0, do: 0, discover: 0 };
        const affinity = {};
        for (const p of mine) {
          counts[p.category]++;
          for (const t of JSON.parse(p.tags)) affinity[t] = (affinity[t] || 0) + 1;
        }
        affinity.fete = evByGov[g.id] || 0;
        return { id: g.id, slug: g.slug, name: g.name, nameAr: g.name_ar, region: g.region, lat: g.lat, lng: g.lng, tagline: g.tagline, scene: g.scene, counts, total: mine.length, events: evByGov[g.id] || 0, affinity };
      })
    );
  });

  // Page d’un gouvernorat : lieux (par rubrique) + événements.
  r.get("/governorates/:slug", (req, res) => {
    const g = db.prepare("SELECT * FROM governorates WHERE slug=?").get(req.params.slug);
    if (!g) return res.status(404).json({ error: "Gouvernorat introuvable." });
    const favs = favSet(db, req.user);
    const places = db.prepare(`${PLACE_SELECT} WHERE p.governorate_id=? AND p.status='approved' ORDER BY p.is_gem DESC, p.name`).all(g.id).map((p) => formatPlace(p, favs));
    const events = db.prepare(`${EVENT_SELECT} WHERE e.governorate_id=? ORDER BY e.start_date`).all(g.id).map(formatEvent);
    res.json({
      governorate: { id: g.id, slug: g.slug, name: g.name, nameAr: g.name_ar, region: g.region, lat: g.lat, lng: g.lng, tagline: g.tagline, scene: g.scene },
      places, events,
    });
  });

  // GET /api/places?gov=&category=&maxPrice=&tag=&q=&gem=1&limit=
  r.get("/places", (req, res) => {
    const { gov, category, maxPrice, tag, q, gem, limit } = req.query;
    const where = ["p.status='approved'"], args = [];
    if (gov) { where.push("g.slug = ?"); args.push(gov); }
    if (category) { where.push("p.category = ?"); args.push(category); }
    if (maxPrice !== undefined && maxPrice !== "" && Number.isFinite(+maxPrice)) { where.push("p.price <= ?"); args.push(+maxPrice); }
    if (tag) { where.push("p.tags LIKE ?"); args.push(`%"${String(tag).replace(/[^a-z]/g, "")}"%`); }
    if (q) { where.push("(p.name LIKE ? OR p.description LIKE ?)"); args.push(`%${q}%`, `%${q}%`); }
    if (gem === "1") where.push("p.is_gem = 1");
    const lim = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 300);
    const favs = favSet(db, req.user);
    res.json(db.prepare(`${PLACE_SELECT} WHERE ${where.join(" AND ")} ORDER BY p.is_gem DESC, p.name LIMIT ${lim}`).all(...args).map((p) => formatPlace(p, favs)));
  });

  // Fiche détaillée : lieu + avis + photos.
  r.get("/places/:slug", (req, res) => {
    const row = db.prepare(`${PLACE_SELECT} WHERE p.slug=?`).get(req.params.slug);
    const canSee = row && (row.status === "approved" || (req.user && (req.user.role === "admin" || req.user.id === row.author_id)));
    if (!canSee) return res.status(404).json({ error: "Lieu introuvable." });
    const reviews = db
      .prepare(`SELECT r.id, r.rating, r.text, r.photo, r.created_at, u.name author FROM reviews r JOIN users u ON u.id=r.user_id
                WHERE r.place_id=? AND r.hidden=0 ORDER BY r.id DESC`)
      .all(row.id);
    const photos = db.prepare("SELECT url FROM place_photos WHERE place_id=? ORDER BY id DESC").all(row.id).map((p) => p.url);
    const dishes = db.prepare(`SELECT d.* FROM place_dishes pd JOIN dishes d ON d.id=pd.dish_id WHERE pd.place_id=?`).all(row.id);
    res.json({ place: formatPlace(row, favSet(db, req.user)), reviews, photos: [...photos, ...reviews.filter((x) => x.photo).map((x) => x.photo)], dishes });
  });

  r.post("/places/:slug/reviews", authRequired, (req, res) => {
    const place = db.prepare("SELECT id FROM places WHERE slug=? AND status='approved'").get(req.params.slug);
    if (!place) return res.status(404).json({ error: "Lieu introuvable." });
    const rating = parseInt(req.body?.rating, 10);
    const text = String(req.body?.text || "").trim();
    const photo = req.body?.photo ? String(req.body.photo) : null;
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: "Choisis une note de 1 à 5 étoiles." });
    if (text.length < 5 || text.length > 800) return res.status(400).json({ error: "Ton avis doit faire entre 5 et 800 caractères." });
    if (photo && !/^\/uploads\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(photo)) return res.status(400).json({ error: "Photo invalide." });
    const id = db.prepare("INSERT INTO reviews (place_id,user_id,rating,text,photo) VALUES (?,?,?,?,?)").run(place.id, req.user.id, rating, text, photo).lastInsertRowid;
    res.status(201).json({ review: { id, rating, text, photo, author: req.user.name, created_at: new Date().toISOString() } });
  });

  r.post("/places/:slug/photos", authRequired, (req, res) => {
    const place = db.prepare("SELECT id FROM places WHERE slug=? AND status='approved'").get(req.params.slug);
    if (!place) return res.status(404).json({ error: "Lieu introuvable." });
    const url = String(req.body?.url || "");
    if (!/^\/uploads\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(url)) return res.status(400).json({ error: "Photo invalide." });
    db.prepare("INSERT INTO place_photos (place_id,user_id,url) VALUES (?,?,?)").run(place.id, req.user.id, url);
    res.status(201).json({ url });
  });

  // Événements : /api/events?gov=&category=&maxPrice=&from=&to=
  r.get("/events", (req, res) => {
    const { gov, category, maxPrice, from, to } = req.query;
    const where = ["1=1"], args = [];
    if (gov) { where.push("g.slug=?"); args.push(gov); }
    if (category) { where.push("e.category=?"); args.push(category); }
    if (maxPrice !== undefined && maxPrice !== "" && Number.isFinite(+maxPrice)) { where.push("e.price <= ?"); args.push(+maxPrice); }
    if (from) { where.push("e.end_date >= ?"); args.push(from); }
    if (to) { where.push("e.start_date <= ?"); args.push(to); }
    res.json(db.prepare(`${EVENT_SELECT} WHERE ${where.join(" AND ")} ORDER BY e.start_date`).all(...args).map(formatEvent));
  });

  // Benna : plats + lieux de la rubrique « où manger » avec leur menu.
  r.get("/benna", (req, res) => {
    const dishes = db.prepare("SELECT * FROM dishes ORDER BY page, rowid").all();
    const menu = db.prepare("SELECT dish_id, name, price FROM menu_items ORDER BY id").all();
    const spots = db
      .prepare(`${PLACE_SELECT} WHERE p.category='eat' AND p.status='approved' AND p.map_x IS NOT NULL ORDER BY p.id`)
      .all()
      .map((p) => ({
        ...formatPlace(p, favSet(db, req.user)),
        dishes: db.prepare("SELECT dish_id FROM place_dishes WHERE place_id=?").all(p.id).map((x) => x.dish_id),
      }));
    res.json({
      dishes: dishes.map((d) => ({ id: d.id, name: d.name, emoji: d.emoji, color: d.color, page: d.page, menu: menu.filter((m) => m.dish_id === d.id).map((m) => [m.name, m.price]) })),
      spots,
    });
  });

  r.get("/challenges", (_req, res) => res.json(db.prepare("SELECT * FROM challenges").all()));

  return r;
}
