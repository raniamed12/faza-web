import { Component, computed, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ErrorBox, Loading } from "../components/common";
import { EmptyDoor, EventTicket, PageHead } from "../components/deco";
import { fetchData } from "../core/fetch";
import { EVENT_LABEL, NEWS, monthLabel } from "../lib/format";
import { facebookLink } from "../lib/links";

const days = (iso: string) => Math.ceil((+new Date(iso + "T00:00:00") - +new Date(new Date().toDateString())) / 86400000);

@Component({
  selector: "faza-events",
  imports: [RouterLink, Loading, ErrorBox, EmptyDoor, EventTicket, PageHead],
  template: `
    @if (all.loading()) { <faza-loading /> }
    @else if (all.error()) { <faza-error [error]="all.error()" /> }
    @else {
      <header fazaPageHead tone="terra" kicker="L’agenda du pays" [title]="news.name" [ar]="news.ar" [side]="!!next()"
        sub="Festivals, concerts, randonnées, marchés, fêtes de saison. Les dates restent indicatives tant que l’organisateur ne les a pas confirmées.">
        @if (next(); as n) {
          <div side class="countdown">
            <span class="countdown__n">{{ d()! <= 0 ? "Maintenant" : d() === 1 ? "Demain" : "J−" + d() }}</span>
            <span class="countdown__t">Prochain rendez-vous</span>
            <b>{{ n.title }}</b>
            <small>{{ n.gov.name }}</small>
          </div>
        }
      </header>

      <div class="wrap section events">
        <div class="filterbar filterbar--card">
          <div class="chips">
            <button class="chip" [attr.aria-pressed]="!cat()" (click)="cat.set('')">Tout</button>
            @for (c of cats; track c[0]) { <button class="chip" [attr.aria-pressed]="cat() === c[0]" (click)="cat.set(c[0])">{{ c[1] }}</button> }
          </div>
          <select class="input input--sm" (change)="gov.set($any($event.target).value)" aria-label="Gouvernorat">
            <option value="">Toute la Tunisie</option>
            @for (g of govs.data() || []; track g.slug) { <option [value]="g.slug" [selected]="gov() === g.slug">{{ g.name }}</option> }
          </select>
          <label class="check"><input type="checkbox" [checked]="free()" (change)="free.set($any($event.target).checked)" /> Gratuit seulement</label>
        </div>

        @if (months().length > 1) {
          <nav class="monthnav" aria-label="Aller au mois">
            @for (m of months(); track m[0]) { <a [routerLink]="[]" [fragment]="'m-' + m[0]">{{ month(m[0]) }}<small>{{ m[1].length }}</small></a> }
          </nav>
        }

        @if (!list().length) {
          <faza-empty-door title="Aucun rendez-vous avec ces filtres">Change de catégorie ou de gouvernorat pour voir plus d’événements.</faza-empty-door>
        } @else {
          @for (m of months(); track m[0]) {
            <section [id]="'m-' + m[0]" class="month">
              <h2 class="month__t"><span>{{ month(m[0]) }}</span><i></i><small>{{ m[1].length }} rendez-vous</small></h2>
              <div class="evgrid evgrid--t">
                @for (e of m[1]; track e.id) {
                  @let l = links(e);
                  <article fazaEventTicket [e]="e">
                    <p class="evt__desc">{{ e.description }}</p>
                    <div class="social social--c">
                      <a class="social__a social__a--map" target="_blank" rel="noopener noreferrer" [href]="l.map">📍 Lieu</a>
                      <a class="social__a" target="_blank" rel="noopener noreferrer" [href]="l.ig">Instagram@if (!e.instagram) {<em> · recherche</em>}</a>
                      <a class="social__a" target="_blank" rel="noopener noreferrer" [href]="l.fb.href">Facebook@if (!l.fb.official) {<em> · recherche</em>}</a>
                    </div>
                  </article>
                }
              </div>
            </section>
          }
        }
      </div>
    }
  `,
})
export class Events {
  news = NEWS;
  cats = Object.entries(EVENT_LABEL);
  cat = signal(""); gov = signal(""); free = signal(false);
  all = fetchData<any[]>(() => "/events");
  govs = fetchData<any[]>(() => "/governorates");

  list = computed(() => (this.all.data() || []).filter((e) => (!this.cat() || e.category === this.cat()) && (!this.gov() || e.gov.slug === this.gov()) && (!this.free() || e.price === 0)));
  months = computed(() => {
    const m = new Map<string, any[]>();
    this.list().forEach((e) => { const k = e.start.slice(0, 7); m.set(k, [...(m.get(k) || []), e]); });
    return [...m.entries()];
  });
  next = computed(() => (this.all.data() || []).find((e) => days(e.end) >= 0));
  d = computed(() => (this.next() ? days(this.next().start) : null));

  month(k: string) { return monthLabel(k + "-01"); }
  links(e: any) {
    return {
      map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.venue + ", " + e.gov.name + ", Tunisie")}`,
      ig: e.instagram || `https://www.instagram.com/explore/tags/${e.title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "")}/`,
      fb: facebookLink({ name: e.title, gov: e.gov, facebook: e.facebook }),
    };
  }
}
