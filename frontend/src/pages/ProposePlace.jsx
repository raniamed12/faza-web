import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useFetch, useToast } from "../context.jsx";
import { api, uploadImage } from "../api.js";
import { RUBRIQUES, TAG_LABEL } from "../lib/format.js";
import { PageHead } from "../components/deco.jsx";

// Carte où l’on clique pour placer le lieu : la position exacte est obligatoire.
function PickMap({ value, onPick }) {
  const el = useRef(null), map = useRef(null), mk = useRef(null);
  useEffect(() => {
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView([34.2, 9.6], 6);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map.current);
    map.current.on("click", (e) => onPick(+e.latlng.lat.toFixed(6), +e.latlng.lng.toFixed(6)));
    setTimeout(() => map.current?.invalidateSize(), 80);
    return () => map.current.remove();
  }, []); // eslint-disable-line
  useEffect(() => {
    if (!value) return;
    if (!mk.current) mk.current = L.marker(value, { draggable: true }).addTo(map.current).on("dragend", (e) => { const p = e.target.getLatLng(); onPick(+p.lat.toFixed(6), +p.lng.toFixed(6)); });
    else mk.current.setLatLng(value);
  }, [value]); // eslint-disable-line
  return <div ref={el} className="placemap" style={{ height: 340 }} aria-label="Carte : clique pour placer le lieu" />;
}

export default function ProposePlace() {
  const toast = useToast();
  const { data: govs } = useFetch("/governorates");
  const [f, setF] = useState({ name: "", category: "discover", governorate: "", description: "", address: "", price: 0, instagram: "", facebook: "", tags: [], lat: null, lng: null, image: null });
  const [errs, setErrs] = useState({}), [busy, setBusy] = useState(false), [done, setDone] = useState(null);
  const up = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const tog = (t) => up("tags", f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t]);

  const locate = () => navigator.geolocation?.getCurrentPosition((p) => up("lat", +p.coords.latitude.toFixed(6)) || up("lng", +p.coords.longitude.toFixed(6)), () => toast("Position indisponible : clique la carte.", { error: true }));
  const photo = async (e) => { const file = e.target.files[0]; if (!file) return; try { up("image", await uploadImage(file)); } catch (x) { toast(x.message, { error: true }); } };

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErrs({});
    try { const r = await api.post("/community/places", { ...f, price: +f.price }); setDone(r); }
    catch (x) { setErrs(x.fields || {}); toast(x.message, { error: true }); }
    finally { setBusy(false); }
  };

  if (done) return (
    <div className="wrap section">
      <div className="thanks">
        <span className="thanks__stamp" aria-hidden="true">Yaatik<br />essaha</span>
        <h2 className="h-lg">Merci, sahbi !</h2>
        <p className="lead">{done.message}</p>
        <div className="hero__cta" style={{ justifyContent: "center" }}><Link className="btn btn--dark" to="/mon-espace?tab=propositions">Suivre mes propositions</Link><Link className="btn btn--ghost" to="/communaute">Retour à la communauté</Link></div>
      </div>
    </div>
  );

  const E = ({ k }) => errs[k] ? <small className="form-error" role="alert">{errs[k]}</small> : null;
  return (
    <>
    <PageHead tone="terra" kicker="Partage ta blassa" title="Proposer un lieu" ar="بلاصة"
      sub="Pour garder FAZA fiable, chaque lieu a besoin de sa position exacte et de sa page Instagram ou Facebook. L’équipe valide avant publication (+20 points)." />
    <div className="wrap section">
      <form className="propose" onSubmit={submit} noValidate>
        <div className="propose__col">
          <label className="field"><span>Nom du lieu</span><input className="input" value={f.name} onChange={(e) => up("name", e.target.value)} /><E k="name" /></label>
          <div className="row2">
            <label className="field"><span>Rubrique</span><select className="input" value={f.category} onChange={(e) => up("category", e.target.value)}>{RUBRIQUES.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.fr}</option>)}</select></label>
            <label className="field"><span>Gouvernorat</span><select className="input" value={f.governorate} onChange={(e) => up("governorate", e.target.value)}><option value="">Choisir…</option>{(govs || []).map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}</select><E k="governorate" /></label>
          </div>
          <label className="field"><span>Pourquoi c’est bien ? (20 à 600 caractères)</span><textarea className="textarea" value={f.description} onChange={(e) => up("description", e.target.value)} /><small className="muted">{f.description.length}/600</small><E k="description" /></label>
          <div className="row2">
            <label className="field"><span>Prix indicatif par personne (DT)</span><input className="input" type="number" min="0" value={f.price} onChange={(e) => up("price", e.target.value)} /><E k="price" /></label>
            <label className="field"><span>Adresse (facultatif)</span><input className="input" value={f.address} onChange={(e) => up("address", e.target.value)} /></label>
          </div>
          <div className="row2">
            <label className="field"><span>Page Instagram</span><input className="input" placeholder="@nom ou lien" value={f.instagram} onChange={(e) => up("instagram", e.target.value)} /><E k="instagram" /></label>
            <label className="field"><span>Page Facebook</span><input className="input" placeholder="nom de la page ou lien" value={f.facebook} onChange={(e) => up("facebook", e.target.value)} /><E k="facebook" /></label>
          </div>
          <E k="social" />
          <fieldset className="field"><legend>Ambiance</legend><div className="chips">{Object.entries(TAG_LABEL).map(([k, v]) => <button type="button" key={k} className="chip" aria-pressed={f.tags.includes(k)} onClick={() => tog(k)}>{v}</button>)}</div></fieldset>
          <label className="btn btn--ghost">📷 {f.image ? "Photo ajoutée ✓" : "Ajouter une photo"}<input type="file" accept="image/*" hidden onChange={photo} /></label>
          {f.image && <img src={f.image} alt="Aperçu" style={{ maxHeight: 120, borderRadius: 10, marginTop: ".6rem" }} />}
        </div>
        <div className="propose__col">
          <div className="field"><span>Position exacte : clique la carte (ou déplace le repère)</span>
            <PickMap value={f.lat != null ? [f.lat, f.lng] : null} onPick={(a, b) => setF((x) => ({ ...x, lat: a, lng: b }))} />
            <div className="row2" style={{ marginTop: ".5rem" }}>
              <button type="button" className="btn btn--ghost btn--sm" onClick={locate}>Utiliser ma position</button>
              <small className="muted">{f.lat != null ? `${f.lat}, ${f.lng}` : "Aucune position choisie"}</small>
            </div>
            <E k="location" />
          </div>
          <button className="btn btn--terra btn--block" disabled={busy}>{busy ? "Envoi…" : "Envoyer pour validation"}</button>
        </div>
      </form>
    </div>
    </>
  );
}
