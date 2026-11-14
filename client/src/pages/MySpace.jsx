import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PlaceCard, Loading } from "../components/common.jsx";
import Program from "../components/Program.jsx";
import { useAuth, useFetch, useToast } from "../context.jsx";
import { api } from "../api.js";
import { RUB } from "../lib/format.js";
import { PageHead, EmptyDoor } from "../components/deco.jsx";

export default function MySpace() {
  const { user } = useAuth();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "favoris";
  const [n, setN] = useState(0);
  const favs = useFetch("/favorites", [n]);
  const progs = useFetch("/programs", [n]);
  const mine = useFetch("/community/mine", [n]);
  const pending = useFetch(user.role === "admin" ? "/admin/pending" : null, [n]);
  const [open, setOpen] = useState(null);

  const share = async (p) => { const r = await api.patch(`/programs/${p.id}`, { visibility: p.visibility === "shared" ? "private" : "shared" }); toast(r.program.visibility === "shared" ? "Programme partagé" : "Programme redevenu privé"); setN(n + 1); };
  const del = async (p) => { if (!confirm(`Supprimer « ${p.title} » ?`)) return; await api.del(`/programs/${p.id}`); setN(n + 1); };
  const decide = async (id, what) => { await api.post(`/admin/places/${id}/${what}`); toast(what === "approve" ? "Lieu publié" : "Lieu refusé"); setN(n + 1); };

  const TABS = [["favoris", "Favoris"], ["programmes", "Programmes"], ["propositions", "Mes propositions"], ...(user.role === "admin" ? [["moderation", "Modération"]] : [])];
  const L = ({ r, children }) => r.loading && !r.data ? <Loading rows={2} /> : children;

  return (
    <>
    <PageHead tone="sable" kicker={user.role === "admin" ? "Mon espace · administrateur" : "Mon espace"} title={`Ahla, ${user.name.split(" ")[0]} !`} ar="أهلا"
      sub="Tes lieux favoris, tes programmes FAZA MIX et les adresses que tu as proposées, au même endroit."
      side={<div className="me">
        <span className="me__av">{user.name[0].toUpperCase()}</span>
        <div className="me__stats">
          <div><b>{favs.data?.length ?? "…"}</b><span>favoris</span></div>
          <div><b>{progs.data?.length ?? "…"}</b><span>programmes</span></div>
          <div><b>{mine.data?.length ?? "…"}</b><span>propositions</span></div>
        </div>
      </div>} />
    <div className="wrap section">
      <div className="tabs" role="tablist">{TABS.map(([k, v]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setSp({ tab: k })}>{v}</button>)}</div>

      {tab === "favoris" && <L r={favs}>{!favs.data?.length ? <EmptyDoor title="Aucun favori pour l’instant" action={<Link className="btn btn--dark" to="/explorer">Explorer</Link>}>Touche le cœur ♡ d’un lieu pour le retrouver ici.</EmptyDoor> : <div className="grid3">{favs.data.map((p) => <PlaceCard key={p.id} place={p} onFav={() => setTimeout(() => setN(n + 1), 300)} />)}</div>}</L>}

      {tab === "programmes" && <L r={progs}>{!progs.data?.length ? <EmptyDoor title="Aucun programme" action={<Link className="btn btn--dark" to="/mix">Ouvrir FAZA MIX</Link>}>Génère-en un avec FAZA MIX puis enregistre-le.</EmptyDoor> : progs.data.map((p) => (
        <article key={p.id} className="myprog">
          <div className="myprog__h"><div><h3 className="h-sm">{p.title}</h3><p className="muted small">{p.days} jour{p.days > 1 ? "s" : ""} · {p.people} pers. · {p.items.length} étapes</p></div>
            <div className="myprog__a"><button className="btn btn--sm btn--ghost" onClick={() => setOpen(open === p.id ? null : p.id)}>{open === p.id ? "Fermer" : "Voir"}</button>
              <button className="btn btn--sm btn--ghost" onClick={() => share(p)}>{p.visibility === "shared" ? "Ne plus partager" : "Partager"}</button>
              {p.shareCode && p.visibility === "shared" && <button className="btn btn--sm btn--dark" onClick={() => { navigator.clipboard?.writeText(`${location.origin}/programme/${p.shareCode}`); toast("Lien copié"); }}>Copier le lien</button>}
              <button className="btn btn--sm btn--ghost" onClick={() => del(p)}>Supprimer</button></div></div>
          {open === p.id && <Program program={p} />}
        </article>))}</L>}

      {tab === "propositions" && <L r={mine}>{!mine.data?.length ? <EmptyDoor title="Aucune proposition" action={<Link className="btn btn--dark" to="/communaute/proposer">Proposer un lieu</Link>}>Tu connais une adresse que les guides oublient ?</EmptyDoor> : mine.data.map((p) => (
        <article key={p.id} className="myprog"><div className="myprog__h"><div><h3 className="h-sm">{p.name}</h3><p className="muted small">{RUB[p.category].name} · {p.gov.name}</p></div>
          <span className={`status status--${p.status}`}>{{ pending: "En attente", approved: "Publié", rejected: "Refusé" }[p.status]}</span></div></article>))}</L>}

      {tab === "moderation" && <L r={pending}>{!pending.data?.length ? <EmptyDoor title="Rien à valider">Les nouvelles propositions apparaîtront ici.</EmptyDoor> : pending.data.map((p) => (
        <article key={p.id} className="myprog"><div className="myprog__h"><div><h3 className="h-sm">{p.name} <small className="muted">par {p.author?.name}</small></h3><p className="small">{p.description}</p>
          <p className="muted small">{p.lat}, {p.lng} · <a className="link" target="_blank" rel="noopener noreferrer" href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=17/${p.lat}/${p.lng}`}>voir sur la carte</a>{p.instagram && <> · <a className="link" target="_blank" rel="noopener noreferrer" href={p.instagram}>Instagram</a></>}{p.facebook && <> · <a className="link" target="_blank" rel="noopener noreferrer" href={p.facebook}>Facebook</a></>}</p></div>
          <div className="myprog__a"><button className="btn btn--sm btn--dark" onClick={() => decide(p.id, "approve")}>Publier</button><button className="btn btn--sm btn--ghost" onClick={() => decide(p.id, "reject")}>Refuser</button></div></div></article>))}</L>}
    </div>
    </>
  );
}
