import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Program from "../components/Program.jsx";
import { useAuth, useFetch, useToast } from "../context.jsx";
import { api } from "../api.js";
import { TAG_LABEL } from "../lib/format.js";
import { PageHead } from "../components/deco.jsx";

const PREFS = ["nature", "culture", "gastronomie", "sport", "detente", "mer", "desert"];

export default function Mix() {
  const [sp] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const { data: govs } = useFetch("/governorates");
  const [f, setF] = useState({ governorate: sp.get("gov") || "tunis", budget: +sp.get("budget") || 150, days: 1, people: 2, prefs: (sp.get("prefs") || "").split(",").filter((x) => PREFS.includes(x)) });
  const [res, setRes] = useState(null);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null);

  useEffect(() => { if (sp.get("gov")) setF((x) => ({ ...x, governorate: sp.get("gov") })); }, [sp]);
  const up = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const togglePref = (p) => up("prefs", f.prefs.includes(p) ? f.prefs.filter((x) => x !== p) : [...f.prefs, p]);

  const generate = async (e) => {
    e?.preventDefault(); setBusy(true); setErrs({}); setSaved(null);
    try { setRes(await api.post("/mix", { ...f, budget: +f.budget, days: +f.days, people: +f.people, seed: Math.floor(Math.random() * 100000) })); }
    catch (x) { setErrs(x.fields || { form: x.message }); toast(x.message, { error: true }); }
    finally { setBusy(false); }
  };

  const replace = (idx, alt) => { if (!alt) return; setRes((r) => ({ ...r, items: r.items.map((it, i) => i === idx ? { ...it, place: alt, cost: alt.price, alternatives: it.alternatives.filter((a) => a.id !== alt.id).concat(it.place) } : it) })); };
  const remove = (idx) => setRes((r) => ({ ...r, items: r.items.filter((_, i) => i !== idx) }));

  const save = async (share) => {
    try {
      const { program } = await api.post("/programs", { title: res.title, governorate: res.governorate.slug, budget: res.budget, days: res.days, people: res.people, prefs: res.prefs, items: res.items.map((i) => ({ day: i.day, slot: i.slot, placeId: i.place.id, cost: i.cost })) });
      let p = program;
      if (share) p = (await api.patch(`/programs/${program.id}`, { visibility: "shared" })).program;
      setSaved(p); toast(share ? "Programme enregistré et partagé" : "Programme enregistré dans ton espace");
    } catch (x) { toast(x.message, { error: true }); }
  };
  const link = saved?.shareCode ? `${location.origin}/programme/${saved.shareCode}` : null;

  return (
    <>
    <PageHead tone="bleu" kicker="Le générateur de sorties" title="FAZA MIX" ar="ميكس"
      sub="Donne ton budget et tes envies : on compose un programme complet, matin, midi et soir. Pas d’IA, des règles claires et un budget respecté."
      side={<div className="mixbadge" aria-hidden="true"><b>0 DT</b><span>de dépassement</span><small>c’est la règle</small></div>} />
    <div className="wrap section mix">
      <div className="mix__grid">
        <form className="mixform" onSubmit={generate} noValidate>
          <label className="field"><span>Gouvernorat</span>
            <select className="input" value={f.governorate} onChange={(e) => up("governorate", e.target.value)}>{(govs || []).map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}</select>
            {errs.governorate && <small className="form-error">{errs.governorate}</small>}
          </label>
          <label className="field"><span>Budget par personne (DT)</span><input className="input" type="number" min="10" max="2000" value={f.budget} onChange={(e) => up("budget", e.target.value)} />{errs.budget && <small className="form-error">{errs.budget}</small>}</label>
          <div className="row2">
            <label className="field"><span>Durée</span><select className="input" value={f.days} onChange={(e) => up("days", e.target.value)}><option value="1">1 jour</option><option value="2">Week-end (2 jours)</option><option value="3">3 jours</option></select></label>
            <label className="field"><span>Personnes</span><input className="input" type="number" min="1" max="12" value={f.people} onChange={(e) => up("people", e.target.value)} />{errs.people && <small className="form-error">{errs.people}</small>}</label>
          </div>
          <fieldset className="field"><legend>Tes envies</legend>
            <div className="chips">{PREFS.map((p) => <button type="button" key={p} className="chip" aria-pressed={f.prefs.includes(p)} onClick={() => togglePref(p)}>{TAG_LABEL[p]}</button>)}</div>
          </fieldset>
          {errs.form && <p className="form-error" role="alert">{errs.form}</p>}
          <button className="btn btn--terra btn--block" disabled={busy}>{busy ? "On compose…" : res ? "Générer un autre programme" : "Générer mon programme"}</button>
        </form>

        <div aria-live="polite">
          {!res ? (
            <div className="mixempty">
              <div className="mixempty__ticket" aria-hidden="true">
                {["Matin", "Midi", "Après-midi", "Soir"].map((s, i) => <div key={s} style={{ "--d": `${i * 120}ms` }}><span>{s}</span><i /><b>?? DT</b></div>)}
              </div>
              <h3 className="h-sm">Ton programme apparaîtra ici</h3>
              <p className="muted">Choisis un gouvernorat, un budget et tes envies, puis lance la génération. Tu pourras ensuite remplacer chaque étape.</p>
            </div>
          ) : (
            <>
              <h2 className="h-md" style={{ marginBottom: ".4rem" }}>{res.title}</h2>
              {res.notes.map((n, i) => <p key={i} className="notice" style={{ marginBottom: ".6rem" }}>{n}</p>)}
              <p className="muted small" style={{ marginBottom: "1rem" }}>Les prix sont indicatifs. Remplace ou retire une étape : le total se met à jour.</p>
              <Program program={{ ...res, people: res.people }} editable onReplace={replace} onRemove={remove} />
              <div className="prog__actions">
                {user ? (<><button className="btn btn--dark" onClick={() => save(false)}>Enregistrer</button><button className="btn btn--ghost" onClick={() => save(true)}>Enregistrer et partager</button></>)
                  : <p className="notice"><Link className="link" to="/connexion" state={{ from: "/mix" }}>Connecte-toi</Link> pour enregistrer ou partager ce programme.</p>}
              </div>
              {link && <div className="notice" style={{ marginTop: ".8rem" }}>Lien à partager : <input className="input" readOnly value={link} onFocus={(e) => e.target.select()} /> <button className="btn btn--sm btn--dark" onClick={() => { navigator.clipboard?.writeText(link); toast("Lien copié"); }}>Copier</button></div>}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
