import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import TunisiaMap from "../components/TunisiaMap.jsx";
import PlaceMap from "../components/PlaceMap.jsx";
import { PlaceCard, Loading, ErrorBox } from "../components/common.jsx";
import { useFetch } from "../context.jsx";
import { PageHead, EmptyDoor } from "../components/deco.jsx";
import { RUBRIQUES, GEMS } from "../lib/format.js";

export default function Explorer() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const rub = sp.get("rub") || "", gov = sp.get("gov") || "", gem = sp.get("gem") === "1";
  const maxPrice = sp.get("max") || "", q = sp.get("q") || "";
  const [view, setView] = useState("liste");
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };

  const qs = new URLSearchParams({ ...(rub && { category: rub }), ...(gov && { gov }), ...(gem && { gem: "1" }), ...(maxPrice && { maxPrice }), ...(q && { q }), limit: "300" }).toString();
  const { data: places, loading, error } = useFetch(`/places?${qs}`);
  const { data: govs } = useFetch("/governorates");

  const counts = useMemo(() => {
    const c = {};
    (places || []).forEach((p) => { c[p.gov.slug] = (c[p.gov.slug] || 0) + 1; });
    const max = Math.max(1, ...Object.values(c));
    return Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v / max]));
  }, [places]);

  const rubInfo = RUBRIQUES.find((r) => r.id === rub);
  return (
    <>
    <PageHead tone={gem ? "vert" : "bleu"} kicker={gem ? "Les pépites du coin" : "La carte des envies"}
      title={gem ? GEMS.name : rubInfo ? rubInfo.name : "Explorer la Tunisie"} ar={gem ? GEMS.ar : rubInfo ? rubInfo.ar : "تونس"}
      sub={gem ? "Les adresses que les guides oublient, repérées par celles et ceux qui connaissent le coin." : rubInfo ? `${rubInfo.fr.replace(" ?", "")}, partout en Tunisie. Filtre par gouvernorat ou budget, puis ouvre la carte.` : "Filtre par rubrique, gouvernorat ou budget. Chaque lieu a sa localisation et ses pages Instagram / Facebook."} />
    <div className="wrap section explorer">

      <div className="explorer__grid">
        <aside className="filters" aria-label="Filtres">
          <div className="chips" role="group" aria-label="Rubrique">
            <button className="chip" aria-pressed={!rub} onClick={() => set("rub", "")}>Tout</button>
            {RUBRIQUES.map((r) => (
              <button key={r.id} className="chip" aria-pressed={rub === r.id} onClick={() => r.id === "eat" && !gov ? set("rub", "eat") : set("rub", r.id)}>{r.name}</button>
            ))}
          </div>
          <label className="field"><span>Recherche</span><input className="input" value={q} onChange={(e) => set("q", e.target.value)} placeholder="ex. médina, plage, couscous…" /></label>
          <label className="field"><span>Gouvernorat</span>
            <select className="input" value={gov} onChange={(e) => set("gov", e.target.value)}>
              <option value="">Toute la Tunisie</option>
              {(govs || []).map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
            </select>
          </label>
          <label className="field"><span>Budget maximum par personne : <b>{maxPrice ? `${maxPrice} DT` : "libre"}</b></span>
            <input type="range" min="0" max="300" step="10" value={maxPrice || 300} onChange={(e) => set("max", +e.target.value >= 300 ? "" : e.target.value)} />
          </label>
          <label className="check"><input type="checkbox" checked={gem} onChange={(e) => set("gem", e.target.checked ? "1" : "")} /> Seulement les pépites</label>
          <div className="filters__map">
            <TunisiaMap values={counts} selected={gov} onSelect={(s) => set("gov", gov === s ? "" : s)} ariaLabel="Choisir un gouvernorat sur la carte" />
            <p className="muted small">Clique la carte pour filtrer par gouvernorat.</p>
          </div>
        </aside>

        <div>
          <div className="viewbar">
            <p aria-live="polite"><b>{places ? places.length : "…"}</b> résultat{places?.length > 1 ? "s" : ""}</p>
            <div className="seg" role="group" aria-label="Affichage">
              <button aria-pressed={view === "liste"} onClick={() => setView("liste")}>Liste</button>
              <button aria-pressed={view === "carte"} onClick={() => setView("carte")}>Carte</button>
            </div>
          </div>
          {loading && !places ? <Loading /> : error ? <ErrorBox error={error} /> : !places.length ? (
            <EmptyDoor title="Rien ne correspond" action={<button className="btn btn--dark" onClick={() => setSp({}, { replace: true })}>Tout réinitialiser</button>}>Élargis le budget ou retire un filtre.</EmptyDoor>
          ) : view === "carte" ? (
            <PlaceMap places={places} height={620} onOpen={(p) => nav(`/lieu/${p.slug}`)} />
          ) : (
            <div className="grid2">{places.map((p) => <PlaceCard key={p.id} place={p} />)}</div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
