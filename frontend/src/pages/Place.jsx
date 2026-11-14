import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import PlaceMap from "../components/PlaceMap.jsx";
import { PlaceVisual, PlaceCard, FavButton, SocialLinks, Stars, Loading, ErrorBox } from "../components/common.jsx";
import { EmptyDoor } from "../components/deco.jsx";
import { useAuth, useFetch, useToast } from "../context.jsx";
import { api, uploadImage } from "../api.js";
import { RUB, priceFrom, TAG_LABEL } from "../lib/format.js";
import { PRECISION_LABEL, osmLink } from "../lib/links.js";

export default function Place() {
  const { slug } = useParams();
  const [n, setN] = useState(0);
  const { data, loading, error } = useFetch(`/places/${slug}`, [n]);
  const { user } = useAuth();
  const toast = useToast();
  const { data: around } = useFetch(data ? `/places?gov=${data.place.gov.slug}&limit=12` : null);
  const [rating, setRating] = useState(5), [text, setText] = useState(""), [photo, setPhoto] = useState(null), [busy, setBusy] = useState(false), [err, setErr] = useState("");

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const { place: p, reviews, photos, dishes } = data;
  const rub = RUB[p.category];

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      await api.post(`/places/${p.slug}/reviews`, { rating, text, photo });
      setText(""); setPhoto(null); setN(n + 1); toast("Merci pour ton avis !");
    } catch (x) { setErr(x.fields?.text || x.message); } finally { setBusy(false); }
  };
  const pick = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { setPhoto(await uploadImage(f)); } catch (x) { setErr(x.message); }
  };

  return (
    <div className="wrap section place">
      <nav className="crumbs" aria-label="Fil d’Ariane"><Link to="/explorer">Explorer</Link> / <Link to={`/gouvernorat/${p.gov.slug}`}>{p.gov.name}</Link> / {p.name}</nav>
      {p.status === "pending" && <p className="notice">Ce lieu est en attente de validation par l’équipe.</p>}
      <div className="place__grid">
        <div>
          <div className="place__img"><PlaceVisual place={p} /><span className="pcard__rub" style={{ background: rub.color }}>{rub.name}</span></div>
          {photos.length > 0 && <div className="gallery">{photos.map((u) => <img key={u} src={u} alt={`Photo de ${p.name} par la communauté`} loading="lazy" />)}</div>}
        </div>
        <div>
          <h1 className="h-lg">{p.name} <FavButton place={p} /></h1>
          <p className="muted" style={{ margin: ".4rem 0 1rem" }}>{p.gov.name} · {priceFrom(p.price)} par personne (indicatif){p.rating ? <> · <Stars value={p.rating} /> {p.rating} ({p.reviewCount})</> : null}</p>
          <p className="place__desc">{p.description}</p>
          <div className="pcard__tags" style={{ margin: "1rem 0" }}>{p.tags.map((t) => <span key={t} className="tag">{TAG_LABEL[t] || t}</span>)}{p.isGem && <span className="tag">pépite</span>}</div>
          <dl className="facts">
            <div><dt>💰 Budget</dt><dd>{priceFrom(p.price)} <small>par personne</small></dd></div>
            <div><dt>📍 Gouvernorat</dt><dd><Link className="link" to={`/gouvernorat/${p.gov.slug}`}>{p.gov.name}</Link></dd></div>
            {p.hours && <div><dt>🕐 Horaires</dt><dd>{p.hours}{p.closedDay >= 0 ? <small> · fermé le {["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"][p.closedDay]}</small> : null}</dd></div>}
            {p.address && <div><dt>🏠 Adresse</dt><dd>{p.address}</dd></div>}
            {dishes.length > 0 && <div className="facts__wide"><dt>🍽 À goûter</dt><dd>{dishes.map((d) => `${d.emoji} ${d.name}`).join(" · ")}</dd></div>}
          </dl>
          <h2 className="h-sm" style={{ margin: "1.4rem 0 .5rem" }}>Retrouver ce lieu</h2>
          <SocialLinks place={p} />
          <p className="muted small" style={{ marginTop: ".6rem" }}>Les liens « recherche » s’affichent tant que la page officielle n’est pas renseignée : on n’invente jamais d’adresse.</p>
        </div>
      </div>

      <section style={{ marginTop: "2.5rem" }}>
        <h2 className="h-md">Localisation</h2>
        <p className="muted" style={{ margin: ".3rem 0 .8rem" }}>{PRECISION_LABEL[p.precision]}. {osmLink(p) && <a className="link" href={osmLink(p)} target="_blank" rel="noopener noreferrer">Ouvrir dans OpenStreetMap</a>}</p>
        <PlaceMap places={[p]} single height={380} />
      </section>

      <section className="reviews">
        <h2 className="h-md">Avis de la communauté</h2>
        {user ? (
          <form onSubmit={submit} className="revform">
            <fieldset className="stars-in"><legend className="sr-only">Note</legend>
              {[1, 2, 3, 4, 5].map((i) => <button type="button" key={i} aria-pressed={rating >= i} aria-label={`${i} sur 5`} className={rating >= i ? "on" : ""} onClick={() => setRating(i)}>★</button>)}
            </fieldset>
            <textarea className="textarea" required minLength={5} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder="Raconte ta visite : ce qui t’a plu, le prix payé, un conseil…" />
            <div className="revform__row">
              <label className="btn btn--ghost btn--sm">📷 {photo ? "Photo ajoutée ✓" : "Ajouter une photo"}<input type="file" accept="image/*" hidden onChange={pick} /></label>
              <button className="btn btn--dark" disabled={busy}>{busy ? "Envoi…" : "Publier mon avis"}</button>
            </div>
            {err && <p className="form-error" role="alert">{err}</p>}
          </form>
        ) : <p className="notice"><Link className="link" to="/connexion">Connecte-toi</Link> pour laisser un avis ou une photo.</p>}
        {reviews.length === 0 ? <EmptyDoor title="Pas encore d’avis">Sois la première personne à raconter ta visite : +5 points, et +3 avec une photo.</EmptyDoor> :
          reviews.map((r) => (
            <article key={r.id} className="rev"><div><b>{r.author}</b> <Stars value={r.rating} /> <span className="muted small">{new Date(r.created_at.replace(" ", "T") + "Z").toLocaleDateString("fr-FR")}</span></div><p>{r.text}</p>{r.photo && <img src={r.photo} alt="Photo de l’avis" loading="lazy" />}</article>
          ))}
      </section>

      {(() => {
        const pool = (around || []).filter((x) => x.id !== p.id); const near = [...pool.filter((x) => x.category !== p.category), ...pool.filter((x) => x.category === p.category)].slice(0, 3);
        return near.length > 0 && (
          <section className="nearby">
            <p className="eyebrow">Dans le même coin</p>
            <div className="section__head" style={{ marginBottom: "1.2rem" }}>
              <h2 className="h-md">À faire aussi à {p.gov.name}</h2>
              <Link className="btn btn--ghost btn--sm" to={`/gouvernorat/${p.gov.slug}`}>Tout {p.gov.name}</Link>
            </div>
            <div className="grid3">{near.map((x) => <PlaceCard key={x.id} place={x} />)}</div>
          </section>
        );
      })()}
    </div>
  );
}
