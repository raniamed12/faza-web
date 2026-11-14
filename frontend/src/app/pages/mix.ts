import { Component, computed, effect, inject, input, signal, untracked } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Program } from "../components/program";
import { PageHead } from "../components/deco";
import { AuthService } from "../core/auth.service";
import { ToastService } from "../core/toast.service";
import { ApiService } from "../core/api.service";
import { fetchData } from "../core/fetch";
import { TAG_LABEL } from "../lib/format";

const PREFS = ["nature", "culture", "gastronomie", "sport", "detente", "mer", "desert"];

@Component({
  selector: "faza-mix",
  imports: [RouterLink, FormsModule, Program, PageHead],
  template: `
    <header fazaPageHead tone="bleu" kicker="Le générateur de sorties" title="FAZA MIX" ar="ميكس" [side]="true"
      sub="Donne ton budget et tes envies : on compose un programme complet, matin, midi et soir. Pas d’IA, des règles claires et un budget respecté.">
      <div side class="mixbadge" aria-hidden="true"><b>0 DT</b><span>de dépassement</span><small>c’est la règle</small></div>
    </header>
    <div class="wrap section mix">
      <div class="mix__grid">
        <form class="mixform" (ngSubmit)="generate()" novalidate>
          <label class="field"><span>Gouvernorat</span>
            <select class="input" name="governorate" [(ngModel)]="f.governorate">@for (g of govs.data() || []; track g.slug) { <option [value]="g.slug">{{ g.name }}</option> }</select>
            @if (errs().governorate) { <small class="form-error">{{ errs().governorate }}</small> }
          </label>
          <label class="field"><span>Budget par personne (DT)</span><input class="input" type="number" min="10" max="2000" name="budget" [(ngModel)]="f.budget" />@if (errs().budget) {<small class="form-error">{{ errs().budget }}</small>}</label>
          <div class="row2">
            <label class="field"><span>Durée</span><select class="input" name="days" [(ngModel)]="f.days"><option [ngValue]="1">1 jour</option><option [ngValue]="2">Week-end (2 jours)</option><option [ngValue]="3">3 jours</option></select></label>
            <label class="field"><span>Personnes</span><input class="input" type="number" min="1" max="12" name="people" [(ngModel)]="f.people" />@if (errs().people) {<small class="form-error">{{ errs().people }}</small>}</label>
          </div>
          <fieldset class="field"><legend>Tes envies</legend>
            <div class="chips">@for (p of prefs; track p) { <button type="button" class="chip" [attr.aria-pressed]="f.prefs.includes(p)" (click)="togglePref(p)">{{ tagLabel[p] }}</button> }</div>
          </fieldset>
          @if (errs().form) { <p class="form-error" role="alert">{{ errs().form }}</p> }
          <button class="btn btn--terra btn--block" [disabled]="busy()">{{ busy() ? "On compose…" : res() ? "Générer un autre programme" : "Générer mon programme" }}</button>
        </form>

        <div aria-live="polite">
          @if (!res()) {
            <div class="mixempty">
              <div class="mixempty__ticket" aria-hidden="true">
                @for (s of slots; track s; let i = $index) { <div [style.--d]="i * 120 + 'ms'"><span>{{ s }}</span><i></i><b>?? DT</b></div> }
              </div>
              <h3 class="h-sm">Ton programme apparaîtra ici</h3>
              <p class="muted">Choisis un gouvernorat, un budget et tes envies, puis lance la génération. Tu pourras ensuite remplacer chaque étape.</p>
            </div>
          } @else {
            <h2 class="h-md" style="margin-bottom: .4rem">{{ res().title }}</h2>
            @for (n of res().notes; track $index) { <p class="notice" style="margin-bottom: .6rem">{{ n }}</p> }
            <p class="muted small" style="margin-bottom: 1rem">Les prix sont indicatifs. Remplace ou retire une étape : le total se met à jour.</p>
            <faza-program [program]="res()" [editable]="true" (replace)="replace($event.idx, $event.alt)" (remove)="remove($event)" />
            <div class="prog__actions">
              @if (auth.user()) {
                <button class="btn btn--dark" (click)="save(false)">Enregistrer</button><button class="btn btn--ghost" (click)="save(true)">Enregistrer et partager</button>
              } @else {
                <p class="notice"><a class="link" routerLink="/connexion" [queryParams]="{ from: '/mix' }">Connecte-toi</a> pour enregistrer ou partager ce programme.</p>
              }
            </div>
            @if (link(); as l) {
              <div class="notice" style="margin-top: .8rem">Lien à partager : <input class="input" readonly [value]="l" (focus)="$any($event.target).select()" /> <button class="btn btn--sm btn--dark" (click)="copy(l)">Copier</button></div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class Mix {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  // Paramètres d’URL : ?gov=…&budget=…&prefs=a,b
  gov = input<string>(); budget = input<string>(); prefsQ = input<string>(undefined, { alias: "prefs" });

  prefs = PREFS; tagLabel = TAG_LABEL; slots = ["Matin", "Midi", "Après-midi", "Soir"];
  govs = fetchData<any[]>(() => "/governorates");
  f = { governorate: "tunis", budget: 150 as number | string, days: 1, people: 2 as number | string, prefs: [] as string[] };
  res = signal<any>(null);
  errs = signal<Record<string, string>>({});
  busy = signal(false);
  saved = signal<any>(null);
  link = computed(() => (this.saved()?.shareCode ? `${location.origin}/programme/${this.saved().shareCode}` : null));

  constructor() {
    // Pré-remplit le formulaire depuis l’URL (venant de l’accueil ou d’une page gouvernorat).
    effect(() => {
      const gov = this.gov(), budget = this.budget(), prefs = this.prefsQ();
      untracked(() => {
        if (gov) this.f.governorate = gov;
        if (+budget!) this.f.budget = +budget!;
        if (prefs != null) this.f.prefs = prefs.split(",").filter((x) => PREFS.includes(x));
      });
    });
  }

  togglePref(p: string) { this.f.prefs = this.f.prefs.includes(p) ? this.f.prefs.filter((x) => x !== p) : [...this.f.prefs, p]; }

  async generate() {
    this.busy.set(true); this.errs.set({}); this.saved.set(null);
    try { this.res.set(await this.api.post("/mix", { ...this.f, budget: +this.f.budget, days: +this.f.days, people: +this.f.people, seed: Math.floor(Math.random() * 100000) })); }
    catch (x: any) { this.errs.set(Object.keys(x.fields || {}).length ? x.fields : { form: x.message }); this.toast.show(x.message, { error: true }); }
    finally { this.busy.set(false); }
  }

  replace(idx: number, alt: any) {
    if (!alt) return;
    this.res.update((r) => ({ ...r, items: r.items.map((it: any, i: number) => (i === idx ? { ...it, place: alt, cost: alt.price, alternatives: it.alternatives.filter((a: any) => a.id !== alt.id).concat(it.place) } : it)) }));
  }
  remove(idx: number) { this.res.update((r) => ({ ...r, items: r.items.filter((_: any, i: number) => i !== idx) })); }

  async save(share: boolean) {
    const res = this.res();
    try {
      const { program } = await this.api.post("/programs", { title: res.title, governorate: res.governorate.slug, budget: res.budget, days: res.days, people: res.people, prefs: res.prefs, items: res.items.map((i: any) => ({ day: i.day, slot: i.slot, placeId: i.place.id, cost: i.cost })) });
      let p = program;
      if (share) p = (await this.api.patch(`/programs/${program.id}`, { visibility: "shared" })).program;
      this.saved.set(p); this.toast.show(share ? "Programme enregistré et partagé" : "Programme enregistré dans ton espace");
    } catch (x: any) { this.toast.show(x.message, { error: true }); }
  }
  copy(l: string) { navigator.clipboard?.writeText(l); this.toast.show("Lien copié"); }
}
