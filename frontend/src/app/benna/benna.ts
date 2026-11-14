import { Component, ElementRef, OnDestroy, afterNextRender, computed, effect, inject, input, output, signal, untracked, viewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter, map } from "rxjs";
import { ErrorBox, Loading, SocialLinks, Stars } from "../components/common";
import { fetchData } from "../core/fetch";
import { TUNIS_MAP_SVG } from "../data/tunis-map";
import IMG from "../data/dish-images.json";
import { dt } from "../lib/format";

// ───── BENNA (بنّة) : le carnet gourmand de FAZA ─────
// Un carnet de collage (plats = autocollants, 6 pages) + un plan de Tunis dessiné à la main.
// Toucher un plat filtre les adresses ; toucher une épingle ouvre la fiche (menu, photos, avis, infos).
const PAGE_TITLES = ["Cafés & douceurs", "Sucré", "Cuisine du monde", "Brunch & boissons", "Street-food tunisienne", "À la tunisienne"];
const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const IMAGES = IMG as Record<string, string>;

function status(h: string, off: number, now = new Date()) {
  const [a, b] = h.split("-"), m = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  const open = m(a), close = m(b) <= m(a) ? m(b) + 1440 : m(b);
  let cur = now.getHours() * 60 + now.getMinutes(), day = now.getDay();
  if (cur < open && close > 1440) { cur += 1440; day = (day + 6) % 7; } // après minuit
  const ok = day !== off && cur >= open && cur < close;
  const hhmm = (x: number) => `${String(Math.floor((x % 1440) / 60)).padStart(2, "0")}h${String(x % 60).padStart(2, "0")}`;
  return { open: ok, text: ok ? `Ouvert · ferme à ${hhmm(close)}` : `Fermé · ouvre à ${hhmm(open)}`, off };
}

// Plan de Tunis : glisser pour déplacer, molette / boutons pour zoomer.
@Component({
  selector: "faza-plan-map",
  host: { style: "display: contents" },
  template: `
    <div class="map" #box>
      <svg [attr.viewBox]="vb().x + ' ' + vb().y + ' ' + vb().w + ' ' + vb().h" preserveAspectRatio="xMidYMid slice" role="group" aria-label="Plan de Tunis avec les adresses"
        (pointerdown)="down($event)" (pointermove)="move($event)" (pointerup)="up()" (pointerleave)="drag = null">
        <g [innerHTML]="bg"></g>
        @for (s of spots(); track s.id; let i = $index) {
          <g class="pin" [class.hot]="hot() === s.id || active() === s.slug" [attr.transform]="'translate(' + s.mapX + ' ' + s.mapY + ') scale(' + k() + ')'" tabindex="0" role="link" [attr.aria-label]="s.name"
            (click)="click(s)" (keydown.enter)="opened.emit(s)" (mouseenter)="hot.set(s.id)" (mouseleave)="hot.set(null)" (focus)="hot.set(s.id)" (blur)="hot.set(null)">
            <g class="pin-in" [style.animation-delay]="0.15 + i * 0.07 + 's'">
              <ellipse cx="0" cy="2" rx="10" ry="3.5" fill="rgba(0,0,0,.2)" />
              <path d="M0 0 C-14 -18 -22 -27 -22 -40 A22 22 0 1 1 22 -40 C22 -27 14 -18 0 0Z" fill="#b3202a" stroke="#fff" stroke-width="3" />
              <circle cx="0" cy="-40" r="10" fill="#fff" />
              <g class="lab"><rect x="28" y="-64" [attr.width]="s.name.length * 11 + 26" height="38" rx="10" fill="#fff" stroke="rgba(60,40,20,.15)" /><text x="40" y="-38" font-size="17" fill="#2a2420" style="font-family: 'Homemade Apple', cursive">{{ s.name }}</text></g>
            </g>
          </g>
        }
      </svg>
      <div class="zoom"><button (click)="zoom(0.75)" aria-label="Zoomer">+</button><button (click)="zoom(1.33)" aria-label="Dézoomer">−</button></div>
    </div>
  `,
})
export class PlanMap implements OnDestroy {
  spots = input<any[]>([]);
  active = input<string | null>(null);
  opened = output<any>();
  bg = inject(DomSanitizer).bypassSecurityTrustHtml(TUNIS_MAP_SVG); // fond de carte statique, sans donnée utilisateur
  vb = signal({ x: 380, y: 80, w: 920, h: 700 });
  hot = signal<number | null>(null);
  k = computed(() => (this.vb().w / 1000) * 1.1);
  drag: { x: number; y: number; vb: { x: number; y: number; w: number; h: number }; moved: boolean } | null = null;
  private box = viewChild.required<ElementRef<HTMLDivElement>>("box");
  private off?: () => void;

  constructor() {
    afterNextRender(() => {
      const el = this.box().nativeElement;
      const wheel = (e: WheelEvent) => { e.preventDefault(); const r = el.getBoundingClientRect(); this.zoom(Math.pow(1.0015, e.deltaY), (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); };
      el.addEventListener("wheel", wheel, { passive: false });
      this.off = () => el.removeEventListener("wheel", wheel);
    });
    // Recentre sur la sélection quand le nombre d’adresses change.
    let lastLen = -1;
    effect(() => {
      const spots = this.spots();
      if (spots.length === lastLen) return;
      lastLen = spots.length;
      if (!spots.length) return;
      const xs = spots.map((s) => s.mapX), ys = spots.map((s) => s.mapY);
      const w = Math.max(520, Math.max(...xs) - Math.min(...xs) + 320), h = w * 0.72;
      untracked(() => this.vb.set({ x: (Math.min(...xs) + Math.max(...xs)) / 2 - w / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 - h / 2 - 20, w, h }));
    });
  }
  ngOnDestroy() { this.off?.(); }

  zoom(f: number, cx = 0.5, cy = 0.5) {
    this.vb.update((v) => { const w = Math.min(1900, Math.max(260, v.w * f)), h = (w / v.w) * v.h; return { x: v.x + (v.w - w) * cx, y: v.y + (v.h - h) * cy, w, h }; });
  }
  down(e: PointerEvent) { this.drag = { x: e.clientX, y: e.clientY, vb: this.vb(), moved: false }; }
  move(e: PointerEvent) {
    const d = this.drag; if (!d) return;
    const r = (e.currentTarget as SVGElement).getBoundingClientRect();
    const dx = ((e.clientX - d.x) * d.vb.w) / r.width, dy = ((e.clientY - d.y) * d.vb.h) / r.height;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.moved) this.vb.set({ ...d.vb, x: d.vb.x - dx, y: d.vb.y - dy });
  }
  up() { setTimeout(() => (this.drag = null), 0); }
  click(s: any) { if (!this.drag?.moved) this.opened.emit(s); }
}

// Fiche d’une adresse : menu, photos, avis, infos. Les avis et photos viennent du serveur.
@Component({
  selector: "faza-spot-sheet",
  imports: [RouterLink, SocialLinks, Stars],
  host: { style: "display: contents" },
  template: `
    <aside class="sheet" [attr.aria-label]="'Fiche ' + spot().name" [style.--a]="spot().palette?.[0]" [style.--b]="spot().palette?.[1]">
      <header class="sheet__h">
        <button class="sheet__x" (click)="closed.emit()" aria-label="Fermer">✕</button>
        <h2 class="sticker-title sm">{{ spot().name }}</h2>
        <p>{{ spot().address }} · <i [class]="st().open ? 'ok' : 'ko'">{{ st().text }}</i></p>
        <p class="sheet__v">{{ spot().description }}</p>
      </header>
      <div class="tabs" role="tablist">
        @for (t of tabs(); track t[0]) { <button role="tab" [attr.aria-selected]="tab() === t[0]" (click)="tab.set(t[0])">{{ t[1] }}</button> }
      </div>
      <div class="sheet__b">
        @switch (tab()) {
          @case ("menu") {
            @for (d of mine(); track d.id) {
              <div class="menu"><h3>{{ d.emoji }} {{ d.name }}</h3>@for (m of d.menu; track m[0]) {<p><span>{{ m[0] }}</span><i></i><b>{{ price(m[1]) }}</b></p>}</div>
            }
            <p class="muted small">Prix indicatifs, à confirmer sur place.</p>
          }
          @case ("photos") {
            @if (details.data()?.photos?.length) {
              <div class="gallery">@for (u of details.data().photos; track u) {<img [src]="u" [alt]="'Photo de ' + spot().name" loading="lazy" />}</div>
            } @else { <div class="empty"><h3>Pas encore de photo</h3><p>Ajoute la première depuis la fiche complète.</p></div> }
          }
          @case ("avis") {
            @if (details.data()?.reviews?.length) {
              @for (r of details.data().reviews; track r.id) { <article class="rev"><div><b>{{ r.author }}</b> <faza-stars [value]="r.rating" /></div><p>{{ r.text }}</p></article> }
            } @else { <div class="empty"><h3>Pas encore d’avis</h3><p>Sois le premier à noter cette adresse.</p></div> }
          }
          @case ("infos") {
            <div><p><b>Horaires :</b> {{ spot().hours.replace("-", " – ") }}@if (spot().closedDay >= 0 && spot().closedDay != null) { · fermé le {{ days[spot().closedDay] }}}</p><p><b>Quartier :</b> {{ spot().address }}</p><faza-social [place]="spot()" /></div>
          }
        }
      </div>
      <footer class="sheet__f"><a class="btn btn--dark btn--block" [routerLink]="['/lieu', spot().slug]">Fiche complète, avis et carte précise</a></footer>
    </aside>
  `,
})
export class SpotSheet {
  spot = input.required<any>();
  dishes = input.required<any[]>();
  closed = output<void>();
  tab = signal("menu");
  days = DAYS;
  details = fetchData<any>(() => `/places/${this.spot().slug}`);
  st = computed(() => status(this.spot().hours, this.spot().closedDay ?? -1));
  mine = computed(() => this.dishes().filter((d) => this.spot().dishes.includes(d.id)));
  tabs = computed(() => { const n = this.details.data()?.reviews?.length; return [["menu", "Menu"], ["photos", "Photos"], ["avis", `Avis${n ? ` (${n})` : ""}`], ["infos", "Infos"]]; });
  price(p: number) { return dt(Math.round(p * (this.spot().priceFactor || 1) * 2) / 2); }
}

@Component({
  selector: "faza-benna",
  imports: [Loading, ErrorBox, PlanMap, SpotSheet],
  host: { style: "display: contents" },
  template: `
    @if (res.loading()) { <faza-loading /> }
    @else if (res.error()) { <faza-error [error]="res.error()" /> }
    @else if (res.data(); as data) {
      <div class="benna" [attr.data-view]="view()">
        <div class="benna__tabs" role="tablist">
          <button role="tab" [attr.aria-selected]="view() === 'carnet'" (click)="view.set('carnet')">Carnet</button>
          <button role="tab" [attr.aria-selected]="view() === 'carte'" (click)="view.set('carte')">Plan{{ dishName() ? " · " + dishName() : "" }}</button>
        </div>

        <section class="book" aria-label="Carnet Benna">
          <header class="book__head">
            <h1 class="sticker-title">Benna <span class="ar" lang="ar">بنّة</span></h1>
            <p>Le carnet gourmand de Tunis. Touche un plat pour voir qui le sert.</p>
          </header>
          @for (pg of [page()]; track pg) {
            <div class="paper" [attr.data-dir]="dir()">
              <h2 class="paper__t">{{ titles[pg] }}</h2>
              <div class="stickers">
                @for (d of pages()[pg]; track d.id; let i = $index) {
                  <button class="stk" [class.is-on]="dish() === d.id" [style.--c]="d.color" [style.--r]="((i * 37) % 9) - 4 + 'deg'" (click)="pick(d.id)" [attr.aria-pressed]="dish() === d.id">
                    <span class="tape"></span>
                    <span class="stk__img">@if (img[d.id]) {<img [src]="img[d.id]" alt="" loading="lazy" />} @else {<span class="stk__em">{{ d.emoji }}</span>}</span>
                    <span class="stk__n">{{ d.name }}</span>
                    <span class="stk__p">dès {{ minPrice(d) }}</span>
                  </button>
                }
              </div>
              <footer class="paper__nav">
                <button class="btn btn--ghost btn--sm" (click)="go(pg - 1)" [disabled]="pg === 0" aria-label="Page précédente">‹</button>
                <span class="dots">@for (x of pages(); track $index) {<button [class.on]="$index === pg" (click)="go($index)" [attr.aria-label]="'Page ' + ($index + 1)"></button>}</span>
                <button class="btn btn--ghost btn--sm" (click)="go(pg + 1)" [disabled]="pg === 5" aria-label="Page suivante">›</button>
              </footer>
            </div>
          }
          @if (dish()) { <button class="btn btn--dark btn--sm clear" (click)="dish.set(null)">Voir toutes les adresses ✕</button> }
          <p class="book__note">Adresses de démonstration : remplace-les par de vrais lieux (voir README).</p>
        </section>

        <section class="plan" aria-label="Plan de Tunis">
          <faza-plan-map [spots]="spots()" [active]="open()?.slug" (opened)="openSpot($event)" />
          <ul class="plan__list">
            @for (s of spots(); track s.id) {
              @let st = statusOf(s);
              <li><button class="scard" (click)="openSpot(s)" [style.--a]="s.palette?.[0]" [style.--b]="s.palette?.[1]">
                <span class="scard__th">{{ s.name[0] }}</span><span><b>{{ s.name }}</b><small>{{ s.address?.split(",").pop() }} · <i [class]="st.open ? 'ok' : 'ko'">{{ st.open ? "ouvert" : "fermé" }}</i></small></span></button></li>
            }
            @if (!spots().length) { <li class="muted">Aucune adresse pour ce plat.</li> }
          </ul>
          @if (open(); as o) { <faza-spot-sheet [spot]="o" [dishes]="data.dishes" (closed)="router.navigateByUrl('/benna')" /> }
        </section>
      </div>
    }
  `,
})
export class Benna {
  router = inject(Router);
  titles = PAGE_TITLES; img = IMAGES;
  res = fetchData<any>(() => "/benna");
  page = signal(0);
  dir = signal(1);
  dish = signal<string | null>(null);
  view = signal<"carnet" | "carte">("carnet"); // mobile : carnet | carte

  private url = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)), { initialValue: this.router.url });
  private slug = computed(() => { const p = this.url().split(/[?#]/)[0].split("/"); return p[2] === "lieu" ? decodeURIComponent(p[3] || "") : null; });
  private spotsAll = computed<any[]>(() => this.res.data()?.spots || []);
  spots = computed(() => { const d = this.dish(); return d ? this.spotsAll().filter((s) => s.dishes.includes(d)) : this.spotsAll(); });
  open = computed(() => this.spotsAll().find((s) => s.slug === this.slug()) || null);
  pages = computed<any[][]>(() => [1, 2, 3, 4, 5, 6].map((n) => (this.res.data()?.dishes || []).filter((d: any) => d.page === n)));
  dishName = computed(() => { const d = this.dish(); return d ? this.res.data()?.dishes.find((x: any) => x.id === d)?.name : ""; });

  go(n: number) { this.dir.set(n > this.page() ? 1 : -1); this.page.set(Math.max(0, Math.min(5, n))); }
  pick(id: string) { this.dish.set(this.dish() === id ? null : id); this.view.set("carte"); this.router.navigateByUrl("/benna"); }
  openSpot(s: any) { this.router.navigate(["/benna", "lieu", s.slug]); }
  minPrice(d: any) { return dt(Math.min(...d.menu.map((m: any) => m[1]))); }
  statusOf(s: any) { return status(s.hours, s.closedDay ?? -1); }
}
