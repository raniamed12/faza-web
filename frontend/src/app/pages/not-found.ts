import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "faza-not-found",
  imports: [RouterLink],
  template: `
    <div class="wrap section lost">
      <p class="lost__n" aria-hidden="true">4<span>🧭</span>4</p>
      <h1 class="h-lg">Tlifna ! <span class="ar" lang="ar">تلفنا</span></h1>
      <p class="lead">On s’est perdus dans la médina : cette page n’existe pas (encore). Pas de panique, toutes les ruelles mènent quelque part.</p>
      <div class="hero__cta" style="justify-content: center"><a class="btn btn--terra" routerLink="/">Retour à l’accueil</a><a class="btn btn--ghost" routerLink="/explorer">Explorer la carte</a></div>
    </div>
  `,
})
export class NotFound {}
