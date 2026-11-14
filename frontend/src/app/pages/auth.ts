import { Component, computed, inject, input, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../core/auth.service";
import { ToastService } from "../core/toast.service";
import { Scene } from "../components/scene";
import { Zellige } from "../components/deco";

// Inscription / connexion : validation côté client (retour immédiat) ET côté serveur (sécurité).
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: "faza-auth",
  imports: [RouterLink, FormsModule, Scene, Zellige],
  template: `
    <div class="wrap section authpage">
      <div class="authsplit">
        <aside class="authart" aria-hidden="true">
          <svg fazaScene [type]="reg() ? 'sea' : 'medina'" [seed]="reg() ? 'inscription' : 'connexion'"></svg>
          <svg fazaZellige [opacity]="0.1"></svg>
          <div class="authart__txt">
            <span class="ar" lang="ar">{{ reg() ? "مرحبا بيك" : "أهلا بيك" }}</span>
            <b>{{ reg() ? "Marhba bik !" : "Ahla bik !" }}</b>
            <ul>
              <li>♡ Garde tes adresses favorites</li>
              <li>✦ Enregistre et partage tes programmes</li>
              <li>📍 Propose tes secret spots</li>
            </ul>
          </div>
        </aside>
        <div class="authcard">
          <h1 class="h-lg">{{ reg() ? "Rejoins FAZA" : "Content de te revoir" }}</h1>
          <p class="muted" style="margin: .4rem 0 1.4rem">{{ reg() ? "Un compte pour garder tes favoris, enregistrer tes programmes et proposer des lieux." : "Connecte-toi pour retrouver tes favoris et tes programmes." }}</p>
          <form (ngSubmit)="submit()" novalidate>
            @if (reg()) {
              <label class="field"><span>Prénom</span><input class="input" autocomplete="given-name" name="name" [(ngModel)]="f.name" />@if (errs()['name']) {<small class="form-error" role="alert">{{ errs()['name'] }}</small>}</label>
            }
            <label class="field"><span>E-mail</span><input class="input" type="email" autocomplete="email" name="email" [(ngModel)]="f.email" />@if (errs()['email']) {<small class="form-error" role="alert">{{ errs()['email'] }}</small>}</label>
            <label class="field"><span>Mot de passe</span>
              <span class="pw"><input class="input" [type]="show() ? 'text' : 'password'" [autocomplete]="reg() ? 'new-password' : 'current-password'" name="password" [(ngModel)]="f.password" /><button type="button" (click)="show.set(!show())" [attr.aria-pressed]="show()">{{ show() ? "Masquer" : "Afficher" }}</button></span>
              @if (errs()['password']) {<small class="form-error" role="alert">{{ errs()['password'] }}</small>}
            </label>
            @if (reg()) {
              <label class="field"><span>Confirmer le mot de passe</span><input class="input" [type]="show() ? 'text' : 'password'" autocomplete="new-password" name="confirm" [(ngModel)]="f.confirm" />@if (errs()['confirm']) {<small class="form-error" role="alert">{{ errs()['confirm'] }}</small>}</label>
            }
            @if (errs()['form']) { <p class="form-error" role="alert">{{ errs()['form'] }}</p> }
            <button class="btn btn--terra btn--block" [disabled]="busy()">{{ busy() ? "Un instant…" : reg() ? "Créer mon compte" : "Me connecter" }}</button>
          </form>
          <p class="muted" style="margin-top: 1.2rem">
            @if (reg()) { Déjà inscrit ? <a class="link" routerLink="/connexion" [queryParams]="{ from: from() }">Connexion</a> }
            @else { Pas encore de compte ? <a class="link" routerLink="/inscription" [queryParams]="{ from: from() }">Inscription</a> }
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Auth {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  /** « login » ou « register » (donnée de la route). */
  mode = input<string>("login");
  /** Page à rouvrir après connexion (?from=…). */
  from = input<string>();
  reg = computed(() => this.mode() === "register");

  f = { name: "", email: "", password: "", confirm: "" };
  errs = signal<Record<string, string>>({});
  busy = signal(false);
  show = signal(false);

  private validate() {
    const f = this.f, e: Record<string, string> = {};
    if (this.reg() && f.name.trim().length < 2) e["name"] = "Entre ton prénom (2 lettres minimum).";
    if (!emailRe.test(f.email)) e["email"] = "Adresse e-mail invalide.";
    if (this.reg()) {
      if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e["password"] = "8 caractères minimum, avec au moins une lettre et un chiffre.";
      if (f.confirm !== f.password) e["confirm"] = "Les deux mots de passe ne sont pas identiques.";
    } else if (!f.password) e["password"] = "Entre ton mot de passe.";
    return e;
  }

  async submit() {
    const e = this.validate(); this.errs.set(e);
    if (Object.keys(e).length) return;
    this.busy.set(true);
    try {
      const f = this.f;
      const u = this.reg() ? await this.auth.register(f.name.trim(), f.email.trim(), f.password) : await this.auth.login(f.email.trim(), f.password);
      this.toast.show(this.reg() ? `Bienvenue ${u.name.split(" ")[0]} !` : `Content de te revoir ${u.name.split(" ")[0]}`);
      // N’accepte qu’un chemin interne, pour éviter toute redirection vers un autre site.
      const from = this.from();
      this.router.navigateByUrl(from && from.startsWith("/") && !from.startsWith("//") ? from : "/", { replaceUrl: true });
    } catch (x: any) { this.errs.set({ ...(x.fields || {}), form: x.message }); } finally { this.busy.set(false); }
  }
}
