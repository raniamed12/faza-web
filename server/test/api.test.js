// Tests de l’API : `npm test` dans le dossier server/
import test from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../src/db.js";
import { seed } from "../src/seed.js";
import { createApp } from "../src/index.js";

const db = openDb(":memory:");
seed(db);
const server = createApp(db).listen(0);
const base = `http://127.0.0.1:${server.address().port}/api`;
test.after(() => server.close());

const call = async (method, path, body, token) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
};

let token, adminToken;

test("catalogue : 24 gouvernorats", async () => {
  const { status, data } = await call("GET", "/governorates");
  assert.equal(status, 200);
  assert.equal(data.length, 24);
  assert.ok(data.every((g) => g.total > 0), "chaque gouvernorat a au moins un lieu");
});

test("inscription : validation et doublon", async () => {
  let r = await call("POST", "/auth/register", { name: "R", email: "pas-un-email", password: "abc" });
  assert.equal(r.status, 400);
  assert.ok(r.data.fields.name && r.data.fields.email && r.data.fields.password);
  r = await call("POST", "/auth/register", { name: "Rania", email: "rania@test.tn", password: "Motdepasse1" });
  assert.equal(r.status, 201);
  assert.ok(r.data.token);
  assert.equal(r.data.user.password_hash, undefined, "le hash ne doit jamais sortir");
  token = r.data.token;
  r = await call("POST", "/auth/register", { name: "Rania", email: "RANIA@test.tn", password: "Motdepasse1" });
  assert.equal(r.status, 409);
});

test("connexion : bon et mauvais mot de passe", async () => {
  let r = await call("POST", "/auth/login", { email: "rania@test.tn", password: "faux-mdp-1" });
  assert.equal(r.status, 401);
  r = await call("POST", "/auth/login", { email: "inconnu@test.tn", password: "Motdepasse1" });
  assert.equal(r.status, 401);
  r = await call("POST", "/auth/login", { email: "rania@test.tn", password: "Motdepasse1" });
  assert.equal(r.status, 200);
  token = r.data.token;
  r = await call("GET", "/auth/me", null, token);
  assert.equal(r.data.user.email, "rania@test.tn");
  r = await call("GET", "/auth/me");
  assert.equal(r.status, 401);
});

test("FAZA MIX : respecte le budget et couvre les créneaux", async () => {
  const { status, data } = await call("POST", "/mix", { governorate: "tozeur", budget: 150, days: 2, people: 4, prefs: ["desert", "nature"], seed: 7 });
  assert.equal(status, 200);
  assert.ok(data.perPerson <= 150, `total ${data.perPerson} > budget`);
  assert.ok(data.items.some((i) => i.slot === "nuit"), "un week-end contient une nuit");
  assert.equal(data.items.filter((i) => i.slot === "midi").length, 2);
  const again = await call("POST", "/mix", { governorate: "tozeur", budget: 150, days: 2, people: 4, prefs: ["desert", "nature"], seed: 7 });
  assert.deepEqual(again.data.items.map((i) => i.place.id), data.items.map((i) => i.place.id), "même graine = même programme");
  const bad = await call("POST", "/mix", { governorate: "tozeur", budget: 2, days: 9, people: 0 });
  assert.equal(bad.status, 400);
});

test("favoris et programmes", async () => {
  const places = (await call("GET", "/places?gov=tunis&category=discover")).data;
  let r = await call("PUT", `/favorites/${places[0].id}`);
  assert.equal(r.status, 401);
  r = await call("PUT", `/favorites/${places[0].id}`, null, token);
  assert.equal(r.status, 200);
  r = await call("GET", "/favorites", null, token);
  assert.equal(r.data.length, 1);

  const mix = (await call("POST", "/mix", { governorate: "tunis", budget: 80, days: 1, people: 2, seed: 3 })).data;
  r = await call("POST", "/programs", { title: "Ma journée", governorate: "tunis", budget: 80, days: 1, people: 2, items: mix.items.map((i) => ({ day: i.day, slot: i.slot, placeId: i.place.id, cost: i.cost })) }, token);
  assert.equal(r.status, 201);
  const id = r.data.program.id;
  r = await call("PATCH", `/programs/${id}`, { visibility: "shared" }, token);
  const code = r.data.program.shareCode;
  assert.ok(code);
  r = await call("GET", `/programs/shared/${code}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.program.title, "Ma journée");
});

test("avis : connexion obligatoire, note 1–5", async () => {
  let r = await call("POST", "/places/medina-de-tunis/reviews", { rating: 5, text: "Magnifique matinée." });
  assert.equal(r.status, 401);
  r = await call("POST", "/places/medina-de-tunis/reviews", { rating: 9, text: "Magnifique matinée." }, token);
  assert.equal(r.status, 400);
  r = await call("POST", "/places/medina-de-tunis/reviews", { rating: 5, text: "Magnifique matinée." }, token);
  assert.equal(r.status, 201);
  r = await call("GET", "/places/medina-de-tunis");
  assert.equal(r.data.reviews.length, 1);
  assert.equal(r.data.place.rating, 5);
});

test("communauté : lieu en attente, validé par l’admin", async () => {
  const body = { name: "Café des Arcades", governorate: "tunis", category: "eat", description: "Un petit café caché sous les arcades de la médina, très calme le matin.", lat: 36.8, lng: 10.17, instagram: "@cafedesarcades", price: 6 };
  let r = await call("POST", "/community/places", { ...body, lat: 10, lng: 10 }, token);
  assert.equal(r.status, 400);
  assert.ok(r.data.fields.location);
  r = await call("POST", "/community/places", { ...body, instagram: "", facebook: "" }, token);
  assert.ok(r.data.fields.social, "Instagram ou Facebook obligatoire");
  r = await call("POST", "/community/places", { ...body, instagram: "https://evil.example/x" }, token);
  assert.ok(r.data.fields.instagram, "domaine non autorisé");
  r = await call("POST", "/community/places", body, token);
  assert.equal(r.status, 201);
  assert.equal(r.data.place.instagram, "https://www.instagram.com/cafedesarcades");
  const slug = r.data.place.slug, id = r.data.place.id;
  assert.equal((await call("GET", `/places/${slug}`)).status, 404, "invisible tant que non validé");
  assert.equal((await call("GET", "/admin/pending", null, token)).status, 403, "réservé aux admins");
  const login = await call("POST", "/auth/login", { email: "admin@faza.tn", password: "Faza2026!" });
  adminToken = login.data.token;
  assert.equal((await call("GET", "/admin/pending", null, adminToken)).data.length, 1);
  assert.equal((await call("POST", `/admin/places/${id}/approve`, null, adminToken)).status, 200);
  assert.equal((await call("GET", `/places/${slug}`)).status, 200);
});

test("Benna : plats, menus et lieux", async () => {
  const { data } = await call("GET", "/benna");
  assert.equal(data.dishes.length, 24);
  assert.equal(data.spots.length, 16);
  assert.ok(data.dishes.find((d) => d.id === "fricasse").menu.length >= 2);
});
