import { useId } from "react";
import { Link } from "react-router-dom";
import Scene from "./Scene.jsx";
import { EVENT_LABEL, RUB, priceFrom } from "../lib/format.js";

// ───── Éléments décoratifs propres à FAZA : zellige, bandeaux de page, cartes postales, billets ─────

// Motif de zellige (étoile à huit branches) en SVG : couleur et opacité au choix.
export function Zellige({ color = "#EAD9B5", opacity = 0.16, size = 64, className = "" }) {
  const id = useId().replace(/:/g, "");
  const star = (cx, cy) => (
    <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`}>
      <rect x="-11" y="-11" width="22" height="22" />
      <rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" />
      <circle r="3.4" />
    </g>
  );
  return (
    <svg className={`zellige ${className}`} aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id={`z${id}`} width={size} height={size} patternUnits="userSpaceOnUse" viewBox="0 0 64 64">
          <g fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round">
            {star(32, 32)}{star(0, 0)}{star(64, 0)}{star(0, 64)}{star(64, 64)}
            <path d="M32 16.5 L32 0 M32 47.5 L32 64 M16.5 32 L0 32 M47.5 32 L64 32" />
            <path d="M16 16 L22 22 M48 16 L42 22 M16 48 L22 42 M48 48 L42 42" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#z${id})`} opacity={opacity} />
    </svg>
  );
}

// Bandeau d’en-tête de page : couleur, zellige, grand mot arabe en filigrane, bord festonné.
export function PageHead({ kicker, title, ar, sub, tone = "bleu", children, side }) {
  return (
    <header className={`phead phead--${tone}`}>
      <Zellige color={tone === "sable" ? "#0E2F4F" : "#EAD9B5"} opacity={tone === "sable" ? 0.08 : 0.14} />
      {ar && <span className="phead__wm ar" lang="ar" aria-hidden="true">{ar}</span>}
      <div className="wrap phead__in">
        <div className="phead__txt">
          {kicker && <p className="phead__k">{kicker}</p>}
          <h1 className="h-lg">{title}{ar && <> <span className="ar phead__ar" lang="ar">{ar}</span></>}</h1>
          {sub && <p className="phead__sub">{sub}</p>}
          {children && <div className="phead__act">{children}</div>}
        </div>
        {side && <div className="phead__side">{side}</div>}
      </div>
      <div className="festoon" aria-hidden="true" />
    </header>
  );
}

// Ruban défilant de mots en derja (tunisien) avec leur traduction.
export const DERJA = [
  { w: "Fazza", ar: "فازة", fr: "la vibe, le délire du moment", ex: "Chniya el fazza lyoum ? — On fait quoi aujourd’hui ?" },
  { w: "Lakta", ar: "لقطة", fr: "la belle trouvaille, le bon plan", ex: "Hedhi lakta ! — Ça, c’est une trouvaille !" },
  { w: "Benna", ar: "بنّة", fr: "le bon goût, la saveur", ex: "Fiha benna ! — C’est délicieux !" },
  { w: "Blassa", ar: "بلاصة", fr: "un endroit, une adresse", ex: "Na3ref blassa mrigla. — Je connais un super coin." },
  { w: "Mrigel", ar: "مريقل", fr: "parfait, au top", ex: "El jaw mrigel. — L’ambiance est au top." },
  { w: "Jaw", ar: "جو", fr: "l’ambiance, la fête", ex: "Famma jaw el lila ? — Ça bouge ce soir ?" },
  { w: "Behi", ar: "باهي", fr: "d’accord, c’est bien", ex: "Behi, nemchiw ! — OK, on y va !" },
  { w: "Sahbi", ar: "صاحبي", fr: "mon pote", ex: "Ija m3aya sahbi. — Viens avec moi, mon pote." },
];

export function Marquee({ tone = "terra" }) {
  const items = [...DERJA, ...DERJA];
  return (
    <div className={`marquee marquee--${tone}`} aria-label="Quelques mots de derja">
      <div className="marquee__track">
        {items.map((d, i) => (
          <span key={i} className="marquee__it" aria-hidden={i >= DERJA.length}>
            <b>{d.w}</b> <span className="ar" lang="ar">{d.ar}</span> <em>{d.fr}</em> <i className="marquee__star">✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}

// Carte postale : pour les pépites. Timbre, tampon et mot manuscrit.
export function Postcard({ place, i = 0 }) {
  const rub = RUB[place.category];
  return (
    <Link to={`/lieu/${place.slug}`} className="postcard" style={{ "--rot": `${[-2, 1.5, -1, 2][i % 4]}deg` }}>
      <div className="postcard__img">
        {place.image ? <img src={place.image} alt="" loading="lazy" /> : <Scene type={place.scene || "medina"} seed={place.slug} />}
        <span className="postcard__greet">Bisous de {place.gov.name}</span>
      </div>
      <div className="postcard__back">
        <div className="postcard__msg">
          <h3>{place.name}</h3>
          <p>{place.description}</p>
        </div>
        <div className="postcard__addr">
          <span className="stamp" style={{ "--c": rub.color }}><b>{priceFrom(place.price)}</b><small>{rub.name}</small></span>
          <span className="postmark" aria-hidden="true"><i>{place.gov.name}</i><i>FAZA</i></span>
          <span className="postcard__lines" aria-hidden="true"><i /><i /><i /></span>
        </div>
      </div>
    </Link>
  );
}

// Billet d’événement : grand bloc de date, image, talon détachable.
const MON = ["JAN", "FÉV", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
export function DateBlock({ start, end }) {
  const a = new Date(start + "T12:00:00"), b = new Date(end + "T12:00:00");
  const multi = start !== end;
  return (
    <span className="dblock">
      <b>{a.getDate()}{multi && a.getMonth() === b.getMonth() ? <small>–{b.getDate()}</small> : null}</b>
      <span>{MON[a.getMonth()]}{multi && a.getMonth() !== b.getMonth() ? ` → ${b.getDate()} ${MON[b.getMonth()]}` : ""}</span>
    </span>
  );
}

export function EventTicket({ e, to, children, compact = false }) {
  const Tag = to ? Link : "article";
  return (
    <Tag {...(to ? { to } : {})} className={`evt ${compact ? "evt--c" : ""}`}>
      <div className="evt__img">
        <Scene type={e.scene} seed={e.slug} />
        <DateBlock start={e.start} end={e.end} />
        <span className="evt__cat">{EVENT_LABEL[e.category]}</span>
      </div>
      <div className="evt__stub" aria-hidden="true" />
      <div className="evt__b">
        <h3 className="h-sm">{e.title}</h3>
        <p className="evt__where">📍 {e.venue ? `${e.venue}, ` : ""}{e.gov.name}</p>
        <div className="evt__row">
          <span className={`evt__price ${e.price === 0 ? "is-free" : ""}`}>{priceFrom(e.price)}</span>
          {!e.confirmed && <span className="evt__tbc">date à confirmer</span>}
        </div>
        {children}
      </div>
    </Tag>
  );
}

// Petite illustration pour les états vides : une porte bleue de Sidi Bou Saïd entrouverte.
export function EmptyDoor({ title, children, action }) {
  return (
    <div className="emptyd">
      <svg viewBox="0 0 120 150" className="emptyd__door" aria-hidden="true">
        <path d="M10 148 V60 a50 50 0 0 1 100 0 V148Z" fill="#fff" stroke="#EAD9B5" strokeWidth="3" />
        <path d="M22 148 V64 a38 38 0 0 1 76 0 V148Z" fill="#17497A" />
        <path d="M60 26 V148" stroke="#0E2F4F" strokeWidth="2" />
        {Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={[32, 46, 74, 88][i % 4]} cy={72 + Math.floor(i / 4) * 16} r="2" fill="#EAD9B5" />)}
        <circle cx="70" cy="104" r="4" fill="none" stroke="#EAD9B5" strokeWidth="2" />
      </svg>
      <h3 className="h-sm">{title}</h3>
      <div className="muted">{children}</div>
      {action}
    </div>
  );
}
