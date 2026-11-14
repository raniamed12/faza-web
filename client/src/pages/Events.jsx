import { useMemo, useState } from "react";
import { Loading, ErrorBox } from "../components/common.jsx";
import { PageHead, EventTicket, EmptyDoor } from "../components/deco.jsx";
import { useFetch } from "../context.jsx";
import { NEWS, EVENT_LABEL, monthLabel } from "../lib/format.js";
import { facebookLink } from "../lib/links.js";

const days = (iso) => Math.ceil((new Date(iso + "T00:00:00") - new Date(new Date().toDateString())) / 86400000);

export default function Events() {
  const [cat, setCat] = useState(""), [gov, setGov] = useState(""), [free, setFree] = useState(false);
  const { data: all, loading, error } = useFetch("/events");
  const { data: govs } = useFetch("/governorates");
  const list = useMemo(() => (all || []).filter((e) => (!cat || e.category === cat) && (!gov || e.gov.slug === gov) && (!free || e.price === 0)), [all, cat, gov, free]);
  const months = useMemo(() => { const m = new Map(); list.forEach((e) => { const k = e.start.slice(0, 7); m.set(k, [...(m.get(k) || []), e]); }); return [...m.entries()]; }, [list]);
  const next = useMemo(() => (all || []).find((e) => days(e.end) >= 0), [all]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const d = next ? days(next.start) : null;

  return (
    <>
      <PageHead tone="terra" kicker="L’agenda du pays" title={NEWS.name} ar={NEWS.ar}
        sub="Festivals, concerts, randonnées, marchés, fêtes de saison. Les dates restent indicatives tant que l’organisateur ne les a pas confirmées."
        side={next && (
          <div className="countdown">
            <span className="countdown__n">{d <= 0 ? "Maintenant" : d === 1 ? "Demain" : <>J−{d}</>}</span>
            <span className="countdown__t">Prochain rendez-vous</span>
            <b>{next.title}</b>
            <small>{next.gov.name}</small>
          </div>
        )} />

      <div className="wrap section events">
        <div className="filterbar filterbar--card">
          <div className="chips"><button className="chip" aria-pressed={!cat} onClick={() => setCat("")}>Tout</button>{Object.entries(EVENT_LABEL).map(([k, v]) => <button key={k} className="chip" aria-pressed={cat === k} onClick={() => setCat(k)}>{v}</button>)}</div>
          <select className="input input--sm" value={gov} onChange={(e) => setGov(e.target.value)} aria-label="Gouvernorat"><option value="">Toute la Tunisie</option>{(govs || []).map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}</select>
          <label className="check"><input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} /> Gratuit seulement</label>
        </div>

        {months.length > 1 && (
          <nav className="monthnav" aria-label="Aller au mois">
            {months.map(([k, evs]) => <a key={k} href={`#m-${k}`}>{monthLabel(k + "-01")}<small>{evs.length}</small></a>)}
          </nav>
        )}

        {!list.length ? (
          <EmptyDoor title="Aucun rendez-vous avec ces filtres">Change de catégorie ou de gouvernorat pour voir plus d’événements.</EmptyDoor>
        ) : months.map(([k, evs]) => (
          <section key={k} id={`m-${k}`} className="month">
            <h2 className="month__t"><span>{monthLabel(k + "-01")}</span><i /><small>{evs.length} rendez-vous</small></h2>
            <div className="evgrid evgrid--t">{evs.map((e) => {
              const fb = facebookLink({ name: e.title, gov: e.gov, facebook: e.facebook });
              const ig = e.instagram || `https://www.instagram.com/explore/tags/${e.title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "")}/`;
              return (
                <EventTicket key={e.id} e={e}>
                  <p className="evt__desc">{e.description}</p>
                  <div className="social social--c">
                    <a className="social__a social__a--map" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.venue + ", " + e.gov.name + ", Tunisie")}`}>📍 Lieu</a>
                    <a className="social__a" target="_blank" rel="noopener noreferrer" href={ig}>Instagram{!e.instagram && <em> · recherche</em>}</a>
                    <a className="social__a" target="_blank" rel="noopener noreferrer" href={fb.href}>Facebook{!fb.official && <em> · recherche</em>}</a>
                  </div>
                </EventTicket>
              );
            })}</div>
          </section>
        ))}
      </div>
    </>
  );
}
