import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, useToast } from "../context.jsx";
import { api } from "../api.js";
import { RUB, dt, priceFrom, TAG_LABEL } from "../lib/format.js";
import { directionsLink, facebookLink, instagramLink, mapsLink, PRECISION_LABEL } from "../lib/links.js";
import Scene from "./Scene.jsx";
import { Zellige } from "./deco.jsx";

export const Logo = () => (
  <Link to="/" className="logo" aria-label="FAZA, accueil">
    <span className="logo__word">FAZA</span><span className="logo__ar ar">فازة</span>
  </Link>
);

export function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [pop, setPop] = useState(false);
  const nav = useNavigate();
  const close = () => { setOpen(false); setPop(false); };
  return (
    <header className="header">
      <div className="wrap header__in">
        <Logo />
        <button className="menu-btn" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button>
        <nav className={`nav ${open ? "is-open" : ""}`} aria-label="Navigation principale" onClick={(e) => e.target.closest("a") && close()}>
          <NavLink to="/explorer">Explorer</NavLink>
          <NavLink to="/mix">FAZA MIX</NavLink>
          <NavLink to="/benna">Benna</NavLink>
          <NavLink to="/jaw-tounsna">Jaw Tounsna</NavLink>
          <NavLink to="/communaute">Communauté</NavLink>
          <span className="nav__sep" />
          {user ? (
            <div className="userbox">
              <button className="nav__btn" onClick={() => setPop(!pop)} aria-expanded={pop}>
                <span className="avatar">{user.name[0].toUpperCase()}</span> {user.name.split(" ")[0]}
              </button>
              {(pop || open) && (
                <div className="userbox__pop">
                  <div className="who">{user.email}</div>
                  <Link to="/mon-espace" onClick={close}>Mon espace</Link>
                  <Link to="/mon-espace?tab=programmes" onClick={close}>Mes programmes</Link>
                  <button onClick={() => { logout(); close(); nav("/"); }}>Se déconnecter</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/connexion" className="nav__btn">Connexion</Link>
              <Link to="/inscription" className="btn btn--terra">Créer un compte</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export const Footer = () => (
  <footer className="footer">
    <div className="footer__band" aria-hidden="true"><Zellige opacity={0.22} size={48} /></div>
    <div className="wrap">
      <div className="footer__top">
        <p className="footer__big">Yezzi mel <s>scroll</s>, <em>ayya nkharjou !</em></p>
        <Link to="/mix" className="btn btn--terra">Créer mon programme</Link>
      </div>
      <div className="footer__grid">
        <div>
          <Logo />
          <p style={{ marginTop: ".8rem", maxWidth: "26rem" }}>La Tunisie à ta façon. Un guide collaboratif pour dormir, manger, sortir et découvrir, selon ton budget et ton ambiance.</p>
        </div>
        <div><h4>Explorer</h4><Link to="/explorer">La carte</Link><Link to="/mix">FAZA MIX</Link><Link to="/benna">Benna</Link></div>
        <div><h4>Vivre</h4><Link to="/jaw-tounsna">Jaw Tounsna</Link><Link to="/communaute">Communauté</Link><Link to="/communaute/proposer">Proposer un lieu</Link></div>
        <div><h4>Compte</h4><Link to="/connexion">Connexion</Link><Link to="/inscription">Inscription</Link><Link to="/mon-espace">Mon espace</Link></div>
      </div>
      <div className="footer__note">
        <span>Prix et dates indicatifs. Carte © OpenStreetMap, frontières geoBoundaries (CC BY 4.0).</span>
      </div>
    </div>
  </footer>
);

export const Stars = ({ value = 0 }) => (
  <span className="stars" role="img" aria-label={`${value} sur 5`}>{"★".repeat(Math.round(value))}{"☆".repeat(5 - Math.round(value))}</span>
);

export const Loading = ({ rows = 3 }) => (
  <div className="wrap section" aria-busy="true">{Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton" style={{ height: 90, marginBottom: 14 }} />)}</div>
);
export const ErrorBox = ({ error }) => <div className="wrap section"><div className="empty"><h3>Oups</h3><p>{error?.message || "Impossible de charger cette page."}</p></div></div>;

// Photo si disponible, sinon illustration.
export function PlaceVisual({ place, className = "" }) {
  if (place.image) return <img className={`pv ${className}`} src={place.image} alt={place.name} loading="lazy" />;
  return <Scene type={place.scene || "medina"} seed={place.slug} className={className} label={`Illustration pour ${place.name}`} />;
}

export function FavButton({ place, onChange }) {
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [fav, setFav] = useState(place.favorite);
  const toggle = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return toast("Connecte-toi pour garder tes favoris.", { action: <Link to="/connexion">Connexion</Link> });
    try {
      const r = fav ? await api.del(`/favorites/${place.id}`) : await api.put(`/favorites/${place.id}`);
      setFav(r.favorite); onChange?.(r.favorite);
      toast(r.favorite ? "Ajouté à tes favoris" : "Retiré de tes favoris");
    } catch (err) { toast(err.message, { error: true }); }
  };
  return <button className={`fav ${fav ? "is-on" : ""}`} onClick={toggle} aria-pressed={fav} aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}>{fav ? "♥" : "♡"}</button>;
}

// Localisation + Facebook + Instagram d’un lieu.
export function SocialLinks({ place, compact = false }) {
  const ig = instagramLink(place), fb = facebookLink(place);
  return (
    <div className={`social ${compact ? "social--c" : ""}`}>
      <a href={mapsLink(place)} target="_blank" rel="noopener noreferrer" className="social__a social__a--map">📍 {compact ? "Carte" : "Localisation"}</a>
      <a href={ig.href} target="_blank" rel="noopener noreferrer" className="social__a">Instagram{!ig.official && <em> · recherche</em>}</a>
      <a href={fb.href} target="_blank" rel="noopener noreferrer" className="social__a">Facebook{!fb.official && <em> · recherche</em>}</a>
      {!compact && <a href={directionsLink(place)} target="_blank" rel="noopener noreferrer" className="social__a">Itinéraire</a>}
    </div>
  );
}

export function PlaceCard({ place, onFav }) {
  const rub = RUB[place.category];
  return (
    <article className="pcard">
      <Link to={`/lieu/${place.slug}`} className="pcard__img">
        <PlaceVisual place={place} />
        <span className="pcard__rub" style={{ background: rub.color }}>{rub.name}</span>
        {place.isGem && <span className="pcard__gem">pépite</span>}
      </Link>
      <FavButton place={place} onChange={onFav} />
      <div className="pcard__body">
        <h3 className="h-sm"><Link to={`/lieu/${place.slug}`}>{place.name}</Link></h3>
        <p className="pcard__meta">{place.gov.name} · {priceFrom(place.price)}{place.rating ? <> · ★ {place.rating}</> : null}</p>
        <p className="pcard__desc">{place.description}</p>
        <div className="pcard__tags">{place.tags.slice(0, 3).map((t) => <span key={t} className="tag">{TAG_LABEL[t] || t}</span>)}</div>
        <SocialLinks place={place} compact />
        <p className="pcard__prec" title={PRECISION_LABEL[place.precision]}>{place.precision === "exact" ? "● Position exacte" : place.precision === "quartier" ? "◐ Quartier" : "○ Secteur"}</p>
      </div>
    </article>
  );
}

export { dt };
