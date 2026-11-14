import { Component, ElementRef, computed, effect, inject, input, signal, viewChild } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MapHover, TunisiaMap } from "../components/tunisia-map";
import { Scene } from "../components/scene";
import { DERJA, EventTicket, Marquee, Postcard, Zellige } from "../components/deco";
import { fetchData } from "../core/fetch";
import { ApiService } from "../core/api.service";
import { GEMS, NEWS, RUBRIQUES, SLOT_LABEL, dt } from "../lib/format";

// ───── L’élément fort de l’accueil : la carte vivante ─────
// Choisis une ambiance → les gouvernorats s’illuminent selon ce qu’ils offrent vraiment.
// Clique un gouvernorat → son « billet » s’ouvre. Le programme FAZA MIX se recalcule en direct.
const MOODS = [
  { id: "mer", label: "Mer & plage", ar: "بحر" },
  { id: "desert", label: "Désert", ar: "صحرا" },
  { id: "culture", label: "Culture", ar: "تاريخ" },
  { id: "nature", label: "Nature", ar: "طبيعة" },
  { id: "gastronomie", label: "Bonne table", ar: "ماكلة" },
  { id: "detente", label: "Détente", ar: "راحة" },
  { id: "sport", label: "Sport", ar: "رياضة" },
  { id: "fete", label: "Fêtes", ar: "فرحة" },
];

const DOORS = [
  { to: "/explorer", q: { rub: "sleep" }, name: "Win nbatou ?", ar: "وين نبيتو؟", fr: "Où dormir ?", color: "#17497A" },
  { to: "/benna", q: null, name: "Benna", ar: "بنّة", fr: "Où manger ?", color: "#D62839" },
  { to: "/explorer", q: { rub: "do" }, name: "Win nemchiw ?", ar: "وين نمشيو؟", fr: "Que faire ?", color: "#C65D3B" },
  { to: "/explorer", q: { rub: "discover" }, name: "Lakta", ar: "لقطة", fr: "Que découvrir ?", color: "#0E2F4F" },
  { to: "/jaw-tounsna", q: null, name: "Jaw Tounsna", ar: "جو تونسنا", fr: "Quoi de neuf ?", color: "#2F6B55" },
  { to: "/explorer", q: { gem: "1" }, name: "Secret spot", ar: "بلايص مخبّية", fr: "Les pépites", color: "#8B5A2B" },
];

// Aperçu du moteur FAZA MIX : budget → programme recalculé en direct pour le gouvernorat affiché sur la carte.
@Component({
  selector: "faza-mix-teaser",
  imports: [RouterLink],
  host: { style: "display: contents" },
  template: `
    <section class="section teaser">
      <div class="wrap teaser__grid">
        <div>
          <h2 class="h-lg">Ton budget, notre plan</h2>
          <p class="lead">Une journée à <b>{{ gov()?.name || "…" }}</b>. Bouge le curseur : le programme se recalcule, sans dépasser ton budget.</p>
          <label class="range">
            <span>Budget par personne : <b>{{ budget() }} DT</b></span>
            <input type="range" min="30" max="400" step="10" [value]="budget()" (input)="budget.set(+$any($event.target).value)" />
          </label>
          <a class="btn btn--terra" routerLink="/mix" [queryParams]="{ gov: gov()?.slug || '', budget: budget(), prefs: mood() }">Personnaliser ce programme</a>
        </div>
        <ol class="tl tl--mini" aria-live="polite">
          @if (err()) { <li class="empty">{{ err()!.message }}</li> }
          @for (it of res()?.items || []; track $index) {
            <li class="tl__it">
              <span class="tl__slot">{{ slot[it.slot] }}</span>
              <span class="tl__name">{{ it.place.name }}</span>
              <span class="tl__cost">{{ dt(it.cost) }}</span>
            </li>
          }
          @if (res()) { <li class="tl__tot"><span>Total par personne</span><b>{{ dt(res().perPerson) }}</b></li> }
        </ol>
      </div>
    </section>
  `,
})
export class MixTeaser {
  private api = inject(ApiService);
  gov = input<any>(null);
  mood = input("mer");
  budget = signal(120);
  res = signal<any>(null);
  err = signal<Error | null>(null);
  slot = SLOT_LABEL; dt = dt;
  constructor() {
    effect((onCleanup) => {
      const gov = this.gov(), budget = this.budget(), mood = this.mood();
      if (!gov) return;
      const t = setTimeout(() => {
        this.api.post("/mix", { governorate: gov.slug, budget, days: 1, people: 2, prefs: mood === "fete" ? [] : [mood], seed: 7 })
          .then((r) => { this.res.set(r); this.err.set(null); }).catch((e) => this.err.set(e));
      }, 250);
      onCleanup(() => clearTimeout(t));
    });
  }
}

// Quelques chiffres, calculés à partir des vraies données de l’API.
@Component({
  selector: "faza-stats",
  host: { style: "display: contents" },
  template: `
    <div class="stats" style="margin-bottom: 3.5rem">
      <div><b>{{ govs().length }}</b><span>gouvernorats</span><small>du Cap Bon au Sahara</small></div>
      <div><b>{{ places() }}</b><span>adresses</span><small>avec leur position sur la carte</small></div>
      <div><b>{{ events() }}</b><span>rendez-vous</span><small>festivals, marchés, randos</small></div>
      <div><b>{{ regions() }}</b><span>régions</span><small>et autant d’accents</small></div>
    </div>
  `,
})
export class Stats {
  govs = input.required<any[]>();
  places = computed(() => this.govs().reduce((a, g) => a + g.total, 0));
  events = computed(() => this.govs().reduce((a, g) => a + g.events, 0));
  regions = computed(() => new Set(this.govs().map((g) => g.region)).size);
}

// Le petit dico de la derja : chaque carte se retourne pour montrer le sens et un exemple.
const DICO_COLORS = ["#17497A", "#D62839", "#C65D3B", "#0E2F4F", "#2F6B55", "#8B5A2B", "#2B6AA3", "#A44A2D"];
@Component({
  selector: "faza-dico",
  imports: [Zellige],
  host: { style: "display: contents" },
  template: `
    <section class="section doors-sec">
      <div class="wrap">
        <div class="section__head">
          <div><p class="eyebrow">Parle comme nous</p><h2 class="h-lg">Le petit dico de la derja</h2><p class="muted" style="margin-top: .4rem">Les mots de FAZA, en tunisien. Survole (ou touche) une carte pour la retourner.</p></div>
        </div>
        <div class="dico">
          @for (d of derja; track d.w; let i = $index) {
            <button class="dcard" [style.--c]="colors[i]" [attr.aria-pressed]="on() === i" (click)="on.set(on() === i ? null : i)" [attr.aria-label]="d.w + ' : ' + d.fr">
              <span class="dcard__in">
                <span class="dcard__f"><svg fazaZellige [opacity]="0.12" [size]="48"></svg><span class="ar" lang="ar">{{ d.ar }}</span><span><b>{{ d.w }}</b><br /><small>retourne-moi ↻</small></span></span>
                <span class="dcard__b"><p>{{ d.fr }}</p><em>{{ d.ex }}</em></span>
              </span>
            </button>
          }
        </div>
      </div>
    </section>
  `,
})
export class Dico {
  derja = DERJA;
  colors = DICO_COLORS;
  on = signal<number | null>(null);
}

@Component({
  selector: "faza-home",
  imports: [RouterLink, TunisiaMap, Scene, Marquee, Postcard, EventTicket, Zellige, MixTeaser, Stats, Dico],
  templateUrl: "./home.html",
})
export class Home {
  moods = MOODS; doors = DOORS; rubriques = RUBRIQUES; news = NEWS; gems = GEMS;
  studs = Array.from({ length: 24 });

  govsF = fetchData<any[]>(() => "/governorates");
  eventsF = fetchData<any[]>(() => "/events");
  gemsF = fetchData<any[]>(() => "/places?gem=1&limit=6");

  mood = signal("mer");
  sel = signal<string | null>(null);
  hov = signal<string | null>(null);
  tip = signal<{ slug: string; x: number; y: number } | null>(null);
  spin = signal<string | null>(null);
  private mapBox = viewChild<ElementRef<HTMLDivElement>>("mapBox");

  values = computed(() => {
    const govs = this.govsF.data(), mood = this.mood();
    if (!govs) return null;
    const max = Math.max(1, ...govs.map((g) => g.affinity[mood] || 0));
    return Object.fromEntries(govs.map((g) => [g.slug, (g.affinity[mood] || 0) / max]));
  });
  bySlug = computed<Record<string, any>>(() => Object.fromEntries((this.govsF.data() || []).map((g) => [g.slug, g])));
  // Gouvernorat par défaut : le plus « chaud » pour l’ambiance choisie.
  best = computed(() => {
    const govs = this.govsF.data(), mood = this.mood();
    return govs ? [...govs].sort((a, b) => (b.affinity[mood] || 0) - (a.affinity[mood] || 0))[0]?.slug : null;
  });
  current = computed(() => this.sel() || this.best());
  gov = computed(() => (this.current() ? this.bySlug()[this.current()!] : null));
  moodLabel = computed(() => MOODS.find((m) => m.id === this.mood())!.label.toLowerCase());

  setMood(id: string) { this.mood.set(id); this.sel.set(null); }

  surprise() {
    const govs = this.govsF.data();
    if (!govs) return;
    const pool = govs.filter((g) => (g.affinity[this.mood()] || 0) > 0);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    let i = 0;
    const seq = [...Array(9)].map(() => govs[Math.floor(Math.random() * govs.length)].slug).concat(pick.slug);
    const t = setInterval(() => { this.spin.set(seq[i]); if (++i >= seq.length) { clearInterval(t); this.spin.set(null); this.sel.set(pick.slug); } }, 110);
  }

  onHover(h: MapHover) {
    this.hov.set(h.slug);
    const box = this.mapBox()?.nativeElement;
    const e = h.event as MouseEvent | undefined;
    if (!h.slug || !box || !e?.clientX) return this.tip.set(null);
    const r = box.getBoundingClientRect();
    this.tip.set({ slug: h.slug, x: e.clientX - r.left, y: e.clientY - r.top });
  }

  countLabel(fr: string) { return fr.replace(" ?", "").toLowerCase(); }
}
