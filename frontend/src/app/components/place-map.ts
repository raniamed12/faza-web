import { Component, ElementRef, afterNextRender, effect, inject, input, signal, viewChild, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import * as L from "leaflet";
import { RUB } from "../lib/format";

// Carte Leaflet / OpenStreetMap. Un lieu à position approximative est entouré d’un cercle :
// on ne prétend jamais à une précision qu’on n’a pas.
const RADIUS: Record<string, number> = { exact: 0, quartier: 450, ville: 2500 };

const pin = (color: string, big = false) =>
  L.divIcon({
    className: "pin",
    html: `<svg width="${big ? 34 : 28}" height="${big ? 44 : 37}" viewBox="0 0 28 37"><path d="M14 0C6.3 0 0 6.2 0 13.800 0 24.500 14 37 14 37s14-12.500 14-23.200C28 6.200 21.700 0 14 0z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="14" cy="13.500" r="5" fill="#fff"/></svg>`,
    iconSize: [big ? 34 : 28, big ? 44 : 37],
    iconAnchor: [big ? 17 : 14, big ? 44 : 37],
    popupAnchor: [0, -34],
  });

@Component({
  selector: "faza-place-map",
  host: { style: "display: contents" },
  template: `<div #el [class]="'placemap ' + className()" [style.height.px]="height()" aria-label="Carte de localisation"></div>`,
})
export class PlaceMap implements OnDestroy {
  places = input<any[]>([]);
  single = input(false);
  height = input(360);
  className = input("");
  zoom = input<number>();
  center = input<[number, number]>();
  private router = inject(Router);

  private el = viewChild.required<ElementRef<HTMLDivElement>>("el");
  private map: L.Map | null = null;
  private layer: L.LayerGroup | null = null;
  private ready = signal(false);

  constructor() {
    afterNextRender(() => {
      this.map = L.map(this.el().nativeElement, { scrollWheelZoom: false, zoomControl: true }).setView(this.center() || [34.2, 9.6], this.zoom() || 6);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.map);
      this.layer = L.layerGroup().addTo(this.map);
      this.ready.set(true);
    });
    effect(() => {
      const places = this.places(), single = this.single(), center = this.center(), zoom = this.zoom();
      if (!this.ready() || !this.map || !this.layer) return;
      this.draw(places, single, center, zoom);
    });
  }

  private draw(places: any[], single: boolean, center?: [number, number], zoom?: number) {
    const map = this.map!, layer = this.layer!;
    layer.clearLayers();
    const pts: [number, number][] = [];
    for (const p of places) {
      if (p.lat == null) continue;
      const color = RUB[p.category]?.color || "#C65D3B";
      const m = L.marker([p.lat, p.lng], { icon: pin(color, single), title: p.name, keyboard: true });
      if (!single) {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${p.name.replace(/</g, "&lt;")}</strong><br><span>${RUB[p.category]?.name || ""} · ${p.gov?.name || ""}</span><br>`;
        const a = document.createElement("a");
        a.href = `/lieu/${p.slug}`; a.textContent = "Voir la fiche";
        a.onclick = (e) => { e.preventDefault(); this.router.navigate(["/lieu", p.slug]); };
        div.appendChild(a);
        m.bindPopup(div);
      }
      m.addTo(layer);
      const r = RADIUS[p.precision] || 0;
      if (r) L.circle([p.lat, p.lng], { radius: r, color, weight: 1.5, fillColor: color, fillOpacity: 0.14, dashArray: "4 4" }).addTo(layer);
      pts.push([p.lat, p.lng]);
    }
    if (pts.length === 1) map.setView(pts[0], zoom || (places[0].precision === "exact" ? 15 : places[0].precision === "quartier" ? 14 : 11));
    else if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30], maxZoom: 12 });
    else if (center) map.setView(center, zoom || 7);
    setTimeout(() => this.map?.invalidateSize(), 50);
  }

  ngOnDestroy() { this.map?.remove(); this.map = null; }
}
