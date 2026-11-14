import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openDb, UPLOAD_DIR } from "./db.js";
import { seed } from "./seed.js";
import { authOptional } from "./auth.js";
import { authRoutes } from "./routes/auth.js";
import { catalogRoutes } from "./routes/catalog.js";
import { meRoutes } from "./routes/me.js";
import { communityRoutes } from "./routes/community.js";

export function createApp(db) {
  const app = express();
  app.set("trust proxy", 1);
  app.use(cors());
  app.use(express.json({ limit: "6mb" }));
  app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));
  app.use("/api", authOptional(db));
  app.get("/api/health", (_req, res) => res.json({ ok: true, name: "FAZA API" }));
  app.use("/api/auth", authRoutes(db));
  app.use("/api", catalogRoutes(db));
  app.use("/api", meRoutes(db));
  app.use("/api", communityRoutes(db));

  app.use("/api", (_req, res) => res.status(404).json({ error: "Route introuvable." }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.too.large") return res.status(413).json({ error: "Fichier trop volumineux." });
    if (err instanceof SyntaxError) return res.status(400).json({ error: "JSON invalide." });
    console.error(err);
    res.status(500).json({ error: "Erreur du serveur." });
  });
  return app;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const db = openDb();
  if (seed(db)) console.log("Base de données créée et remplie (24 gouvernorats, lieux, événements, Benna).");
  const port = process.env.PORT || 4000;
  createApp(db).listen(port, () => console.log(`API FAZA sur http://localhost:${port}`));
}
