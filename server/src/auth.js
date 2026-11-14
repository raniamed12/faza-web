import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "faza-dev-secret-a-changer";
if (!process.env.JWT_SECRET) {
  console.warn("⚠  JWT_SECRET non défini : un secret de développement est utilisé. Définissez-le avant toute mise en ligne.");
}

export const hashPassword = (pw) => bcrypt.hashSync(pw, 10);
export const checkPassword = (pw, hash) => bcrypt.compareSync(pw, hash);
// Hash factice : on compare toujours un mot de passe, même si l’email est inconnu (évite de révéler quels emails existent).
const DUMMY_HASH = bcrypt.hashSync("faza-dummy", 10);
export const dummyCheck = (pw) => bcrypt.compareSync(pw, DUMMY_HASH);

export const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });

export const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.created_at });

function readToken(req) {
  const h = req.headers.authorization || "";
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Charge req.user si un jeton valide est fourni (sinon continue sans utilisateur).
export const authOptional = (db) => (req, _res, next) => {
  const payload = readToken(req);
  if (payload) req.user = db.prepare("SELECT id,name,email,role,created_at FROM users WHERE id=?").get(payload.id) || null;
  next();
};

export const authRequired = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Connecte-toi pour continuer." });
  next();
};

export const adminRequired = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Connecte-toi pour continuer." });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Réservé à l’équipe FAZA." });
  next();
};

// Limiteur très simple (en mémoire) : N requêtes par minute et par IP.
export function rateLimit(max = 10, windowMs = 60_000) {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) return res.status(429).json({ error: "Trop de tentatives. Réessaie dans une minute." });
    arr.push(now);
    hits.set(key, arr);
    next();
  };
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateRegistration({ name, email, password }) {
  const errors = {};
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) errors.name = "Ton prénom doit faire entre 2 et 60 caractères.";
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) errors.email = "Cette adresse email n’est pas valide.";
  if (typeof password !== "string" || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
    errors.password = "Le mot de passe doit contenir au moins 8 caractères, avec une lettre et un chiffre.";
  return errors;
}
