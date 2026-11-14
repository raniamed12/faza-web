import bcrypt from "bcryptjs";
import { GOVERNORATES } from "./data/governorates.js";
import { PLACES, TEAM_GEMS } from "./data/places.js";
import { EVENTS, CHALLENGES } from "./data/events.js";
import { DISHES, MENU, SPOTS } from "./data/benna.js";
import { openDb, migrate } from "./db.js";

export const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const TABLES = ["program_items", "programs", "place_photos", "reviews", "favorites", "events", "menu_items", "place_dishes", "dishes", "places", "challenges", "governorates", "users"];

export function seed(db, { reset = false } = {}) {
  migrate(db);
  if (reset) {
    db.pragma("foreign_keys = OFF");
    for (const t of TABLES) db.exec(`DELETE FROM ${t}`);
    db.exec("DELETE FROM sqlite_sequence");
    db.pragma("foreign_keys = ON");
  }
  if (db.prepare("SELECT COUNT(*) n FROM governorates").get().n > 0) return false;

  const tx = db.transaction(() => {
    // Compte administrateur de démonstration (à changer via ADMIN_EMAIL / ADMIN_PASSWORD).
    const adminEmail = process.env.ADMIN_EMAIL || "admin@faza.tn";
    const adminPass = process.env.ADMIN_PASSWORD || "Faza2026!";
    const adminId = db
      .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?, 'admin')")
      .run("Équipe FAZA", adminEmail, bcrypt.hashSync(adminPass, 10)).lastInsertRowid;

    const insGov = db.prepare("INSERT INTO governorates (slug,name,name_ar,region,lat,lng,tagline,scene) VALUES (?,?,?,?,?,?,?,?)");
    const govId = {};
    for (const g of GOVERNORATES) govId[g.slug] = insGov.run(g.slug, g.name, g.ar, g.region, g.center[0], g.center[1], g.tagline, g.scene).lastInsertRowid;

    const insPlace = db.prepare(`INSERT INTO places
      (slug,governorate_id,category,name,description,address,lat,lng,precision,price,tags,scene,hours,closed_day,price_factor,palette,map_x,map_y,is_gem,source,status,author_id)
      VALUES (@slug,@governorate_id,@category,@name,@description,@address,@lat,@lng,@precision,@price,@tags,@scene,@hours,@closed_day,@price_factor,@palette,@map_x,@map_y,@is_gem,@source,'approved',@author_id)`);

    const used = new Set();
    const uniq = (base) => { let s = base, i = 2; while (used.has(s)) s = `${base}-${i++}`; used.add(s); return s; };

    const gemNames = new Set(TEAM_GEMS);
    for (const [gov, category, name, description, tags, price, lat, lng, precision, scene] of PLACES) {
      insPlace.run({
        slug: uniq(slugify(name)), governorate_id: govId[gov], category, name, description, address: null,
        lat, lng, precision, price, tags: JSON.stringify(tags), scene, hours: null, closed_day: -1,
        price_factor: null, palette: null, map_x: null, map_y: null,
        is_gem: gemNames.has(name) ? 1 : 0, source: "team", author_id: adminId,
      });
    }

    // Benna : plats, menus et lieux
    const insDish = db.prepare("INSERT INTO dishes (id,name,emoji,color,page) VALUES (?,?,?,?,?)");
    const insMenu = db.prepare("INSERT INTO menu_items (dish_id,name,price) VALUES (?,?,?)");
    for (const d of DISHES) {
      insDish.run(d.id, d.name, d.emoji, d.color, d.page);
      for (const [n, p] of MENU[d.id] || []) insMenu.run(d.id, n, p);
    }
    const insPD = db.prepare("INSERT INTO place_dishes (place_id,dish_id) VALUES (?,?)");
    for (const s of SPOTS) {
      const base = s.sp.map((id) => MENU[id][0][1]);
      const avg = base.reduce((a, b) => a + b, 0) / base.length;
      const info = insPlace.run({
        slug: s.id, governorate_id: govId[s.gov], category: "eat", name: s.name,
        description: s.v, address: s.ad, lat: s.lat, lng: s.lng, precision: "quartier",
        price: Math.max(2, Math.round(avg * s.pf)), tags: JSON.stringify(["gastronomie", "detente"]), scene: "food",
        hours: s.h, closed_day: s.off, price_factor: s.pf, palette: JSON.stringify(s.pal),
        map_x: s.x, map_y: s.y, is_gem: 0, source: "demo", author_id: adminId,
      });
      for (const d of s.sp) insPD.run(info.lastInsertRowid, d);
    }

    const insEvent = db.prepare(`INSERT INTO events (slug,governorate_id,title,category,description,start_date,end_date,confirmed,price,venue,scene)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    for (const [gov, title, cat, start, end, conf, price, venue, desc, scene] of EVENTS)
      insEvent.run(uniq(slugify(title)), govId[gov], title, cat, desc, start, end, conf, price, venue, scene);

    const insCh = db.prepare("INSERT INTO challenges (title,description,points,badge) VALUES (?,?,?,?)");
    for (const c of CHALLENGES) insCh.run(...c);
  });
  tx();
  return true;
}

// `npm run seed` : repart d’une base vide.
if (import.meta.url === `file://${process.argv[1]}`) {
  const db = openDb();
  seed(db, { reset: true });
  console.log("Base FAZA réinitialisée et remplie.");
}
