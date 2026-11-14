import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TunisiaMap from "../components/TunisiaMap.jsx";
import Scene from "../components/Scene.jsx";
import { Marquee, Postcard, EventTicket, Zellige, DERJA } from "../components/deco.jsx";
import { useFetch } from "../context.jsx";
import { api } from "../api.js";
import { RUBRIQUES, NEWS, GEMS, SLOT_LABEL, dt } from "../lib/format.js";

// ───── L’élément fort de l’accueil : la carte vivante ─────
// Choisis une ambiance → les gouvernorats s’illuminent selon ce qu’ils offrent vraiment.
// Clique un gouvernorat → son « billet » s’ouvre. Le programme FAZA MIX se recalcule en direct.
const MOODS = [
  { id: "mer", label: "Mer & plage", ar: "بحر" },
  { id: "desert", label: "Désert", ar: "صحرا" },
  { id: "culture", label: "Culture", ar: "تاريخ" },
  { id: "nature", label: "Nature", ar: "طبيعة" },
  { id: "gastronomie", label: "Bonne table", ar: "ماكلة" },
  { id: "detente", label: "Détente", ar: "راحة" },
  { id: "sport", label: "Sport", ar: "رياضة" },
  { id: "fete", label: "Fêtes", ar: "فرحة" },
];

const DOORS = [
  { to: "/explorer?rub=sleep", name: "Win nbatou ?", ar: "وين نبيتو؟", fr: "Où dormir", color: "#17497A", studs: 9 },
  { to: "/benna", name: "Benna", ar: "بنّة", fr: "Où manger", color: "#D62839", studs: 9 },
  { to: "/explorer?rub=do", name: "Win nemchiw ?", ar: "وين نمشيو؟", fr: "Que faire", color: "#C65D3B", studs: 9 },
  { to: "/explorer?rub=discover", name: "Lakta", ar: "لقطة", fr: "Que découvrir", color: "#0E2F4F", studs: 9 },
  { to: "/jaw-tounsna", name: "Jaw Tounsna", ar: "جو تونسنا", fr: "Quoi de neuf", color: "#2F6B55", studs: 9 },
  { to: "/explorer?gem=1", name: "Blayes mkhabbya", ar: "بلايص مخبّية", fr: "Les pépites", color: "#8B5A2B", studs: 9 },
];

export default function Home() {
  const nav = useNavigate();
  const { data: govs } = useFetch("/governorates");
  const { data: events } = useFetch("/events");
  const { data: gems } = useFetch("/places?gem=1&limit=6");
  const [mood, setMood] = useState("mer");
  const [sel, setSel] = useState(null);
  const [hov, setHov] = useState(null);
  const [tip, setTip] = useState(null);
  const [spin, setSpin] = useState(null);
  const mapBox = useRef(null);

  const values = useMemo(() => {
    if (!govs) return null;
    const max = Math.max(1, ...govs.map((g) => g.affinity[mood] || 0));
    return Object.fromEntries(govs.map((g) => [g.slug, (g.affinity[mood] || 0) / max]));
  }, [govs, mood]);
  const bySlug = useMemo(() => Object.fromEntries((govs || []).map((g) => [g.slug, g])), [govs]);

  // Gouvernorat par défaut : le plus « chaud » pour l’ambiance choisie.
  const best = useMemo(() => (govs ? [...govs].sort((a, b) => (b.affinity[mood] || 0) - (a.affinity[mood] || 0))[0]?.slug : null), [govs, mood]);
  const current = sel || best;
  const gov = bySlug[current];

  const surprise = () => {
    if (!govs) return;
    const pool = govs.filter((g) => (g.affinity[mood] || 0) > 0);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    let i = 0;
    const seq = [...Array(9)].map(() => govs[Math.floor(Math.random() * govs.length)].slug).concat(pick.slug);
    const t = setInterval(() => { setSpin(seq[i]); if (++i >= seq.length) { clearInterval(t); setSpin(null); setSel(pick.slug); } }, 110);
  };

  const onHover = (slug, e) => {
    setHov(slug);
    if (!slug || !mapBox.current || !e?.clientX) return setTip(null);
    const r = mapBox.current.getBoundingClientRect();
    setTip({ slug, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__txt">
            <p className="hero__def"><span className="ar" lang="ar">فازة</span> <b>fazza</b> <i>n. f.</i> — la vibe du moment, l’envie soudaine de bouger.</p>
            <h1 className="h-xl">La Tunisie <span className="hero__nw">à ta façon.</span></h1>
            <p className="lead">Dis-nous l’ambiance du moment : la carte s’allume là où elle t’attend. Puis clique, on s’occupe du reste.</p>

            <div className="moods" role="group" aria-label="Choisis une ambiance">
              {MOODS.map((m) => (
                <button key={m.id} className="mood" aria-pressed={mood === m.id} onClick={() => { setMood(m.id); setSel(null); }}>
                  {m.label}<span className="ar" lang="ar">{m.ar}</span>
                </button>
              ))}
            </div>

            <div className="hero__cta">
              <button className="btn btn--terra" onClick={surprise}>🎲 Surprends-moi</button>
              <Link className="btn btn--ghost on-dark" to="/mix">Créer mon programme</Link>
            </div>
          </div>

          <div className="hero__map" ref={mapBox}>
            <TunisiaMap values={values} selected={spin || current} hovered={hov} onSelect={(s) => setSel(s)} onHover={onHover} labels dimOthers />
            {tip && bySlug[tip.slug] && (
              <div className="maptip" style={{ left: tip.x, top: tip.y }}>
                <strong>{bySlug[tip.slug].name}</strong> <span className="ar" lang="ar">{bySlug[tip.slug].nameAr}</span>
                <small>{bySlug[tip.slug].total} lieux · {bySlug[tip.slug].events} événements</small>
              </div>
            )}
            <div className="legend" aria-hidden="true"><span>moins</span><i /><span>plus d’idées « {MOODS.find((m) => m.id === mood).label.toLowerCase()} »</span></div>
          </div>

          {gov && (
            <aside className="ticket" aria-live="polite">
              <div className="ticket__scene"><Scene type={gov.scene} seed={gov.slug} /></div>
              <div className="ticket__body">
                <p className="ticket__reg">{gov.region}</p>
                <h2 className="h-md">{gov.name} <span className="ar" lang="ar">{gov.nameAr}</span></h2>
                <p className="muted">{gov.tagline}</p>
                <ul className="ticket__counts">
                  {RUBRIQUES.map((r) => <li key={r.id}><b>{gov.counts[r.id]}</b> {r.fr.toLowerCase()}</li>)}
                  <li><b>{gov.events}</b> événements</li>
                </ul>
                <Link className="btn btn--dark btn--block" to={`/gouvernorat/${gov.slug}`}>Ouvrir {gov.name}</Link>
              </div>
            </aside>
          )}
        </div>
      </section>

      <Marquee />

      <section className="section doors-sec">
        <div className="wrap">
          {govs && <Stats govs={govs} />}
          <div className="section__head">
            <div><p className="eyebrow">Les rubriques</p><h2 className="h-lg">Pousse une porte</h2><p className="muted" style={{ marginTop: ".4rem" }}>Six portes, six façons de découvrir le pays. Chaque porte s’ouvre sur une rubrique.</p></div>
          </div>
          <div className="doors">
            {DOORS.map((d, i) => (
              <Link key={d.to} to={d.to} className="door" style={{ "--c": d.color, "--d": `${i * 70}ms` }}>
                <span className="door__arch">
                  <span className="door__studs">{Array.from({ length: 24 }).map((_, k) => <i key={k} />)}</span>
                  <span className="door__ar ar" lang="ar">{d.ar}</span>
                </span>
                <span className="door__name">{d.name}</span>
                <span className="door__fr">{d.fr}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MixTeaser gov={gov} mood={mood} />

      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <div><p className="eyebrow">Agenda</p><h2 className="h-lg">{NEWS.name} <span className="ar" lang="ar">{NEWS.ar}</span></h2><p className="muted">Les prochains rendez-vous. Dates indicatives : on vérifie avant de partir.</p></div>
            <Link className="btn btn--ghost" to="/jaw-tounsna">Tout voir</Link>
          </div>
          <div className="evgrid evgrid--t">
            {(events || []).slice(0, 4).map((e) => <EventTicket key={e.id} e={e} to="/jaw-tounsna" compact />)}
          </div>
        </div>
      </section>

      <section className="section gems">
        <div className="wrap">
          <div className="section__head">
            <div><p className="eyebrow">Cartes postales</p><h2 className="h-lg">{GEMS.name} <span className="ar" lang="ar">{GEMS.ar}</span></h2><p className="muted">Les adresses que les guides oublient, envoyées comme des cartes postales.</p></div>
            <Link className="btn btn--ghost" to="/explorer?gem=1">Toutes les pépites</Link>
          </div>
          <div className="postcards">{(gems || []).slice(0, 3).map((p, i) => <Postcard key={p.id} place={p} i={i} />)}</div>
        </div>
      </section>

      <Dico />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="callout">
            <Zellige opacity={0.14} />
            <span className="callout__ar ar" lang="ar" aria-hidden="true">بلاصة</span>
            <div>
              <h2 className="h-lg">T’as une blassa mkhabbya ?</h2>
              <p>Un café caché dans la médina, une crique sans touristes, un resto où la ojja est parfaite : partage-la. L’équipe vérifie, la communauté te remercie (et tu gagnes 20 points).</p>
            </div>
            <Link className="btn" to="/communaute/proposer">Proposer une adresse</Link>
          </div>
        </div>
      </section>
    </>
  );
}

// Aperçu du moteur FAZA MIX : budget → programme recalculé en direct pour le gouvernorat affiché sur la carte.
function MixTeaser({ gov, mood }) {
  const [budget, setBudget] = useState(120);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    if (!gov) return;
    const t = setTimeout(() => {
      api.post("/mix", { governorate: gov.slug, budget, days: 1, people: 2, prefs: mood === "fete" ? [] : [mood], seed: 7 })
        .then((r) => { setRes(r); setErr(null); }).catch((e) => setErr(e));
    }, 250);
    return () => clearTimeout(t);
  }, [gov, budget, mood]);
  return (
    <section className="section teaser">
      <div className="wrap teaser__grid">
        <div>
          <h2 className="h-lg">Ton budget, notre plan</h2>
          <p className="lead">Une journée à <b>{gov?.name || "…"}</b>. Bouge le curseur : le programme se recalcule, sans dépasser ton budget.</p>
          <label className="range">
            <span>Budget par personne : <b>{budget} DT</b></span>
            <input type="range" min="30" max="400" step="10" value={budget} onChange={(e) => setBudget(+e.target.value)} />
          </label>
          <Link className="btn btn--terra" to={`/mix?gov=${gov?.slug || ""}&budget=${budget}&prefs=${mood}`}>Personnaliser ce programme</Link>
        </div>
        <ol className="tl tl--mini" aria-live="polite">
          {err && <li className="empty">{err.message}</li>}
          {res?.items.map((it, i) => (
            <li key={i} className="tl__it">
              <span className="tl__slot">{SLOT_LABEL[it.slot]}</span>
              <span className="tl__name">{it.place.name}</span>
              <span className="tl__cost">{dt(it.cost)}</span>
            </li>
          ))}
          {res && <li className="tl__tot"><span>Total par personne</span><b>{dt(res.perPerson)}</b></li>}
        </ol>
      </div>
    </section>
  );
}

// Quelques chiffres, calculés à partir des vraies données de l’API.
function Stats({ govs }) {
  const places = govs.reduce((a, g) => a + g.total, 0);
  const events = govs.reduce((a, g) => a + g.events, 0);
  const regions = new Set(govs.map((g) => g.region)).size;
  return (
    <div className="stats" style={{ marginBottom: "3.5rem" }}>
      <div><b>{govs.length}</b><span>gouvernorats</span><small>du Cap Bon au Sahara</small></div>
      <div><b>{places}</b><span>adresses</span><small>avec leur position sur la carte</small></div>
      <div><b>{events}</b><span>rendez-vous</span><small>festivals, marchés, randos</small></div>
      <div><b>{regions}</b><span>régions</span><small>et autant d’accents</small></div>
    </div>
  );
}

// Le petit dico de la derja : chaque carte se retourne pour montrer le sens et un exemple.
const DICO_COLORS = ["#17497A", "#D62839", "#C65D3B", "#0E2F4F", "#2F6B55", "#8B5A2B", "#2B6AA3", "#A44A2D"];
function Dico() {
  const [on, setOn] = useState(null);
  return (
    <section className="section doors-sec">
      <div className="wrap">
        <div className="section__head">
          <div><p className="eyebrow">Parle comme nous</p><h2 className="h-lg">Le petit dico de la derja</h2><p className="muted" style={{ marginTop: ".4rem" }}>Les mots de FAZA, en tunisien. Survole (ou touche) une carte pour la retourner.</p></div>
        </div>
        <div className="dico">
          {DERJA.map((d, i) => (
            <button key={d.w} className="dcard" style={{ "--c": DICO_COLORS[i] }} aria-pressed={on === i} onClick={() => setOn(on === i ? null : i)} aria-label={`${d.w} : ${d.fr}`}>
              <span className="dcard__in">
                <span className="dcard__f"><Zellige opacity={0.12} size={48} /><span className="ar" lang="ar">{d.ar}</span><span><b>{d.w}</b><br /><small>retourne-moi ↻</small></span></span>
                <span className="dcard__b"><p>{d.fr}</p><em>{d.ex}</em></span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
