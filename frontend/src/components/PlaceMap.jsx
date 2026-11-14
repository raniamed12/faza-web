import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RUB } from "../lib/format.js";

// Carte Leaflet / OpenStreetMap. Un lieu à position approximative est entouré d’un cercle :
// on ne prétend jamais à une précision qu’on n’a pas.
const RADIUS = { exact: 0, quartier: 450, ville: 2500 };

const pin = (color, big = false) =>
  L.divIcon({
    className: "pin",
    html: `<svg width="${big ? 34 : 28}" height="${big ? 44 : 37}" viewBox="0 0 28 37"><path d="M14 0C6.3 0 0 6.2 0 13.800 0 24.500 14 37 14 37s14-12.500 14-23.200C28 6.200 21.700 0 14 0z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="14" cy="13.500" r="5" fill="#fff"/></svg>`,
    iconSize: [big ? 34 : 28, big ? 44 : 37],
    iconAnchor: [big ? 17 : 14, big ? 44 : 37],
    popupAnchor: [0, -34],
  });

export default function PlaceMap({ places = [], single = false, height = 360, onOpen, className = "", zoom, center }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);

  useEffect(() => {
    map.current = L.map(el.current, { scrollWheelZoom: false, zoomControl: true }).setView(center || [34.2, 9.6], zoom || 6);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => { map.current.remove(); map.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!map.current) return;
    layer.current.clearLayers();
    const pts = [];
    for (const p of places) {
      if (p.lat == null) continue;
      const color = RUB[p.category]?.color || "#C65D3B";
      const m = L.marker([p.lat, p.lng], { icon: pin(color, single), title: p.name, keyboard: true });
      if (!single) {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${p.name.replace(/</g, "&lt;")}</strong><br><span>${RUB[p.category]?.name || ""} · ${p.gov?.name || ""}</span><br>`;
        const a = document.createElement("a");
        a.href = `/lieu/${p.slug}`; a.textContent = "Voir la fiche";
        a.onclick = (e) => { if (onOpen) { e.preventDefault(); onOpen(p); } };
        div.appendChild(a);
        m.bindPopup(div);
      }
      m.addTo(layer.current);
      const r = RADIUS[p.precision] || 0;
      if (r) L.circle([p.lat, p.lng], { radius: r, color, weight: 1.5, fillColor: color, fillOpacity: 0.14, dashArray: "4 4" }).addTo(layer.current);
      pts.push([p.lat, p.lng]);
    }
    if (pts.length === 1) map.current.setView(pts[0], zoom || (places[0].precision === "exact" ? 15 : places[0].precision === "quartier" ? 14 : 11));
    else if (pts.length > 1) map.current.fitBounds(pts, { padding: [30, 30], maxZoom: 12 });
    else if (center) map.current.setView(center, zoom || 7);
    setTimeout(() => map.current && map.current.invalidateSize(), 50);
  }, [places, single, center, zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className={`placemap ${className}`} style={{ height }} aria-label="Carte de localisation" />;
}
