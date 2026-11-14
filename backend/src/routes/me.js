import crypto from "node:crypto";
import { Router } from "express";
import { authRequired } from "../auth.js";
import { PLACE_SELECT, formatPlace, favSet } from "../lib.js";
import { generateProgram, validateParams, SLOTS } from "../mix.js";

export function meRoutes(db) {
  const r = Router();

  // ───── FAVORIS ─────
  r.get("/favorites", authRequired, (req, res) => {
    const rows = db
      .prepare(`${PLACE_SELECT} JOIN favorites f ON f.place_id=p.id WHERE f.user_id=? AND p.status='approved' ORDER BY f.created_at DESC`)
      .all(req.user.id);
    res.json(rows.map((p) => formatPlace(p, favSet(db, req.user))));
  });
  r.put("/favorites/:placeId", authRequired, (req, res) => {
    const id = parseInt(req.params.placeId, 10);
    if (!db.prepare("SELECT 1 FROM places WHERE id=? AND status='approved'").get(id)) return res.status(404).json({ error: "Lieu introuvable." });
    db.prepare("INSERT OR IGNORE INTO favorites (user_id,place_id) VALUES (?,?)").run(req.user.id, id);
    res.json({ favorite: true });
  });
  r.delete("/favorites/:placeId", authRequired, (req, res) => {
    db.prepare("DELETE FROM favorites WHERE user_id=? AND place_id=?").run(req.user.id, parseInt(req.params.placeId, 10));
    res.json({ favorite: false });
  });

  // ───── FAZA MIX : génération (publique, ne sauvegarde rien) ─────
  r.post("/mix", (req, res) => {
    const body = req.body || {};
    const errors = validateParams(body);
    if (Object.keys(errors).length) return res.status(400).json({ error: "Vérifie les champs du formulaire.", fields: errors });
    try {
      res.json(generateProgram(db, body));
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message });
    }
  });

  // ───── PROGRAMMES ─────
  const loadProgram = (row, user) => {
    const items = db
      .prepare(`${PLACE_SELECT} JOIN program_items i ON i.place_id=p.id WHERE i.program_id=? ORDER BY i.day, i.position`)
      .all(row.id)
      .map((p) => p);
    const meta = db.prepare("SELECT day, slot, cost, position, place_id FROM program_items WHERE program_id=? ORDER BY day, position").all(row.id);
    const places = Object.fromEntries(items.map((p) => [p.id, formatPlace(p, favSet(db, user))]));
    const gov = db.prepare("SELECT slug,name,name_ar FROM governorates WHERE id=?").get(row.governorate_id);
    const owner = db.prepare("SELECT name FROM users WHERE id=?").get(row.user_id);
    const perPerson = meta.reduce((a, b) => a + b.cost, 0);
    return {
      id: row.id, title: row.title, budget: row.budget, days: row.days, people: row.participants,
      prefs: JSON.parse(row.prefs), visibility: row.visibility, shareCode: row.share_code, createdAt: row.created_at,
      governorate: { slug: gov.slug, name: gov.name, nameAr: gov.name_ar }, author: owner?.name,
      items: meta.map((m) => ({ day: m.day, slot: m.slot, cost: m.cost, place: places[m.place_id] })),
      perPerson, groupTotal: perPerson * row.participants, leftover: Math.round((row.budget - perPerson) * 10) / 10,
    };
  };

  r.get("/programs", authRequired, (req, res) => {
    const rows = db.prepare("SELECT * FROM programs WHERE user_id=? ORDER BY id DESC").all(req.user.id);
    res.json(rows.map((p) => loadProgram(p, req.user)));
  });

  // POST /api/programs  { title, governorate, budget, days, people, prefs, items:[{day,slot,placeId,cost}] }
  r.post("/programs", authRequired, (req, res) => {
    const b = req.body || {};
    const errors = validateParams(b);
    if (Object.keys(errors).length) return res.status(400).json({ error: "Programme invalide.", fields: errors });
    const gov = db.prepare("SELECT id FROM governorates WHERE slug=?").get(b.governorate);
    if (!gov) return res.status(400).json({ error: "Gouvernorat inconnu." });
    const items = Array.isArray(b.items) ? b.items : [];
    if (!items.length) return res.status(400).json({ error: "Ajoute au moins une étape à ton programme." });
    if (items.length > 40) return res.status(400).json({ error: "Trop d’étapes (40 maximum)." });
    const title = String(b.title || "Mon programme").trim().slice(0, 80) || "Mon programme";
    let id;
    db.transaction(() => {
      id = db
        .prepare("INSERT INTO programs (user_id,governorate_id,title,budget,days,participants,prefs) VALUES (?,?,?,?,?,?,?)")
        .run(req.user.id, gov.id, title, +b.budget, +b.days, +b.people, JSON.stringify(Array.isArray(b.prefs) ? b.prefs.slice(0, 7) : [])).lastInsertRowid;
      const ins = db.prepare("INSERT INTO program_items (program_id,place_id,day,slot,cost,position) VALUES (?,?,?,?,?,?)");
      items.forEach((it, i) => {
        const place = db.prepare("SELECT id,price FROM places WHERE id=? AND status='approved'").get(parseInt(it.placeId, 10));
        if (!place || !SLOTS[it.slot]) throw Object.assign(new Error("Étape invalide."), { status: 400 });
        ins.run(id, place.id, Math.min(3, Math.max(1, parseInt(it.day, 10) || 1)), it.slot, Math.max(0, +it.cost || place.price), i);
      });
    })();
    res.status(201).json({ program: loadProgram(db.prepare("SELECT * FROM programs WHERE id=?").get(id), req.user) });
  });

  r.get("/programs/shared/:code", (req, res) => {
    const row = db.prepare("SELECT * FROM programs WHERE share_code=? AND visibility='shared'").get(req.params.code);
    if (!row) return res.status(404).json({ error: "Ce programme n’est plus partagé." });
    res.json({ program: loadProgram(row, req.user) });
  });

  r.get("/programs/:id", authRequired, (req, res) => {
    const row = db.prepare("SELECT * FROM programs WHERE id=? AND user_id=?").get(parseInt(req.params.id, 10), req.user.id);
    if (!row) return res.status(404).json({ error: "Programme introuvable." });
    res.json({ program: loadProgram(row, req.user) });
  });

  // PATCH /api/programs/:id  { visibility: 'shared' | 'private', title? }
  r.patch("/programs/:id", authRequired, (req, res) => {
    const row = db.prepare("SELECT * FROM programs WHERE id=? AND user_id=?").get(parseInt(req.params.id, 10), req.user.id);
    if (!row) return res.status(404).json({ error: "Programme introuvable." });
    const { visibility, title } = req.body || {};
    if (visibility && !["shared", "private"].includes(visibility)) return res.status(400).json({ error: "Visibilité invalide." });
    const code = visibility === "shared" ? row.share_code || crypto.randomBytes(5).toString("hex") : row.share_code;
    db.prepare("UPDATE programs SET visibility=?, share_code=?, title=? WHERE id=?").run(visibility || row.visibility, code, title ? String(title).trim().slice(0, 80) : row.title, row.id);
    res.json({ program: loadProgram(db.prepare("SELECT * FROM programs WHERE id=?").get(row.id), req.user) });
  });

  r.delete("/programs/:id", authRequired, (req, res) => {
    db.prepare("DELETE FROM programs WHERE id=? AND user_id=?").run(parseInt(req.params.id, 10), req.user.id);
    res.json({ ok: true });
  });

  return r;
}
