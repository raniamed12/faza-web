import { Component, computed, inject, input, signal } from "@angular/core";
import { Router } from "@angular/router";
import { TunisiaMap } from "../components/tunisia-map";
import { PlaceMap } from "../components/place-map";
import { ErrorBox, Loading, PlaceCard } from "../components/common";
import { EmptyDoor, PageHead } from "../components/deco";
import { fetchData } from "../core/fetch";
import { GEMS, RUBRIQUES } from "../lib/format";

// Les filtres vivent dans l’adresse (?rub=…&gov=…&max=…&q=…&gem=1) : on peut partager une recherche.
@Component({
  selector: "faza-explorer",
  imports: [TunisiaMap, PlaceMap, PlaceCard, Loading, ErrorBox, EmptyDoor, PageHead],
  template: `
    <header fazaPageHead [tone]="gem() ? 'vert' : 'bleu'" [kicker]="gem() ? 'Les pépites du coin' : 'La carte des envies'"
      [title]="head().title" [ar]="head().ar" [sub]="head().sub"></header>
    <div class="wrap section explorer">
      <div class="explorer__grid">
        <aside class="filters" aria-label="Filtres">
          <div class="chips" role="group" aria-label="Rubrique">
            <button class="chip" [attr.aria-pressed]="!rubV()" (click)="set('rub', '')">Tout</button>
            @for (r of rubriques; track r.id) {
              <button class="chip" [attr.aria-pressed]="rubV() === r.id" (click)="set('rub', r.id)">{{ r.name }}</button>
            }
          </div>
          <label class="field"><span>Recherche</span><input class="input" [value]="qV()" (input)="set('q', $any($event.target).value)" placeholder="ex. médina, plage, couscous…" /></label>
          <label class="field"><span>Gouvernorat</span>
            <select class="input" [value]="govV()" (change)="set('gov', $any($event.target).value)">
              <option value="">Toute la Tunisie</option>
              @for (g of govs.data() || []; track g.slug) { <option [value]="g.slug" [selected]="g.slug === govV()">{{ g.name }}</option> }
            </select>
          </label>
          <label class="field"><span>Budget maximum par personne : <b>{{ maxV() ? maxV() + ' DT' : 'libre' }}</b></span>
            <input type="range" min="0" max="300" step="10" [value]="maxV() || 300" (input)="setMax($any($event.target).value)" />
          </label>
          <label class="check"><input type="checkbox" [checked]="gem()" (change)="set('gem', $any($event.target).checked ? '1' : '')" /> Seulement les pépites</label>
          <div class="filters__map">
            <faza-tunisia-map [values]="counts()" [selected]="govV()" [interactive]="true" (pick)="set('gov', govV() === $event ? '' : $event)" ariaLabel="Choisir un gouvernorat sur la carte" />
            <p class="muted small">Clique la carte pour filtrer par gouvernorat.</p>
          </div>
        </aside>

        <div>
          <div class="viewbar">
            <p aria-live="polite"><b>{{ places.data() ? places.data()!.length : "…" }}</b> résultat{{ (places.data()?.length || 0) > 1 ? "s" : "" }}</p>
            <div class="seg" role="group" aria-label="Affichage">
              <button [attr.aria-pressed]="view() === 'liste'" (click)="view.set('liste')">Liste</button>
              <button [attr.aria-pressed]="view() === 'carte'" (click)="view.set('carte')">Carte</button>
            </div>
          </div>
          @if (places.loading() && !places.data()) {
            <faza-loading />
          } @else if (places.error()) {
            <faza-error [error]="places.error()" />
          } @else if (!places.data()?.length) {
            <faza-empty-door title="Rien ne correspond">Élargis le budget ou retire un filtre.<button action class="btn btn--dark" (click)="reset()">Tout réinitialiser</button></faza-empty-door>
          } @else if (view() === "carte") {
            <faza-place-map [places]="places.data()!" [height]="620" />
          } @else {
            <div class="grid2">@for (p of places.data(); track p.id) { <article fazaPlaceCard [place]="p"></article> }</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class Explorer {
  private router = inject(Router);
  // Paramètres d’URL, injectés par le routeur (withComponentInputBinding).
  rub = input<string>(); gov = input<string>(); gemQ = input<string>(undefined, { alias: "gem" }); max = input<string>(); q = input<string>();
  rubV = computed(() => this.rub() || ""); govV = computed(() => this.gov() || ""); maxV = computed(() => this.max() || ""); qV = computed(() => this.q() || "");
  gem = computed(() => this.gemQ() === "1");

  rubriques = RUBRIQUES;
  view = signal<"liste" | "carte">("liste");

  places = fetchData<any[]>(() => {
    const p: Record<string, string> = {};
    if (this.rubV()) p["category"] = this.rubV();
    if (this.govV()) p["gov"] = this.govV();
    if (this.gem()) p["gem"] = "1";
    if (this.maxV()) p["maxPrice"] = this.maxV();
    if (this.qV()) p["q"] = this.qV();
    p["limit"] = "300";
    return `/places?${new URLSearchParams(p)}`;
  });
  govs = fetchData<any[]>(() => "/governorates");

  counts = computed(() => {
    const c: Record<string, number> = {};
    (this.places.data() || []).forEach((p) => { c[p.gov.slug] = (c[p.gov.slug] || 0) + 1; });
    const max = Math.max(1, ...Object.values(c));
    return Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v / max]));
  });

  head = computed(() => {
    const r = RUBRIQUES.find((x) => x.id === this.rubV());
    if (this.gem()) return { title: GEMS.name, ar: GEMS.ar, sub: "Les adresses que les guides oublient, repérées par celles et ceux qui connaissent le coin." };
    if (r) return { title: r.name, ar: r.ar, sub: `${r.fr.replace(" ?", "")}, partout en Tunisie. Filtre par gouvernorat ou budget, puis ouvre la carte.` };
    return { title: "Explorer la Tunisie", ar: "تونس", sub: "Filtre par rubrique, gouvernorat ou budget. Chaque lieu a sa localisation et ses pages Instagram / Facebook." };
  });

  set(k: string, v: string) {
    this.router.navigate([], { queryParams: { [k]: v || null }, queryParamsHandling: "merge", replaceUrl: true });
  }
  setMax(v: string) { this.set("max", +v >= 300 ? "" : v); }
  reset() { this.router.navigate([], { queryParams: {}, replaceUrl: true }); }
}
