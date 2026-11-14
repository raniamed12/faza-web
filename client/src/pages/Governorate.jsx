import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Scene from "../components/Scene.jsx";
import PlaceMap from "../components/PlaceMap.jsx";
import TunisiaMap from "../components/TunisiaMap.jsx";
import { PlaceCard, Loading, ErrorBox } from "../components/common.jsx";
import { Zellige, EventTicket, EmptyDoor } from "../components/deco.jsx";
import { useFetch } from "../context.jsx";
import { RUBRIQUES, NEWS, GEMS } from "../lib/format.js";

const TABS = [...RUBRIQUES, { id: "news", name: NEWS.name, ar: NEWS.ar, fr: NEWS.fr, color: "#2F6B55" }, { id: "gems", name: GEMS.name, ar: GEMS.ar, fr: GEMS.fr, color: "#8B5A2B" }];

export default function Governorate() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/governorates/${slug}`);
  const { data: govs } = useFetch("/governorates");
  const [tab, setTab] = useState("sleep");
  useEffect(() => setTab("sleep"), [slug]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const { governorate: g, places, events } = data;
  const count = (id) => (id === "news" ? events.length : id === "gems" ? places.filter((p) => p.isGem).length : places.filter((p) => p.category === id).length);
  const list = tab === "news" ? [] : tab === "gems" ? places.filter((p) => p.isGem) : places.filter((p) => p.category === tab);
  const cur = TABS.find((t) => t.id === tab);
  const near = (govs || []).filter((x) => x.region === g.region && x.slug !== g.slug);
  const others = near.length ? near : (govs || []).filter((x) => x.slug !== g.slug).slice(0, 4);

  return (
    <>
      <section className="ghero">
        <Scene type={g.scene} seed={g.slug} />
        <div className="ghero__shade" />
        <Zellige opacity={0.08} />
        <span className="ghero__wm ar" lang="ar" aria-hidden="true">{g.nameAr}</span>
        <div className="wrap ghero__in">
          <div className="ghero__txt">
            <nav className="crumbs crumbs--dark" aria-label="Fil d’Ariane"><Link to="/explorer">Explorer</Link> / {g.region}</nav>
            <p className="ghero__reg">{g.region}</p>
            <h1 className="h-xl">{g.name} <span className="ar" lang="ar">{g.nameAr}</span></h1>
            <p className="lead">{g.tagline}</p>
            <ul className="ghero__counts">
              {TABS.map((t) => <li key={t.id}><b>{count(t.id)}</b> {t.id === "news" ? "événements" : t.id === "gems" ? "pépites" : t.fr.toLowerCase()}</li>)}
            </ul>
            <div className="hero__cta">
              <Link className="btn btn--terra" to={`/mix?gov=${g.slug}`}>Mon programme à {g.name}</Link>
              <Link className="btn btn--ghost on-dark" to={`/explorer?gov=${g.slug}`}>Voir sur la carte</Link>
            </div>
          </div>
          <div className="ghero__map" aria-hidden="true">
            <TunisiaMap selected={g.slug} />
            <span>Tu es ici</span>
          </div>
        </div>
        <div className="festoon" aria-hidden="true" />
      </section>

      <div className="wrap section gov">
        <div className="gtabs" role="tablist" aria-label="Rubriques">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} style={{ "--c": t.color }}>
              <span className="ar" lang="ar">{t.ar}</span>
              <b>{t.name}</b>
              <small>{t.fr} · {count(t.id)}</small>
            </button>
          ))}
        </div>

        {tab === "eat" && <p className="notice" style={{ marginBottom: "1.2rem" }}>Envie d’un carnet de gourmandises ? Ouvre <Link to="/benna" className="link">Benna</Link>, le catalogue illustré des plats et des adresses.</p>}

        {tab === "news" ? (
          events.length ? <div className="evgrid evgrid--t">{events.map((e) => <EventTicket key={e.id} e={e} to="/jaw-tounsna"><p className="evt__desc">{e.description}</p></EventTicket>)}</div>
            : <EmptyDoor title={`Pas d’événement répertorié à ${g.name}`} action={<Link className="btn btn--dark" to="/jaw-tounsna">Voir tout l’agenda</Link>}>Tu connais un rendez-vous ici ? Dis-le à la communauté.</EmptyDoor>
        ) : !list.length ? (
          <EmptyDoor title={`Pas encore de « ${cur.name} » à ${g.name}`} action={<Link className="btn btn--dark" to="/communaute/proposer">Proposer un lieu</Link>}>
            Sois la première personne à proposer une adresse dans cette rubrique : l’équipe la vérifie, et elle apparaît ici.
          </EmptyDoor>
        ) : (
          <div className="gsplit">
            <div className="grid2">{list.map((p) => <PlaceCard key={p.id} place={p} />)}</div>
            <div className="gsplit__map"><PlaceMap places={list} height={520} center={[g.lat, g.lng]} zoom={9} /></div>
          </div>
        )}

        {others.length > 0 && (
          <section className="nearby">
            <p className="eyebrow">{near.length ? `Toujours dans la région ${g.region}` : "Continuer le voyage"}</p>
            <h2 className="h-md" style={{ marginBottom: "1.2rem" }}>Et juste à côté…</h2>
            <div className="nearby__grid">
              {others.map((x) => (
                <Link key={x.slug} to={`/gouvernorat/${x.slug}`} className="ncard">
                  <Scene type={x.scene} seed={x.slug} />
                  <span className="ncard__b"><b>{x.name}</b> <span className="ar" lang="ar">{x.nameAr}</span><small>{x.total} lieux · {x.events} événements</small></span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
