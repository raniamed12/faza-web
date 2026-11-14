import { Component, computed, inject, input, linkedSignal, output, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../core/auth.service";
import { ToastService } from "../core/toast.service";
import { ApiService } from "../core/api.service";
import { RUB, TAG_LABEL, priceFrom } from "../lib/format";
import { PRECISION_LABEL, directionsLink, facebookLink, instagramLink, mapsLink } from "../lib/links";
import { Scene } from "./scene";
import { Zellige } from "./deco";

@Component({
  selector: "faza-logo",
  imports: [RouterLink],
  host: { style: "display: contents" },
  template: `<a routerLink="/" class="logo" aria-label="FAZA, accueil"><span class="logo__word">FAZA</span><span class="logo__ar ar">فازة</span></a>`,
})
export class Logo {}

@Component({
  selector: "faza-header",
  imports: [RouterLink, RouterLinkActive, Logo],
  template: `
    <header class="header">
      <div class="wrap header__in">
        <faza-logo />
        <button class="menu-btn" [attr.aria-expanded]="open()" aria-label="Menu" (click)="open.set(!open())">{{ open() ? "✕" : "☰" }}</button>
        <nav class="nav" [class.is-open]="open()" aria-label="Navigation principale" (click)="navClick($event)">
          <a routerLink="/explorer" routerLinkActive ariaCurrentWhenActive="page">Explorer</a>
          <a routerLink="/mix" routerLinkActive ariaCurrentWhenActive="page">FAZA MIX</a>
          <a routerLink="/benna" routerLinkActive ariaCurrentWhenActive="page">Benna</a>
          <a routerLink="/jaw-tounsna" routerLinkActive ariaCurrentWhenActive="page">Jaw Tounsna</a>
          <a routerLink="/communaute" routerLinkActive ariaCurrentWhenActive="page">Communauté</a>
          <span class="nav__sep"></span>
          @if (auth.user(); as user) {
            <div class="userbox">
              <button class="nav__btn" (click)="pop.set(!pop())" [attr.aria-expanded]="pop()">
                <span class="avatar">{{ user.name[0].toUpperCase() }}</span> {{ user.name.split(" ")[0] }}
              </button>
              @if (pop() || open()) {
                <div class="userbox__pop">
                  <div class="who">{{ user.email }}</div>
                  <a routerLink="/mon-espace" (click)="close()">Mon espace</a>
                  <a routerLink="/mon-espace" [queryParams]="{ tab: 'programmes' }" (click)="close()">Mes programmes</a>
                  <button (click)="logout()">Se déconnecter</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/connexion" class="nav__btn">Connexion</a>
            <a routerLink="/inscription" class="btn btn--terra">Créer un compte</a>
          }
        </nav>
      </div>
    </header>
  `,
})
export class Header {
  auth = inject(AuthService);
  private router = inject(Router);
  open = signal(false);
  pop = signal(false);
  close() { this.open.set(false); this.pop.set(false); }
  navClick(e: Event) { if ((e.target as HTMLElement).closest("a")) this.close(); }
  logout() { this.auth.logout(); this.close(); this.router.navigateByUrl("/"); }
}

@Component({
  selector: "faza-footer",
  imports: [RouterLink, Logo, Zellige],
  template: `
    <footer class="footer">
      <div class="footer__band" aria-hidden="true"><svg fazaZellige [opacity]="0.22" [size]="48"></svg></div>
      <div class="wrap">
        <div class="footer__top">
          <p class="footer__big">Yezzi mel <s>scroll</s>, <em>aya nokhrjou !</em></p>
          <a routerLink="/mix" class="btn btn--terra">Créer mon programme</a>
        </div>
        <div class="footer__grid">
          <div>
            <faza-logo />
            <p style="margin-top: .8rem; max-width: 26rem">La Tunisie à ta façon. Un guide collaboratif pour dormir, manger, sortir et découvrir, selon ton budget et ton ambiance.</p>
          </div>
          <div><h4>Explorer</h4><a routerLink="/explorer">La carte</a><a routerLink="/mix">FAZA MIX</a><a routerLink="/benna">Benna</a></div>
          <div><h4>Vivre</h4><a routerLink="/jaw-tounsna">Jaw Tounsna</a><a routerLink="/communaute">Communauté</a><a routerLink="/communaute/proposer">Proposer un lieu</a></div>
          <div><h4>Compte</h4><a routerLink="/connexion">Connexion</a><a routerLink="/inscription">Inscription</a><a routerLink="/mon-espace">Mon espace</a></div>
        </div>
        <div class="footer__note">
          <span>Prix et dates indicatifs. Carte © OpenStreetMap, frontières geoBoundaries (CC BY 4.0).</span>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {}

@Component({
  selector: "faza-stars",
  host: { style: "display: contents" },
  template: `<span class="stars" role="img" [attr.aria-label]="value() + ' sur 5'">{{ text() }}</span>`,
})
export class Stars {
  value = input(0);
  text = computed(() => { const n = Math.round(this.value() || 0); return "★".repeat(n) + "☆".repeat(5 - n); });
}

@Component({
  selector: "faza-loading",
  host: { style: "display: contents" },
  template: `<div class="wrap section" aria-busy="true">@for (r of list(); track $index) {<div class="skeleton" style="height: 90px; margin-bottom: 14px"></div>}</div>`,
})
export class Loading {
  rows = input(3);
  list = computed(() => Array.from({ length: this.rows() }));
}

@Component({
  selector: "faza-error",
  host: { style: "display: contents" },
  template: `<div class="wrap section"><div class="empty"><h3>Oups</h3><p>{{ error()?.message || "Impossible de charger cette page." }}</p></div></div>`,
})
export class ErrorBox {
  error = input<Error | null>();
}

// Photo si disponible, sinon illustration.
@Component({
  selector: "faza-place-visual",
  imports: [Scene],
  host: { style: "display: contents" },
  template: `
    @if (place().image) { <img class="pv" [src]="place().image" [alt]="place().name" loading="lazy" /> }
    @else { <svg fazaScene [type]="place().scene || 'medina'" [seed]="place().slug" [label]="'Illustration pour ' + place().name"></svg> }
  `,
})
export class PlaceVisual {
  place = input.required<any>();
}

@Component({
  selector: "faza-fav",
  host: { style: "display: contents" },
  template: `<button class="fav" [class.is-on]="fav()" (click)="toggle($event)" [attr.aria-pressed]="!!fav()" [attr.aria-label]="fav() ? 'Retirer des favoris' : 'Ajouter aux favoris'">{{ fav() ? "♥" : "♡" }}</button>`,
})
export class FavButton {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private api = inject(ApiService);
  place = input.required<any>();
  changed = output<boolean>();
  fav = linkedSignal(() => !!this.place().favorite);
  async toggle(e: Event) {
    e.preventDefault(); e.stopPropagation();
    if (!this.auth.user()) return this.toast.show("Connecte-toi pour garder tes favoris.", { action: { label: "Connexion", link: "/connexion" } });
    try {
      const id = this.place().id;
      const r = this.fav() ? await this.api.del(`/favorites/${id}`) : await this.api.put(`/favorites/${id}`);
      this.fav.set(r.favorite); this.changed.emit(r.favorite);
      this.toast.show(r.favorite ? "Ajouté à tes favoris" : "Retiré de tes favoris");
    } catch (err: any) { this.toast.show(err.message, { error: true }); }
  }
}

// Localisation + Facebook + Instagram d’un lieu.
@Component({
  selector: "faza-social",
  host: { style: "display: contents" },
  template: `
    <div class="social" [class.social--c]="compact()">
      <a [href]="maps()" target="_blank" rel="noopener noreferrer" class="social__a social__a--map">📍 {{ compact() ? "Carte" : "Localisation" }}</a>
      <a [href]="ig().href" target="_blank" rel="noopener noreferrer" class="social__a">Instagram@if (!ig().official) {<em> · recherche</em>}</a>
      <a [href]="fb().href" target="_blank" rel="noopener noreferrer" class="social__a">Facebook@if (!fb().official) {<em> · recherche</em>}</a>
      @if (!compact()) { <a [href]="dir()" target="_blank" rel="noopener noreferrer" class="social__a">Itinéraire</a> }
    </div>
  `,
})
export class SocialLinks {
  place = input.required<any>();
  compact = input(false);
  ig = computed(() => instagramLink(this.place()));
  fb = computed(() => facebookLink(this.place()));
  maps = computed(() => mapsLink(this.place()));
  dir = computed(() => directionsLink(this.place()));
}

/** Usage : <article fazaPlaceCard [place]="p"></article> */
@Component({
  selector: "article[fazaPlaceCard]",
  imports: [RouterLink, PlaceVisual, FavButton, SocialLinks],
  host: { class: "pcard" },
  template: `
    <a [routerLink]="['/lieu', place().slug]" class="pcard__img">
      <faza-place-visual [place]="place()" />
      <span class="pcard__rub" [style.background]="rub().color">{{ rub().name }}</span>
      @if (place().isGem) { <span class="pcard__gem">pépite</span> }
    </a>
    <faza-fav [place]="place()" (changed)="fav.emit($event)" />
    <div class="pcard__body">
      <h3 class="h-sm"><a [routerLink]="['/lieu', place().slug]">{{ place().name }}</a></h3>
      <p class="pcard__meta">{{ place().gov.name }} · {{ price() }}@if (place().rating) { · ★ {{ place().rating }}}</p>
      <p class="pcard__desc">{{ place().description }}</p>
      <div class="pcard__tags">@for (t of place().tags.slice(0, 3); track t) {<span class="tag">{{ tagLabel[t] || t }}</span>}</div>
      <faza-social [place]="place()" [compact]="true" />
      <p class="pcard__prec" [attr.title]="precLabel[place().precision]">{{ prec() }}</p>
    </div>
  `,
})
export class PlaceCard {
  place = input.required<any>();
  fav = output<boolean>();
  tagLabel = TAG_LABEL;
  precLabel = PRECISION_LABEL;
  rub = computed(() => RUB[this.place().category]);
  price = computed(() => priceFrom(this.place().price));
  prec = computed(() => { const p = this.place().precision; return p === "exact" ? "● Position exacte" : p === "quartier" ? "◐ Quartier" : "○ Secteur"; });
}
