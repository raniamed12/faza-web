import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useFetch } from "../context.jsx";
import { Loading, ErrorBox, SocialLinks, Stars } from "../components/common.jsx";
import { TUNIS_MAP_SVG } from "./tunisMap.js";
import IMG from "../data/dishImages.json";
import { dt } from "../lib/format.js";

// ───── BENNA (بنّة) : le carnet gourmand de FAZA ─────
// Un carnet de collage (plats = autocollants, 6 pages) + un plan de Tunis dessiné à la main.
// Toucher un plat filtre les adresses ; toucher une épingle ouvre la fiche (menu, photos, avis, infos).
const PAGE_TITLES = ["Cafés & douceurs", "Sucré", "Cuisine du monde", "Brunch & boissons", "Street-food tunisienne", "À la tunisienne"];
const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function status(h, off, now = new Date()) {
  const [a, b] = h.split("-"), m = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  const open = m(a), close = m(b) <= m(a) ? m(b) + 1440 : m(b);
  let cur = now.getHours() * 60 + now.getMinutes(), day = now.getDay();
  if (cur < open && close > 1440) { cur += 1440; day = (day + 6) % 7; } // après minuit
  const ok = day !== off && cur >= open && cur < close;
  const hhmm = (x) => `${String(Math.floor((x % 1440) / 60)).padStart(2, "0")}h${String(x % 60).padStart(2, "0")}`;
  return { open: ok, text: ok ? `Ouvert · ferme à ${hhmm(close)}` : `Fermé · ouvre à ${hhmm(open)}`, off };
}

export default function Benna() {
  const { data, loading, error } = useFetch("/benna");
  const nav = useNavigate();
  const loc = useLocation();
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const [dish, setDish] = useState(null);
  const [view, setView] = useState("carnet"); // mobile : carnet | carte
  const slug = loc.pathname.split("/")[2] === "lieu" ? loc.pathname.split("/")[3] : null;
  const spotsAll = data?.spots || [];
  const spots = useMemo(() => (dish ? spotsAll.filter((s) => s.dishes.includes(dish)) : spotsAll), [dish, spotsAll]);
  const open = spotsAll.find((s) => s.slug === slug);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const pages = [1, 2, 3, 4, 5, 6].map((n) => data.dishes.filter((d) => d.page === n));
  const go = (n) => { setDir(n > page ? 1 : -1); setPage(Math.max(0, Math.min(5, n))); };
  const pick = (id) => { setDish(dish === id ? null : id); setView("carte"); nav("/benna"); };

  return (
    <div className="benna" data-view={view}>
      <div className="benna__tabs" role="tablist">
        <button role="tab" aria-selected={view === "carnet"} onClick={() => setView("carnet")}>Carnet</button>
        <button role="tab" aria-selected={view === "carte"} onClick={() => setView("carte")}>Plan{dish ? ` · ${data.dishes.find((d) => d.id === dish)?.name}` : ""}</button>
      </div>

      <section className="book" aria-label="Carnet Benna">
        <header className="book__head">
          <h1 className="sticker-title">Benna <span className="ar" lang="ar">بنّة</span></h1>
          <p>Le carnet gourmand de Tunis. Touche un plat pour voir qui le sert.</p>
        </header>
        <div className="paper" key={page} data-dir={dir}>
          <h2 className="paper__t">{PAGE_TITLES[page]}</h2>
          <div className="stickers">
            {pages[page].map((d, i) => (
              <button key={d.id} className={`stk ${dish === d.id ? "is-on" : ""}`} style={{ "--c": d.color, "--r": `${((i * 37) % 9) - 4}deg` }} onClick={() => pick(d.id)} aria-pressed={dish === d.id}>
                <span className="tape" />
                <span className="stk__img">{IMG[d.id] ? <img src={IMG[d.id]} alt="" loading="lazy" /> : <span className="stk__em">{d.emoji}</span>}</span>
                <span className="stk__n">{d.name}</span>
                <span className="stk__p">dès {dt(Math.min(...d.menu.map((m) => m[1])))}</span>
              </button>
            ))}
          </div>
          <footer className="paper__nav">
            <button className="btn btn--ghost btn--sm" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Page précédente">‹</button>
            <span className="dots">{pages.map((_, i) => <button key={i} className={i === page ? "on" : ""} onClick={() => go(i)} aria-label={`Page ${i + 1}`} />)}</span>
            <button className="btn btn--ghost btn--sm" onClick={() => go(page + 1)} disabled={page === 5} aria-label="Page suivante">›</button>
          </footer>
        </div>
        {dish && <button className="btn btn--dark btn--sm clear" onClick={() => setDish(null)}>Voir toutes les adresses ✕</button>}
        <p className="book__note">Adresses de démonstration : remplace-les par de vrais lieux (voir README).</p>
      </section>

      <section className="plan" aria-label="Plan de Tunis">
        <PlanMap spots={spots} active={open?.slug} onOpen={(s) => nav(`/benna/lieu/${s.slug}`)} />
        <ul className="plan__list">
          {spots.map((s) => { const st = status(s.hours, s.closedDay ?? -1); return (
            <li key={s.id}><button className="scard" onClick={() => nav(`/benna/lieu/${s.slug}`)} style={{ "--a": s.palette?.[0], "--b": s.palette?.[1] }}>
              <span className="scard__th">{s.name[0]}</span><span><b>{s.name}</b><small>{s.address?.split(",").pop()} · <i className={st.open ? "ok" : "ko"}>{st.open ? "ouvert" : "fermé"}</i></small></span></button></li>); })}
          {!spots.length && <li className="muted">Aucune adresse pour ce plat.</li>}
        </ul>
        {open && <SpotSheet spot={open} dishes={data.dishes} onClose={() => nav("/benna")} />}
      </section>
    </div>
  );
}

// Plan de Tunis : glisser pour déplacer, molette / boutons pour zoomer.
function PlanMap({ spots, active, onOpen }) {
  const ref = useRef(null);
  const [vb, setVb] = useState({ x: 380, y: 80, w: 920, h: 700 });
  const drag = useRef(null);
  const [hot, setHot] = useState(null);
  const zoom = (f, cx = 0.5, cy = 0.5) => setVb((v) => { const w = Math.min(1900, Math.max(260, v.w * f)), h = (w / v.w) * v.h; return { x: v.x + (v.w - w) * cx, y: v.y + (v.h - h) * cy, w, h }; });
  useEffect(() => {
    const el = ref.current;
    const wheel = (e) => { e.preventDefault(); const r = el.getBoundingClientRect(); zoom(Math.pow(1.0015, e.deltaY), (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);
  useEffect(() => { // recentre sur la sélection
    if (!spots.length) return;
    const xs = spots.map((s) => s.mapX), ys = spots.map((s) => s.mapY);
    const w = Math.max(520, Math.max(...xs) - Math.min(...xs) + 320), h = w * 0.72;
    setVb({ x: (Math.min(...xs) + Math.max(...xs)) / 2 - w / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 - h / 2 - 20, w, h });
  }, [spots.length]); // eslint-disable-line
  const k = vb.w / 1000 * 1.1;
  return (
    <div className="map" ref={ref}>
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="xMidYMid slice" role="group" aria-label="Plan de Tunis avec les adresses"
        onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, vb, moved: false }; }}
        onPointerMove={(e) => { const d = drag.current; if (!d) return; const r = e.currentTarget.getBoundingClientRect(); const dx = (e.clientX - d.x) * d.vb.w / r.width, dy = (e.clientY - d.y) * d.vb.h / r.height; if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true; if (d.moved) setVb({ ...d.vb, x: d.vb.x - dx, y: d.vb.y - dy }); }}
        onPointerUp={() => setTimeout(() => (drag.current = null), 0)} onPointerLeave={() => (drag.current = null)}>
        <g dangerouslySetInnerHTML={{ __html: TUNIS_MAP_SVG }} />
        {spots.map((s, i) => (
          <g key={s.id} className={`pin ${hot === s.id || active === s.slug ? "hot" : ""}`} transform={`translate(${s.mapX} ${s.mapY}) scale(${k})`} tabIndex={0} role="link" aria-label={s.name}
            onClick={() => !drag.current?.moved && onOpen(s)} onKeyDown={(e) => e.key === "Enter" && onOpen(s)} onMouseEnter={() => setHot(s.id)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(s.id)} onBlur={() => setHot(null)}>
            <g className="pin-in" style={{ animationDelay: `${0.15 + i * 0.07}s` }}>
              <ellipse cx="0" cy="2" rx="10" ry="3.5" fill="rgba(0,0,0,.2)" />
              <path d="M0 0 C-14 -18 -22 -27 -22 -40 A22 22 0 1 1 22 -40 C22 -27 14 -18 0 0Z" fill="#b3202a" stroke="#fff" strokeWidth="3" />
              <circle cx="0" cy="-40" r="10" fill="#fff" />
              <g className="lab"><rect x="28" y="-64" width={s.name.length * 11 + 26} height="38" rx="10" fill="#fff" stroke="rgba(60,40,20,.15)" /><text x="40" y="-38" fontSize="17" fill="#2a2420" style={{ fontFamily: "'Homemade Apple', cursive" }}>{s.name}</text></g>
            </g>
          </g>
        ))}
      </svg>
      <div className="zoom"><button onClick={() => zoom(0.75)} aria-label="Zoomer">+</button><button onClick={() => zoom(1.33)} aria-label="Dézoomer">−</button></div>
    </div>
  );
}

// Fiche d’une adresse : menu, photos, avis, infos. Les avis et photos viennent du serveur.
function SpotSheet({ spot, dishes, onClose }) {
  const [tab, setTab] = useState("menu");
  const { data } = useFetch(`/places/${spot.slug}`);
  const st = status(spot.hours, spot.closedDay ?? -1);
  const mine = dishes.filter((d) => spot.dishes.includes(d.id));
  const pf = spot.priceFactor || 1;
  return (
    <aside className="sheet" aria-label={`Fiche ${spot.name}`} style={{ "--a": spot.palette?.[0], "--b": spot.palette?.[1] }}>
      <header className="sheet__h">
        <button className="sheet__x" onClick={onClose} aria-label="Fermer">✕</button>
        <h2 className="sticker-title sm">{spot.name}</h2>
        <p>{spot.address} · <i className={st.open ? "ok" : "ko"}>{st.text}</i></p>
        <p className="sheet__v">{spot.description}</p>
      </header>
      <div className="tabs" role="tablist">{[["menu", "Menu"], ["photos", "Photos"], ["avis", `Avis${data?.reviews?.length ? ` (${data.reviews.length})` : ""}`], ["infos", "Infos"]].map(([k, v]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{v}</button>)}</div>
      <div className="sheet__b">
        {tab === "menu" && mine.map((d) => (<div key={d.id} className="menu"><h3>{d.emoji} {d.name}</h3>{d.menu.map(([n, p]) => <p key={n}><span>{n}</span><i /><b>{dt(Math.round(p * pf * 2) / 2)}</b></p>)}</div>))}
        {tab === "menu" && <p className="muted small">Prix indicatifs, à confirmer sur place.</p>}
        {tab === "photos" && (data?.photos?.length ? <div className="gallery">{data.photos.map((u) => <img key={u} src={u} alt={`Photo de ${spot.name}`} loading="lazy" />)}</div> : <div className="empty"><h3>Pas encore de photo</h3><p>Ajoute la première depuis la fiche complète.</p></div>)}
        {tab === "avis" && (data?.reviews?.length ? data.reviews.map((r) => <article key={r.id} className="rev"><div><b>{r.author}</b> <Stars value={r.rating} /></div><p>{r.text}</p></article>) : <div className="empty"><h3>Pas encore d’avis</h3><p>Sois le premier à noter cette adresse.</p></div>)}
        {tab === "infos" && (<div><p><b>Horaires :</b> {spot.hours.replace("-", " – ")}{spot.closedDay >= 0 && spot.closedDay != null ? ` · fermé le ${DAYS[spot.closedDay]}` : ""}</p><p><b>Quartier :</b> {spot.address}</p><SocialLinks place={spot} /></div>)}
      </div>
      <footer className="sheet__f"><Link className="btn btn--dark btn--block" to={`/lieu/${spot.slug}`}>Fiche complète, avis et carte précise</Link></footer>
    </aside>
  );
}
