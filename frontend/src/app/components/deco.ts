import { Component, computed, inject, input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Scene } from "./scene";
import { EVENT_LABEL, RUB, priceFrom } from "../lib/format";

// ───── Éléments décoratifs propres à FAZA : zellige, bandeaux de page, cartes postales, billets ─────

// Motif de zellige (étoile à huit branches) en SVG : couleur et opacité au choix.
let zid = 0;
/** Usage : <svg fazaZellige [opacity]="0.14" [size]="48"></svg> */
@Component({
  selector: "svg[fazaZellige]",
  template: "",
  host: { class: "zellige", "aria-hidden": "true", width: "100%", height: "100%", "[innerHTML]": "html()" },
})
export class Zellige {
  private san = inject(DomSanitizer);
  color = input("#EAD9B5");
  opacity = input(0.16);
  size = input(64);
  private id = `z${++zid}`;
  html = computed(() => {
    const star = (cx: number, cy: number) => `<g transform="translate(${cx} ${cy})"><rect x="-11" y="-11" width="22" height="22"/><rect x="-11" y="-11" width="22" height="22" transform="rotate(45)"/><circle r="3.4"/></g>`;
    const s = this.size();
    return this.san.bypassSecurityTrustHtml(
      `<defs><pattern id="${this.id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse" viewBox="0 0 64 64">` +
      `<g fill="none" stroke="${this.color()}" stroke-width="1.6" stroke-linejoin="round">${star(32, 32)}${star(0, 0)}${star(64, 0)}${star(0, 64)}${star(64, 64)}` +
      `<path d="M32 16.5 L32 0 M32 47.5 L32 64 M16.5 32 L0 32 M47.5 32 L64 32"/><path d="M16 16 L22 22 M48 16 L42 22 M16 48 L22 42 M48 48 L42 42"/></g>` +
      `</pattern></defs><rect width="100%" height="100%" fill="url(#${this.id})" opacity="${this.opacity()}"/>`);
  });
}

// Bandeau d’en-tête de page : couleur, zellige, grand mot arabe en filigrane, bord festonné.
// Contenu projeté : boutons d’action (par défaut) et bloc latéral (élément portant l’attribut `side`).
@Component({
  selector: "header[fazaPageHead]",
  imports: [Zellige],
  host: { "[class]": "'phead phead--' + tone()" },
  template: `
    <svg fazaZellige [color]="tone() === 'sable' ? '#0E2F4F' : '#EAD9B5'" [opacity]="tone() === 'sable' ? 0.08 : 0.14"></svg>
    @if (ar()) { <span class="phead__wm ar" lang="ar" aria-hidden="true">{{ ar() }}</span> }
    <div class="wrap phead__in">
      <div class="phead__txt">
        @if (kicker()) { <p class="phead__k">{{ kicker() }}</p> }
        <h1 class="h-lg">{{ title() }}@if (ar()) { <span class="ar phead__ar" lang="ar">{{ ar() }}</span>}</h1>
        @if (sub()) { <p class="phead__sub">{{ sub() }}</p> }
        @if (actions()) { <div class="phead__act"><ng-content /></div> }
      </div>
      @if (side()) { <div class="phead__side"><ng-content select="[side]" /></div> }
    </div>
    <div class="festoon" aria-hidden="true"></div>
  `,
})
export class PageHead {
  kicker = input<string>();
  title = input<string>();
  ar = input<string>();
  sub = input<string>();
  tone = input("bleu");
  /** Afficher la zone d’actions (contenu projeté par défaut). */
  actions = input(false);
  /** Afficher le bloc latéral (contenu projeté avec l’attribut `side`). */
  side = input(false);
}

// Ruban défilant de mots en derja (tunisien) avec leur traduction.
export const DERJA = [
  { w: "Fazza", ar: "فازة", fr: "la vibe, le délire du moment", ex: "Chniya el fazza lyoum ? — On fait quoi aujourd’hui ?" },
  { w: "Lakta", ar: "لقطة", fr: "la belle trouvaille, le bon plan", ex: "Hedhi lakta ! — Ça, c’est une trouvaille !" },
  { w: "Benna", ar: "بنّة", fr: "le bon goût, la saveur", ex: "Fiha benna ! — C’est délicieux !" },
  { w: "Blassa", ar: "بلاصة", fr: "un endroit, une adresse", ex: "Na3ref blassa mrigla. — Je connais un super coin." },
  { w: "Mrigel", ar: "مريقل", fr: "parfait, au top", ex: "El jaw mrigel. — L’ambiance est au top." },
  { w: "Jaw", ar: "جو", fr: "l’ambiance, la fête", ex: "Famma jaw el lila ? — Ça bouge ce soir ?" },
  { w: "Behi", ar: "باهي", fr: "d’accord, c’est bien", ex: "Behi, nemchiw ! — OK, on y va !" },
  { w: "Sahbi", ar: "صاحبي", fr: "mon pote", ex: "Ija m3aya sahbi. — Viens avec moi, mon pote." },
];

@Component({
  selector: "faza-marquee",
  template: `
    <div [class]="'marquee marquee--' + tone()" aria-label="Quelques mots de derja">
      <div class="marquee__track">
        @for (d of items; track $index) {
          <span class="marquee__it" [attr.aria-hidden]="$index >= half ? 'true' : null">
            <b>{{ d.w }}</b> <span class="ar" lang="ar">{{ d.ar }}</span> <em>{{ d.fr }}</em> <i class="marquee__star">✦</i>
          </span>
        }
      </div>
    </div>
  `,
})
export class Marquee {
  tone = input("terra");
  items = [...DERJA, ...DERJA];
  half = DERJA.length;
}

// Carte postale : pour les pépites. Timbre, tampon et mot manuscrit.
/** Usage : <a fazaPostcard [place]="p" [i]="i" [routerLink]="['/lieu', p.slug]"></a> */
@Component({
  selector: "a[fazaPostcard]",
  imports: [Scene],
  host: { class: "postcard", "[style.--rot]": "rot()" },
  template: `
    <div class="postcard__img">
      @if (place().image) { <img [src]="place().image" alt="" loading="lazy" /> } @else { <svg fazaScene [type]="place().scene || 'medina'" [seed]="place().slug"></svg> }
      <span class="postcard__greet">Bisous de {{ place().gov.name }}</span>
    </div>
    <div class="postcard__back">
      <div class="postcard__msg">
        <h3>{{ place().name }}</h3>
        <p>{{ place().description }}</p>
      </div>
      <div class="postcard__addr">
        <span class="stamp" [style.--c]="rub().color"><b>{{ price() }}</b><small>{{ rub().name }}</small></span>
        <span class="postmark" aria-hidden="true"><i>{{ place().gov.name }}</i><i>FAZA</i></span>
        <span class="postcard__lines" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>
    </div>
  `,
})
export class Postcard {
  place = input.required<any>();
  i = input(0);
  rub = computed(() => RUB[this.place().category]);
  price = computed(() => priceFrom(this.place().price));
  rot = computed(() => `${[-2, 1.5, -1, 2][this.i() % 4]}deg`);
}

// Billet d’événement : grand bloc de date, image, talon détachable.
const MON = ["JAN", "FÉV", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
@Component({
  selector: "faza-date-block",
  host: { style: "display: contents" },
  template: `
    <span class="dblock">
      <b>{{ a().getDate() }}@if (multi() && a().getMonth() === b().getMonth()) {<small>–{{ b().getDate() }}</small>}</b>
      <span>{{ mon[a().getMonth()] }}@if (multi() && a().getMonth() !== b().getMonth()) { → {{ b().getDate() }} {{ mon[b().getMonth()] }}}</span>
    </span>
  `,
})
export class DateBlock {
  start = input.required<string>();
  end = input.required<string>();
  mon = MON;
  a = computed(() => new Date(this.start() + "T12:00:00"));
  b = computed(() => new Date(this.end() + "T12:00:00"));
  multi = computed(() => this.start() !== this.end());
}

/** Usage : <article fazaEventTicket [e]="e"> … </article> ou <a fazaEventTicket [e]="e" routerLink="…"></a> */
@Component({
  selector: "[fazaEventTicket]",
  imports: [Scene, DateBlock],
  host: { class: "evt", "[class.evt--c]": "compact()" },
  template: `
    <div class="evt__img">
      <svg fazaScene [type]="e().scene" [seed]="e().slug"></svg>
      <faza-date-block [start]="e().start" [end]="e().end" />
      <span class="evt__cat">{{ label[e().category] }}</span>
    </div>
    <div class="evt__stub" aria-hidden="true"></div>
    <div class="evt__b">
      <h3 class="h-sm">{{ e().title }}</h3>
      <p class="evt__where">📍 {{ e().venue ? e().venue + ', ' : '' }}{{ e().gov.name }}</p>
      <div class="evt__row">
        <span class="evt__price" [class.is-free]="e().price === 0">{{ price() }}</span>
        @if (!e().confirmed) { <span class="evt__tbc">date à confirmer</span> }
      </div>
      <ng-content />
    </div>
  `,
})
export class EventTicket {
  e = input.required<any>();
  compact = input(false);
  label = EVENT_LABEL;
  price = computed(() => priceFrom(this.e().price));
}

// Petite illustration pour les états vides : une porte bleue de Sidi Bou Saïd entrouverte.
// Contenu projeté : le texte (par défaut) et un bouton d’action (élément portant l’attribut `action`).
@Component({
  selector: "faza-empty-door",
  host: { style: "display: contents" },
  template: `
    <div class="emptyd">
      <svg viewBox="0 0 120 150" class="emptyd__door" aria-hidden="true">
        <path d="M10 148 V60 a50 50 0 0 1 100 0 V148Z" fill="#fff" stroke="#EAD9B5" stroke-width="3" />
        <path d="M22 148 V64 a38 38 0 0 1 76 0 V148Z" fill="#17497A" />
        <path d="M60 26 V148" stroke="#0E2F4F" stroke-width="2" />
        @for (c of studs; track $index) { <circle [attr.cx]="c[0]" [attr.cy]="c[1]" r="2" fill="#EAD9B5" /> }
        <circle cx="70" cy="104" r="4" fill="none" stroke="#EAD9B5" stroke-width="2" />
      </svg>
      <h3 class="h-sm">{{ title() }}</h3>
      <div class="muted"><ng-content /></div>
      <ng-content select="[action]" />
    </div>
  `,
})
export class EmptyDoor {
  title = input<string>();
  studs = Array.from({ length: 16 }, (_, i) => [[32, 46, 74, 88][i % 4], 72 + Math.floor(i / 4) * 16]);
}
