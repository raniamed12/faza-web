import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useToast } from "../context.jsx";
import Scene from "../components/Scene.jsx";
import { Zellige } from "../components/deco.jsx";

// Inscription / connexion : validation côté client (retour immédiat) ET côté serveur (sécurité).
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export default function Auth({ mode }) {
  const reg = mode === "register";
  const { login, register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const up = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const validate = () => {
    const e = {};
    if (reg && f.name.trim().length < 2) e.name = "Entre ton prénom (2 lettres minimum).";
    if (!emailRe.test(f.email)) e.email = "Adresse e-mail invalide.";
    if (reg) {
      if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = "8 caractères minimum, avec au moins une lettre et un chiffre.";
      if (f.confirm !== f.password) e.confirm = "Les deux mots de passe ne sont pas identiques.";
    } else if (!f.password) e.password = "Entre ton mot de passe.";
    return e;
  };
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(); setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const u = reg ? await register(f.name.trim(), f.email.trim(), f.password) : await login(f.email.trim(), f.password);
      toast(reg ? `Bienvenue ${u.name.split(" ")[0]} !` : `Content de te revoir ${u.name.split(" ")[0]}`);
      nav(loc.state?.from || "/", { replace: true });
    } catch (x) { setErrs({ ...(x.fields || {}), form: x.message }); } finally { setBusy(false); }
  };
  const E = ({ k }) => errs[k] ? <small className="form-error" role="alert">{errs[k]}</small> : null;

  return (
    <div className="wrap section authpage">
      <div className="authsplit">
      <aside className="authart" aria-hidden="true">
        <Scene type={reg ? "sea" : "medina"} seed={reg ? "inscription" : "connexion"} />
        <Zellige opacity={0.1} />
        <div className="authart__txt">
          <span className="ar" lang="ar">{reg ? "مرحبا بيك" : "أهلا بيك"}</span>
          <b>{reg ? "Marhba bik !" : "Ahla bik !"}</b>
          <ul>
            <li>♡ Garde tes adresses favorites</li>
            <li>✦ Enregistre et partage tes programmes</li>
            <li>📍 Propose tes secret spots</li>
          </ul>
        </div>
      </aside>
      <div className="authcard">
        <h1 className="h-lg">{reg ? "Rejoins FAZA" : "Content de te revoir"}</h1>
        <p className="muted" style={{ margin: ".4rem 0 1.4rem" }}>{reg ? "Un compte pour garder tes favoris, enregistrer tes programmes et proposer des lieux." : "Connecte-toi pour retrouver tes favoris et tes programmes."}</p>
        <form onSubmit={submit} noValidate>
          {reg && <label className="field"><span>Prénom</span><input className="input" autoComplete="given-name" value={f.name} onChange={(e) => up("name", e.target.value)} /><E k="name" /></label>}
          <label className="field"><span>E-mail</span><input className="input" type="email" autoComplete="email" value={f.email} onChange={(e) => up("email", e.target.value)} /><E k="email" /></label>
          <label className="field"><span>Mot de passe</span>
            <span className="pw"><input className="input" type={show ? "text" : "password"} autoComplete={reg ? "new-password" : "current-password"} value={f.password} onChange={(e) => up("password", e.target.value)} /><button type="button" onClick={() => setShow(!show)} aria-pressed={show}>{show ? "Masquer" : "Afficher"}</button></span>
            <E k="password" /></label>
          {reg && <label className="field"><span>Confirmer le mot de passe</span><input className="input" type={show ? "text" : "password"} autoComplete="new-password" value={f.confirm} onChange={(e) => up("confirm", e.target.value)} /><E k="confirm" /></label>}
          {errs.form && <p className="form-error" role="alert">{errs.form}</p>}
          <button className="btn btn--terra btn--block" disabled={busy}>{busy ? "Un instant…" : reg ? "Créer mon compte" : "Me connecter"}</button>
        </form>
        <p className="muted" style={{ marginTop: "1.2rem" }}>{reg ? <>Déjà inscrit ? <Link className="link" to="/connexion">Connexion</Link></> : <>Pas encore de compte ? <Link className="link" to="/inscription">Inscription</Link></>}</p>
      </div>
      </div>
    </div>
  );
}
