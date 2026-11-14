import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { UPLOAD_DIR } from "../db.js";
import { adminRequired, authRequired } from "../auth.js";
import { PLACE_SELECT, formatPlace, inTunisia, normalizeSocial } from "../lib.js";
import { slugify } from "../seed.js";

const MIME = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const TAGS = ["nature", "culture", "gastronomie", "sport", "detente", "mer", "desert"];

export function communityRoutes(db) {
  const r = Router();

  // ───── Envoi de photo : { dataUrl } → { url }. Le navigateur réduit l’image avant l’envoi. ─────
  r.post("/uploads", authRequired, (req, res) => {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.dataUrl || ""));
    if (!m) return res.status(400).json({ error: "Envoie une image JPEG, PNG ou WebP." });
    const buf = Buffer.from(m[2], "base64");
    if (buf.length > 3 * 1024 * 1024) return res.status(413).json({ error: "Photo trop lourde (3 Mo maximum)." });
    const name = `${crypto.randomBytes(9).toString("hex")}.${MIME[m[1]]}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    res.status(201).json({ url: `/uploads/${name}` });
  });

  // ───── Fil de la communauté : avis, pépites, programmes partagés ─────
  r.get("/community/feed", (_req, res) => {
    const reviews = db
      .prepare(`SELECT r.id, r.rating, r.text, r.photo, r.created_at, u.name author, p.name place, p.slug, g.name gov
                FROM reviews r JOIN users u ON u.id=r.user_id JOIN places p ON p.id=r.place_id JOIN governorates g ON g.id=p.governorate_id
                WHERE r.hidden=0 ORDER BY r.id DESC LIMIT 20`)
      .all().map((x) => ({ type: "review", date: x.created_at, ...x }));
    const gems = db
      .prepare(`${PLACE_SELECT} WHERE p.source='community' AND p.status='approved' ORDER BY p.id DESC LIMIT 20`)
      .all().map((p) => ({ type: "gem", date: p.created_at, place: formatPlace(p), author: db.prepare("SELECT name FROM users WHERE id=?").get(p.author_id)?.name }));
    const programs = db
      .prepare(`SELECT pr.id, pr.title, pr.share_code, pr.budget, pr.days, pr.participants, pr.created_at, u.name author, g.name gov, g.slug govSlug
                FROM programs pr JOIN users u ON u.id=pr.user_id JOIN governorates g ON g.id=pr.governorate_id
                WHERE pr.visibility='shared' ORDER BY pr.id DESC LIMIT 20`)
      .all().map((x) => ({ type: "program", date: x.created_at, ...x }));
    const feed = [...reviews, ...gems, ...programs].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 30);
    res.json(feed);
  });

  // ───── Proposer un lieu : localisation exacte ET page Facebook ou Instagram obligatoires ─────
  r.post("/community/places", authRequired, (req, res) => {
    const b = req.body || {};
    const fields = {};
    const gov = db.prepare("SELECT id FROM governorates WHERE slug=?").get(b.governorate);
    const name = String(b.name || "").trim(), description = String(b.description || "").trim();
    const lat = Number(b.lat), lng = Number(b.lng), price = Number(b.price ?? 0);
    if (!gov) fields.governorate = "Choisis un gouvernorat.";
    if (name.length < 3 || name.length > 80) fields.name = "Le nom doit faire entre 3 et 80 caractères.";
    if (!["sleep", "eat", "do", "discover"].includes(b.category)) fields.category = "Choisis une rubrique.";
    if (description.length < 20 || description.length > 600) fields.description = "Décris le lieu en 20 à 600 caractères.";
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !inTunisia(lat, lng)) fields.location = "Place le lieu sur la carte : sa position doit être en Tunisie.";
    if (!Number.isFinite(price) || price < 0 || price > 2000) fields.price = "Le prix doit être entre 0 et 2000 DT.";
    const ig = normalizeSocial(b.instagram, "instagram"), fb = normalizeSocial(b.facebook, "facebook");
    if (!ig.ok) fields.instagram = "Entre un lien instagram.com ou un identifiant (@nom).";
    if (!fb.ok) fields.facebook = "Entre un lien facebook.com ou un identifiant de page.";
    if (ig.ok && fb.ok && !ig.value && !fb.value) fields.social = "Ajoute la page Instagram ou Facebook du lieu.";
    const image = b.image ? String(b.image) : null;
    if (image && !/^\/uploads\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(image)) fields.image = "Photo invalide.";
    if (Object.keys(fields).length) return res.status(400).json({ error: "Vérifie les champs du formulaire.", fields });

    const tags = (Array.isArray(b.tags) ? b.tags : []).filter((t) => TAGS.includes(t)).slice(0, 4);
    let slug = slugify(name), i = 2;
    while (db.prepare("SELECT 1 FROM places WHERE slug=?").get(slug)) slug = `${slugify(name)}-${i++}`;
    const id = db
      .prepare(`INSERT INTO places (slug,governorate_id,category,name,description,address,lat,lng,precision,price,tags,scene,image,instagram,facebook,is_gem,source,status,author_id)
                VALUES (?,?,?,?,?,?,?,?, 'exact', ?,?,?,?,?,?,1,'community','pending',?)`)
      .run(slug, gov.id, b.category, name, description, String(b.address || "").trim().slice(0, 160) || null, lat, lng, price,
        JSON.stringify(tags), { sleep: "hotel", eat: "food", do: "forest", discover: "medina" }[b.category], image, ig.value, fb.value, req.user.id).lastInsertRowid;
    res.status(201).json({ place: formatPlace(db.prepare(`${PLACE_SELECT} WHERE p.id=?`).get(id)), message: "Merci ! Ton lieu sera publié après validation par l’équipe." });
  });

  r.get("/community/mine", authRequired, (req, res) => {
    res.json(db.prepare(`${PLACE_SELECT} WHERE p.author_id=? AND p.source='community' ORDER BY p.id DESC`).all(req.user.id).map((p) => formatPlace(p)));
  });

  // ───── Classement des contributeurs : points + badges ─────
  r.get("/community/leaderboard", (_req, res) => {
    const rows = db
      .prepare(`SELECT u.id, u.name,
          (SELECT COUNT(*) FROM reviews r WHERE r.user_id=u.id AND r.hidden=0) reviews,
          (SELECT COUNT(*) FROM places p WHERE p.author_id=u.id AND p.source='community' AND p.status='approved') places,
          (SELECT COUNT(*) FROM programs pr WHERE pr.user_id=u.id AND pr.visibility='shared') programs,
          (SELECT COUNT(*) FROM place_photos ph WHERE ph.user_id=u.id) photos
        FROM users u WHERE u.role <> 'admin'`)
      .all()
      .map((u) => {
        const points = u.reviews * 5 + u.places * 20 + u.programs * 10 + u.photos * 3;
        const badges = [];
        if (u.places >= 1) badges.push("Chasseur de pépites");
        if (u.reviews >= 3) badges.push("Plume fidèle");
        if (u.programs >= 1) badges.push("Organisateur");
        return { ...u, points, badges };
      })
      .filter((u) => u.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
    res.json(rows);
  });

  // ───── Modération (rôle admin) ─────
  r.get("/admin/pending", adminRequired, (_req, res) => {
    res.json(db.prepare(`${PLACE_SELECT} WHERE p.status='pending' ORDER BY p.id`).all().map((p) => ({
      ...formatPlace(p), author: db.prepare("SELECT name,email FROM users WHERE id=?").get(p.author_id),
    })));
  });
  r.post("/admin/places/:id/:action", adminRequired, (req, res) => {
    const status = { approve: "approved", reject: "rejected" }[req.params.action];
    if (!status) return res.status(400).json({ error: "Action inconnue." });
    const info = db.prepare("UPDATE places SET status=? WHERE id=? AND source='community'").run(status, parseInt(req.params.id, 10));
    if (!info.changes) return res.status(404).json({ error: "Proposition introuvable." });
    res.json({ ok: true, status });
  });
  r.post("/admin/reviews/:id/hide", adminRequired, (req, res) => {
    db.prepare("UPDATE reviews SET hidden=1 WHERE id=?").run(parseInt(req.params.id, 10));
    res.json({ ok: true });
  });

  return r;
}
