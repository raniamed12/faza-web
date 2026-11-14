import { useMemo } from "react";
import { MAP_REGIONS, MAP_VIEWBOX } from "../data/tunisiaMap.js";

// Carte interactive des 24 gouvernorats (frontières officielles, SVG).
//   values   : { slug: 0..1 }  intensité de couleur (ex. affinité avec l’ambiance choisie)
//   selected : slug sélectionné
//   onSelect / onHover : callbacks
//   labels   : afficher les noms des gouvernorats
const TINY = new Set(["tunis", "ariana", "ben-arous", "manouba", "monastir", "mahdia"]);

export default function TunisiaMap({ values, selected, hovered, onSelect, onHover, labels = false, dimOthers = false, className = "", children, ariaLabel = "Carte des 24 gouvernorats de Tunisie" }) {
  // Les gouvernorats « apparaissent » du nord au sud.
  const order = useMemo(() => {
    const sorted = [...MAP_REGIONS].sort((a, b) => a.cy - b.cy);
    return Object.fromEntries(sorted.map((r, i) => [r.slug, i]));
  }, []);
  const nameOf = useMemo(() => Object.fromEntries(MAP_REGIONS.map((r) => [r.slug, r.name])), []);

  const interactive = !!onSelect;
  return (
    <svg className={`tmap ${className}`} viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`} role="group" aria-label={ariaLabel}>
      <g>
        {MAP_REGIONS.map((r) => {
          const h = values ? values[r.slug] ?? 0 : null;
          const isSel = selected === r.slug;
          const isHov = hovered === r.slug;
          const cls = ["tmap__region", isSel && "is-selected", isHov && "is-hover", values && h === 0 && "is-cold", dimOthers && selected && !isSel && "is-dim"].filter(Boolean).join(" ");
          const style = { "--i": order[r.slug], ...(values ? { "--h": h } : {}) };
          return (
            <path
              key={r.slug}
              d={r.d}
              className={cls}
              style={style}
              {...(interactive
                ? {
                    role: "link", tabIndex: 0, "aria-label": nameOf[r.slug],
                    onClick: (e) => onSelect(r.slug, e),
                    onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(r.slug, e); } },
                    onMouseEnter: (e) => onHover?.(r.slug, e),
                    onMouseMove: (e) => onHover?.(r.slug, e),
                    onMouseLeave: () => onHover?.(null),
                    onFocus: (e) => onHover?.(r.slug, e),
                    onBlur: () => onHover?.(null),
                  }
                : { "aria-hidden": true })}
            />
          );
        })}
      </g>
      {labels && (
        <g className="tmap__labels" aria-hidden="true">
          {MAP_REGIONS.filter((r) => !TINY.has(r.slug)).map((r) => (
            <text key={r.slug} x={r.cx} y={r.cy} textAnchor="middle" className={selected === r.slug ? "is-sel" : ""}>{r.name}</text>
          ))}
        </g>
      )}
      {children}
    </svg>
  );
}

export const regionCenter = (slug) => MAP_REGIONS.find((r) => r.slug === slug);
