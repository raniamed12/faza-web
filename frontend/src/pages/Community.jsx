import { Link } from "react-router-dom";
import { Stars, Loading, ErrorBox } from "../components/common.jsx";
import { PageHead, EmptyDoor } from "../components/deco.jsx";
import { useAuth, useFetch } from "../context.jsx";
import { dt } from "../lib/format.js";

const ago = (d) => { const s = (Date.now() - new Date(String(d).replace(" ", "T") + "Z")) / 1000; return s < 3600 ? `il y a ${Math.max(1, Math.round(s / 60))} min` : s < 86400 ? `il y a ${Math.round(s / 3600)} h` : `il y a ${Math.round(s / 86400)} j`; };
const STEPS = [
  { n: "1", t: "Propose", d: "Place le lieu sur la carte et ajoute sa page Instagram ou Facebook.", ic: "📍" },
  { n: "2", t: "On vérifie", d: "L’équipe valide la localisation et la page avant publication.", ic: "🔎" },
  { n: "3", t: "Gagne des points", d: "Avis +5, photo +3, programme partagé +10, lieu publié +20.", ic: "🏅" },
];
const MEDAL = ["#C65D3B", "#17497A", "#2F6B55", "#8B5A2B", "#D62839"];
const KIND = { review: "Avis", gem: "Pépite", program: "Programme" };

export default function Community() {
  const { user } = useAuth();
  const { data: feed, loading, error } = useFetch("/community/feed");
  const { data: board } = useFetch("/community/leaderboard");
  const { data: challenges } = useFetch("/challenges");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  return (
    <>
      <PageHead tone="vert" kicker="Ceux qui connaissent le pays" title="La communauté" ar="الجماعة"
        sub="Des adresses, des avis et des programmes partagés par celles et ceux qui sillonnent la Tunisie. Chaque contribution rapporte des points et des badges.">
        <Link className="btn" to="/communaute/proposer">Proposer un lieu</Link>
        {!user && <Link className="btn btn--ghost on-dark" to="/inscription">Rejoindre FAZA</Link>}
      </PageHead>

      <div className="wrap section comm">
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n}><span className="steps__n">{s.n}</span><div><b>{s.ic} {s.t}</b><p className="muted">{s.d}</p></div></li>
          ))}
        </ol>

        <div className="comm__grid">
          <section aria-label="Fil de la communauté">
            <h2 className="h-md comm__h">Ça se passe maintenant <span className="live">en direct</span></h2>
            {!feed.length ? (
              <EmptyDoor title="Le fil est encore calme" action={<div className="hero__cta" style={{ justifyContent: "center" }}><Link className="btn btn--terra" to="/explorer">Laisser un premier avis</Link><Link className="btn btn--ghost" to="/mix">Partager un programme</Link></div>}>
                Laisse un avis, partage un programme ou propose un lieu : ta contribution apparaîtra ici en premier.
              </EmptyDoor>
            ) : (
              <div className="feed">{feed.map((x, i) => (
                <article key={i} className={`post post--${x.type}`}>
                  <span className="post__av" aria-hidden="true">{x.author?.[0]?.toUpperCase() || "?"}</span>
                  <div className="post__body">
                    <p className="post__h"><b>{x.author}</b> <span className="post__kind">{KIND[x.type]}</span> <span className="post__d">{ago(x.date)}</span></p>
                    {x.type === "review" && (<><p>a noté <Link to={`/lieu/${x.slug}`} className="link">{x.place}</Link> <Stars value={x.rating} /></p><p className="post__q">« {x.text} »</p>{x.photo && <img src={x.photo} alt="" loading="lazy" />}</>)}
                    {x.type === "gem" && (<><p>a déniché une pépite à {x.place.gov.name}</p><h3 className="h-sm"><Link to={`/lieu/${x.place.slug}`}>{x.place.name}</Link></h3><p className="muted">{x.place.description}</p></>)}
                    {x.type === "program" && (<><p>partage un programme à {x.gov}</p><h3 className="h-sm"><Link to={`/programme/${x.share_code}`}>{x.title}</Link></h3><p className="muted">{x.days} jour{x.days > 1 ? "s" : ""} · {dt(x.budget)} par personne · {x.participants} pers.</p></>)}
                  </div>
                </article>))}</div>
            )}
          </section>

          <aside className="comm__side">
            <div className="panel">
              <h2 className="h-md comm__h">Les plus actifs</h2>
              {!board?.length ? (
                <div className="podium podium--empty" aria-label="Classement vide">
                  {[2, 1, 3].map((n) => <div key={n} className={`podium__s podium__s--${n}`}><span className="podium__who">?</span><span className="podium__b">{n}</span></div>)}
                  <p className="muted small">Personne n’a encore de points. Le premier avis te place sur la plus haute marche.</p>
                </div>
              ) : (
                <ol className="board">{board.map((u, i) => (
                  <li key={u.id} className={i < 3 ? `is-top is-${i + 1}` : ""}>
                    <span className="board__n">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
                    <div><b>{u.name}</b><div className="pcard__tags">{u.badges.map((b) => <span key={b} className="tag">{b}</span>)}</div></div>
                    <b className="board__pts">{u.points}<small> pts</small></b>
                  </li>))}</ol>
              )}
            </div>

            <div className="panel">
              <h2 className="h-md comm__h">Défis du moment</h2>
              <ul className="chal">{(challenges || []).map((c, i) => (
                <li key={c.id} style={{ "--c": MEDAL[i % MEDAL.length] }}>
                  <span className="medal" aria-hidden="true"><b>+{c.points}</b><small>pts</small></span>
                  <div><b>{c.title}</b><p className="muted small">{c.description}</p>{c.badge && <span className="chal__badge">Badge « {c.badge} »</span>}</div>
                </li>))}</ul>
              {!user && <p className="notice" style={{ marginTop: "1rem" }}><Link className="link" to="/inscription">Crée un compte</Link> pour relever les défis.</p>}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
