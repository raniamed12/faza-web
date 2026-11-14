import { Component, inject } from "@angular/core";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter, map } from "rxjs";
import { Header, Footer } from "./components/common";
import { ToastsComponent } from "./core/toast.service";

@Component({
  selector: "faza-root",
  imports: [RouterOutlet, Header, Footer, ToastsComponent],
  template: `
    <a class="sr-only" href="#main" (click)="skip($event)">Aller au contenu</a>
    <faza-header />
    <main id="main"><router-outlet /></main>
    @if (!immersive()) { <faza-footer /> }
    <faza-toasts />
  `,
})
export class App {
  private router = inject(Router);
  private url = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map((e) => (e as NavigationEnd).urlAfterRedirects)), { initialValue: this.router.url });
  // Benna occupe tout l’écran : pas de pied de page.
  immersive = () => this.url().startsWith("/benna");

  skip(e: Event) { e.preventDefault(); const m = document.getElementById("main"); m?.setAttribute("tabindex", "-1"); m?.focus(); }

  constructor() {
    // Retour en haut de page à chaque changement de page (sauf dans Benna, qui gère son propre écran).
    let last = "";
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      const path = (e as NavigationEnd).urlAfterRedirects.split(/[?#]/)[0];
      if (path !== last && !path.startsWith("/benna")) window.scrollTo(0, 0);
      last = path;
    });
  }
}
