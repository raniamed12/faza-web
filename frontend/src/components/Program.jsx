import { Link } from "react-router-dom";
import { SLOT_LABEL, RUB, dt } from "../lib/format.js";
import { SocialLinks } from "./common.jsx";

// Frise d’un programme : étapes par jour, avec remplacement / suppression si `editable`.
export default function Program({ program, editable = false, onReplace, onRemove }) {
  const days = [...new Set(program.items.map((i) => i.day))].sort();
  const total = program.items.reduce((a, b) => a + b.cost, 0);
  const left = Math.round((program.budget - total) * 10) / 10;
  return (
    <div className="prog">
      <div className="prog__sum">
        <div><span>Par personne</span><b>{dt(total)}</b></div>
        <div><span>Groupe ({program.people})</span><b>{dt(total * program.people)}</b></div>
        <div className={left < 0 ? "bad" : "good"}><span>{left < 0 ? "Dépassement" : "Reste"}</span><b>{dt(Math.abs(left))}</b></div>
      </div>
      {days.map((d) => (
        <section key={d} className="prog__day">
          <h3 className="h-md">Jour {d}</h3>
          <ol className="tl">
            {program.items.map((it, idx) => it.day !== d ? null : (
              <li key={idx} className="tl__it tl__it--full" style={{ "--c": RUB[it.place.category].color }}>
                <span className="tl__slot">{SLOT_LABEL[it.slot]}</span>
                <div className="tl__main">
                  <Link to={`/lieu/${it.place.slug}`} className="tl__name">{it.place.name}</Link>
                  <p className="muted small">{RUB[it.place.category].name} · {it.place.gov.name} — {it.place.description}</p>
                  <SocialLinks place={it.place} compact />
                  {editable && (
                    <div className="tl__act">
                      {it.alternatives?.length > 0 && (
                        <label className="small">Remplacer par{" "}
                          <select className="input input--sm" value="" onChange={(e) => onReplace(idx, it.alternatives.find((a) => a.id === +e.target.value))}>
                            <option value="">choisir…</option>
                            {it.alternatives.map((a) => <option key={a.id} value={a.id}>{a.name} ({dt(a.price)})</option>)}
                          </select>
                        </label>
                      )}
                      <button className="btn btn--ghost btn--sm" onClick={() => onRemove(idx)}>Retirer</button>
                    </div>
                  )}
                </div>
                <span className="tl__cost">{dt(it.cost)}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
