import { Component, computed, inject, input, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Loading, PlaceCard } from "../components/common";
import { Program } from "../components/program";
import { EmptyDoor, PageHead } from "../components/deco";
import { AuthService } from "../core/auth.service";
import { ToastService } from "../core/toast.service";
import { ApiService } from "../core/api.service";
import { fetchData } from "../core/fetch";
import { RUB } from "../lib/format";

const STATUS: Record<string, string> = { pending: "En attente", approved: "Publié", rejected: "Refusé" };

@Component({
  selector: "faza-my-space",
  imports: [RouterLink, Loading, PlaceCard, Program, EmptyDoor, PageHead],
  template: `
    @if (auth.user(); as user) {
    <header fazaPageHead tone="sable" [kicker]="isAdmin() ? 'Mon espace · administrateur' : 'Mon espace'" [title]="'Ahla, ' + user.name.split(' ')[0] + ' !'" ar="أهلا" [side]="true"
      sub="Tes lieux favoris, tes programmes FAZA MIX et les adresses que tu as proposées, au même endroit.">
      <div side class="me">
        <span class="me__av">{{ user.name[0].toUpperCase() }}</span>
        <div class="me__stats">
          <div><b>{{ favs.data()?.length ?? "…" }}</b><span>favoris</span></div>
          <div><b>{{ progs.data()?.length ?? "…" }}</b><span>programmes</span></div>
          <div><b>{{ mine.data()?.length ?? "…" }}</b><span>propositions</span></div>
        </div>
      </div>
    </header>
    <div class="wrap section">
      <div class="tabs" role="tablist">@for (t of tabs(); track t[0]) {<button role="tab" [attr.aria-selected]="cur() === t[0]" (click)="go(t[0])">{{ t[1] }}</button>}</div>

      @switch (cur()) {
        @case ("favoris") {
          @if (favs.loading() && !favs.data()) { <faza-loading [rows]="2" /> }
          @else if (!favs.data()?.length) { <faza-empty-door title="Aucun favori pour l’instant">Touche le cœur ♡ d’un lieu pour le retrouver ici.<a action class="btn btn--dark" routerLink="/explorer">Explorer</a></faza-empty-door> }
          @else { <div class="grid3">@for (p of favs.data(); track p.id) { <article fazaPlaceCard [place]="p" (fav)="refreshSoon()"></article> }</div> }
        }
        @case ("programmes") {
          @if (progs.loading() && !progs.data()) { <faza-loading [rows]="2" /> }
          @else if (!progs.data()?.length) { <faza-empty-door title="Aucun programme">Génère-en un avec FAZA MIX puis enregistre-le.<a action class="btn btn--dark" routerLink="/mix">Ouvrir FAZA MIX</a></faza-empty-door> }
          @else {
            @for (p of progs.data(); track p.id) {
              <article class="myprog">
                <div class="myprog__h"><div><h3 class="h-sm">{{ p.title }}</h3><p class="muted small">{{ p.days }} jour{{ p.days > 1 ? "s" : "" }} · {{ p.people }} pers. · {{ p.items.length }} étapes</p></div>
                  <div class="myprog__a"><button class="btn btn--sm btn--ghost" (click)="open.set(open() === p.id ? null : p.id)">{{ open() === p.id ? "Fermer" : "Voir" }}</button>
                    <button class="btn btn--sm btn--ghost" (click)="share(p)">{{ p.visibility === "shared" ? "Ne plus partager" : "Partager" }}</button>
                    @if (p.shareCode && p.visibility === "shared") { <button class="btn btn--sm btn--dark" (click)="copy(p)">Copier le lien</button> }
                    <button class="btn btn--sm btn--ghost" (click)="del(p)">Supprimer</button></div></div>
                @if (open() === p.id) { <faza-program [program]="p" /> }
              </article>
            }
          }
        }
        @case ("propositions") {
          @if (mine.loading() && !mine.data()) { <faza-loading [rows]="2" /> }
          @else if (!mine.data()?.length) { <faza-empty-door title="Aucune proposition">Tu connais une adresse que les guides oublient ?<a action class="btn btn--dark" routerLink="/communaute/proposer">Proposer un lieu</a></faza-empty-door> }
          @else {
            @for (p of mine.data(); track p.id) {
              <article class="myprog"><div class="myprog__h"><div><h3 class="h-sm">{{ p.name }}</h3><p class="muted small">{{ rub[p.category].name }} · {{ p.gov.name }}</p></div>
                <span [class]="'status status--' + p.status">{{ status[p.status] }}</span></div></article>
            }
          }
        }
        @case ("moderation") {
          @if (pending.loading() && !pending.data()) { <faza-loading [rows]="2" /> }
          @else if (!pending.data()?.length) { <faza-empty-door title="Rien à valider">Les nouvelles propositions apparaîtront ici.</faza-empty-door> }
          @else {
            @for (p of pending.data(); track p.id) {
              <article class="myprog"><div class="myprog__h"><div><h3 class="h-sm">{{ p.name }} <small class="muted">par {{ p.author?.name }}</small></h3><p class="small">{{ p.description }}</p>
                <p class="muted small">{{ p.lat }}, {{ p.lng }} · <a class="link" target="_blank" rel="noopener noreferrer" [href]="'https://www.openstreetmap.org/?mlat=' + p.lat + '&mlon=' + p.lng + '#map=17/' + p.lat + '/' + p.lng">voir sur la carte</a>@if (p.instagram) { · <a class="link" target="_blank" rel="noopener noreferrer" [href]="p.instagram">Instagram</a>}@if (p.facebook) { · <a class="link" target="_blank" rel="noopener noreferrer" [href]="p.facebook">Facebook</a>}</p></div>
                <div class="myprog__a"><button class="btn btn--sm btn--dark" (click)="decide(p.id, 'approve')">Publier</button><button class="btn btn--sm btn--ghost" (click)="decide(p.id, 'reject')">Refuser</button></div></div></article>
            }
          }
        }
      }
    </div>
    }
  `,
})
export class MySpace {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  /** Onglet courant (?tab=…). */
  tab = input<string>();
  cur = computed(() => this.tab() || "favoris");
  isAdmin = computed(() => this.auth.user()?.role === "admin");
  tabs = computed(() => [["favoris", "Favoris"], ["programmes", "Programmes"], ["propositions", "Mes propositions"], ...(this.isAdmin() ? [["moderation", "Modération"]] : [])]);
  rub = RUB; status = STATUS;
  open = signal<number | null>(null);

  favs = fetchData<any[]>(() => "/favorites");
  progs = fetchData<any[]>(() => "/programs");
  mine = fetchData<any[]>(() => "/community/mine");
  pending = fetchData<any[]>(() => (this.isAdmin() ? "/admin/pending" : null));

  private reloadAll() { this.favs.reload(); this.progs.reload(); this.mine.reload(); this.pending.reload(); }
  refreshSoon() { setTimeout(() => this.reloadAll(), 300); }
  go(t: string) { this.router.navigate([], { queryParams: { tab: t } }); }

  async share(p: any) {
    try {
      const r = await this.api.patch(`/programs/${p.id}`, { visibility: p.visibility === "shared" ? "private" : "shared" });
      this.toast.show(r.program.visibility === "shared" ? "Programme partagé" : "Programme redevenu privé"); this.reloadAll();
    } catch (x: any) { this.toast.show(x.message, { error: true }); }
  }
  async del(p: any) {
    if (!confirm(`Supprimer « ${p.title} » ?`)) return;
    try { await this.api.del(`/programs/${p.id}`); this.reloadAll(); } catch (x: any) { this.toast.show(x.message, { error: true }); }
  }
  async decide(id: number, what: string) {
    try { await this.api.post(`/admin/places/${id}/${what}`); this.toast.show(what === "approve" ? "Lieu publié" : "Lieu refusé"); this.reloadAll(); }
    catch (x: any) { this.toast.show(x.message, { error: true }); }
  }
  copy(p: any) { navigator.clipboard?.writeText(`${location.origin}/programme/${p.shareCode}`); this.toast.show("Lien copié"); }
}
