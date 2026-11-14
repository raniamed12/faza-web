import { Component, input, output } from "@angular/core";
import { MAP_REGIONS, MAP_VIEWBOX } from "../data/tunisia-map";

// Carte interactive des 24 gouvernorats (frontières officielles, SVG).
//   values      : { slug: 0..1 }  intensité de couleur (ex. affinité avec l’ambiance choisie)
//   selected    : slug sélectionné
//   (pick)      : clic / Entrée sur un gouvernorat — la carte n’est cliquable que si `interactive`
//   (hover)     : survol (slug + événement souris), ou null en sortie
//   labels      : afficher les noms des gouvernorats
const TINY = new Set(["tunis", "ariana", "ben-arous", "manouba", "monastir", "mahdia"]);
const REGIONS = MAP_REGIONS as { slug: string; name: string; d: string; cx: number; cy: number }[];
// Les gouvernorats « apparaissent » du nord au sud.
const ORDER: Record<string, number> = Object.fromEntries([...REGIONS].sort((a, b) => a.cy - b.cy).map((r, i) => [r.slug, i]));

export interface MapHover { slug: string | null; event?: MouseEvent | FocusEvent; }

@Component({
  selector: "faza-tunisia-map",
  host: { style: "display: contents" },
  template: `
    <svg [class]="'tmap ' + className()" [attr.viewBox]="viewBox" role="group" [attr.aria-label]="ariaLabel()">
      <g>
        @for (r of regions; track r.slug) {
          @let h = values() ? (values()![r.slug] ?? 0) : null;
          <path
            [attr.d]="r.d"
            class="tmap__region"
            [class.is-selected]="selected() === r.slug"
            [class.is-hover]="hovered() === r.slug"
            [class.is-cold]="values() && h === 0"
            [class.is-dim]="dimOthers() && selected() && selected() !== r.slug"
            [style.--i]="order[r.slug]"
            [style.--h]="values() ? h : null"
            [attr.role]="interactive() ? 'link' : null"
            [attr.tabindex]="interactive() ? 0 : null"
            [attr.aria-label]="interactive() ? r.name : null"
            [attr.aria-hidden]="interactive() ? null : 'true'"
            (click)="interactive() && pick.emit(r.slug)"
            (keydown)="key($event, r.slug)"
            (mouseenter)="interactive() && hover.emit({ slug: r.slug, event: $event })"
            (mousemove)="interactive() && hover.emit({ slug: r.slug, event: $event })"
            (mouseleave)="interactive() && hover.emit({ slug: null })"
            (focus)="interactive() && hover.emit({ slug: r.slug, event: $event })"
            (blur)="interactive() && hover.emit({ slug: null })"
          />
        }
      </g>
      @if (labels()) {
        <g class="tmap__labels" aria-hidden="true">
          @for (r of labelled; track r.slug) {
            <text [attr.x]="r.cx" [attr.y]="r.cy" text-anchor="middle" [class.is-sel]="selected() === r.slug">{{ r.name }}</text>
          }
        </g>
      }
    </svg>
  `,
})
export class TunisiaMap {
  values = input<Record<string, number> | null>(null);
  selected = input<string | null | undefined>(null);
  hovered = input<string | null>(null);
  labels = input(false);
  dimOthers = input(false);
  interactive = input(false);
  className = input("");
  ariaLabel = input("Carte des 24 gouvernorats de Tunisie");
  pick = output<string>();
  hover = output<MapHover>();

  regions = REGIONS;
  labelled = REGIONS.filter((r) => !TINY.has(r.slug));
  order = ORDER;
  viewBox = `0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`;

  key(e: KeyboardEvent, slug: string) {
    if (!this.interactive()) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.pick.emit(slug); }
  }
}

export const regionCenter = (slug: string) => REGIONS.find((r) => r.slug === slug);
