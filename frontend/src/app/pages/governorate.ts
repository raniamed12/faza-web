import { Component, computed, effect, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Scene } from "../components/scene";
import { PlaceMap } from "../components/place-map";
import { TunisiaMap } from "../components/tunisia-map";
import { ErrorBox, Loading, PlaceCard } from "../components/common";
import { EmptyDoor, EventTicket, Zellige } from "../components/deco";
import { fetchData } from "../core/fetch";
import { GEMS, NEWS, RUBRIQUES } from "../lib/format";

const TABS = [...RUBRIQUES, { id: "news", name: NEWS.name, ar: NEWS.ar, fr: NEWS.fr, color: "#2F6B55" }, { id: "gems", name: GEMS.name, ar: GEMS.ar, fr: GEMS.fr, color: "#8B5A2B" }];

@Component({
  selector: "faza-governorate",
  imports: [RouterLink, Scene, PlaceMap, TunisiaMap, PlaceCard, Loading, ErrorBox, EmptyDoor, EventTicket, Zellige],
  template: `
    @if (res.loading() && !res.data()) { <faza-loading /> }
    @else if (res.error()) { <faza-error [error]="res.error()" /> }
    @else if (res.data(); as d) {
      @let g = d.governorate;
      <section class="ghero">
        <svg fazaScene [type]="g.scene" [seed]="g.slug"></svg>
        <div class="ghero__shade"></div>
        <svg fazaZellige [opacity]="0.08"></svg>
        <span class="ghero__wm ar" lang="ar" aria-hidden="true">{{ g.nameAr }}</span>
        <div class="wrap ghero__in">
          <div class="ghero__txt">
            <nav class="crumbs crumbs--dark" aria-label="Fil d’Ariane"><a routerLink="/explorer">Explorer</a> / {{ g.region }}</nav>
            <p class="ghero__reg">{{ g.region }}</p>
            <h1 class="h-xl">{{ g.name }} <span class="ar" lang="ar">{{ g.nameAr }}</span></h1>
            <p class="lead">{{ g.tagline }}</p>
            <ul class="ghero__counts">
              @for (t of tabs; track t.id) { <li><b>{{ count(t.id) }}</b> {{ t.id === "news" ? "événements" : t.id === "gems" ? "pépites" : lower(t.fr) }}</li> }
            </ul>
            <div class="hero__cta">
              <a class="btn btn--terra" routerLink="/mix" [queryParams]="{ gov: g.slug }">Mon programme à {{ g.name }}</a>
              <a class="btn btn--ghost on-dark" routerLink="/explorer" [queryParams]="{ gov: g.slug }">Voir sur la carte</a>
            </div>
          </div>
          <div class="ghero__map" aria-hidden="true">
            <faza-tunisia-map [selected]="g.slug" />
            <span>Tu es ici</span>
          </div>
        </div>
        <div class="festoon" aria-hidden="true"></div>
      </section>

      <div class="wrap section gov">
        <div class="gtabs" role="tablist" aria-label="Rubriques">
          @for (t of tabs; track t.id) {
            <button role="tab" [attr.aria-selected]="tab() === t.id" (click)="tab.set(t.id)" [style.--c]="t.color">
              <span class="ar" lang="ar">{{ t.ar }}</span>
              <b>{{ t.name }}</b>
              <small>{{ t.fr }} · {{ count(t.id) }}</small>
            </button>
          }
        </div>

        @if (tab() === "eat") { <p class="notice" style="margin-bottom: 1.2rem">Envie d’un carnet de gourmandises ? Ouvre <a routerLink="/benna" class="link">Benna</a>, le catalogue illustré des plats et des adresses.</p> }

        @if (tab() === "news") {
          @if (d.events.length) {
            <div class="evgrid evgrid--t">@for (e of d.events; track e.id) { <a fazaEventTicket [e]="e" routerLink="/jaw-tounsna"><p class="evt__desc">{{ e.description }}</p></a> }</div>
          } @else {
            <faza-empty-door [title]="'Pas d’événement répertorié à ' + g.name">Tu connais un rendez-vous ici ? Dis-le à la communauté.<a action class="btn btn--dark" routerLink="/jaw-tounsna">Voir tout l’agenda</a></faza-empty-door>
          }
        } @else if (!list().length) {
          <faza-empty-door [title]="'Pas encore de « ' + cur().name + ' » à ' + g.name">
            Sois la première personne à proposer une adresse dans cette rubrique : l’équipe la vérifie, et elle apparaît ici.
            <a action class="btn btn--dark" routerLink="/communaute/proposer">Proposer un lieu</a>
          </faza-empty-door>
        } @else {
          <div class="gsplit">
            <div class="grid2">@for (p of list(); track p.id) { <article fazaPlaceCard [place]="p"></article> }</div>
            <div class="gsplit__map"><faza-place-map [places]="list()" [height]="520" [center]="[g.lat, g.lng]" [zoom]="9" /></div>
          </div>
        }

        @if (others().length > 0) {
          <section class="nearby">
            <p class="eyebrow">{{ near().length ? "Toujours dans la région " + g.region : "Continuer le voyage" }}</p>
            <h2 class="h-md" style="margin-bottom: 1.2rem">Et juste à côté…</h2>
            <div class="nearby__grid">
              @for (x of others(); track x.slug) {
                <a [routerLink]="['/gouvernorat', x.slug]" class="ncard">
                  <svg fazaScene [type]="x.scene" [seed]="x.slug"></svg>
                  <span class="ncard__b"><b>{{ x.name }}</b> <span class="ar" lang="ar">{{ x.nameAr }}</span><small>{{ x.total }} lieux · {{ x.events }} événements</small></span>
                </a>
              }
            </div>
          </section>
        }
      </div>
    }
  `,
})
export class Governorate {
  slug = input.required<string>();
  tabs = TABS;
  tab = signal("sleep");
  res = fetchData<any>(() => `/governorates/${this.slug()}`);
  govs = fetchData<any[]>(() => "/governorates");

  constructor() {
    effect(() => { this.slug(); this.tab.set("sleep"); });
  }

  private places = computed<any[]>(() => this.res.data()?.places || []);
  list = computed(() => {
    const t = this.tab(), p = this.places();
    return t === "news" ? [] : t === "gems" ? p.filter((x) => x.isGem) : p.filter((x) => x.category === t);
  });
  cur = computed(() => TABS.find((t) => t.id === this.tab())!);
  near = computed(() => { const g = this.res.data()?.governorate; return g ? (this.govs.data() || []).filter((x) => x.region === g.region && x.slug !== g.slug) : []; });
  others = computed(() => { const g = this.res.data()?.governorate; return this.near().length ? this.near() : (this.govs.data() || []).filter((x) => x.slug !== g?.slug).slice(0, 4); });

  count(id: string) {
    const d = this.res.data(); if (!d) return 0;
    return id === "news" ? d.events.length : id === "gems" ? d.places.filter((p: any) => p.isGem).length : d.places.filter((p: any) => p.category === id).length;
  }
  lower(fr: string) { return fr.replace(" ?", "").toLowerCase(); }
}
