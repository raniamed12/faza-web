import { Router } from "express";
import { checkPassword, dummyCheck, hashPassword, publicUser, rateLimit, signToken, authRequired, validateRegistration, EMAIL_RE } from "../auth.js";

export function authRoutes(db) {
  const r = Router();
  const limiter = rateLimit(15, 60_000);

  // POST /api/auth/register  { name, email, password }
  r.post("/register", limiter, (req, res) => {
    const { name, email, password } = req.body || {};
    const errors = validateRegistration({ name, email, password });
    if (Object.keys(errors).length) return res.status(400).json({ error: "Formulaire incomplet.", fields: errors });
    const mail = email.trim().toLowerCase();
    if (db.prepare("SELECT 1 FROM users WHERE email=?").get(mail))
      return res.status(409).json({ error: "Un compte existe déjà avec cet email.", fields: { email: "Cet email est déjà utilisé. Connecte-toi plutôt." } });
    const id = db.prepare("INSERT INTO users (name,email,password_hash) VALUES (?,?,?)").run(name.trim(), mail, hashPassword(password)).lastInsertRowid;
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(id);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  });

  // POST /api/auth/login  { email, password }
  r.post("/login", limiter, (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !EMAIL_RE.test(email.trim()))
      return res.status(400).json({ error: "Entre ton email et ton mot de passe." });
    const user = db.prepare("SELECT * FROM users WHERE email=?").get(email.trim().toLowerCase());
    const ok = user ? checkPassword(password, user.password_hash) : (dummyCheck(password), false);
    if (!ok) return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    res.json({ token: signToken(user), user: publicUser(user) });
  });

  // GET /api/auth/me
  r.get("/me", authRequired, (req, res) => res.json({ user: publicUser(req.user) }));

  return r;
}
