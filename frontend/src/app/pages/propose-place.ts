import { Component, ElementRef, OnDestroy, afterNextRender, effect, inject, input, output, signal, untracked, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import * as L from "leaflet";
import { PageHead } from "../components/deco";
import { ToastService } from "../core/toast.service";
import { ApiService } from "../core/api.service";
import { fetchData } from "../core/fetch";
import { RUBRIQUES, TAG_LABEL } from "../lib/format";

// Icône par défaut de Leaflet, servie depuis le dossier public/leaflet (copié depuis node_modules).
const icon = L.icon({ iconUrl: "/leaflet/marker-icon.png", iconRetinaUrl: "/leaflet/marker-icon-2x.png", shadowUrl: "/leaflet/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

// Carte où l’on clique pour placer le lieu : la position exacte est obligatoire.
@Component({
  selector: "faza-pick-map",
  host: { style: "display: contents" },
  template: `<div #el class="placemap" style="height: 340px" aria-label="Carte : clique pour placer le lieu"></div>`,
})
export class PickMap implements OnDestroy {
  value = input<[number, number] | null>(null);
  picked = output<[number, number]>();
  private el = viewChild.required<ElementRef<HTMLDivElement>>("el");
  private map: L.Map | null = null;
  private mk: L.Marker | null = null;
  private ready = signal(false);

  constructor() {
    afterNextRender(() => {
      this.map = L.map(this.el().nativeElement, { scrollWheelZoom: false }).setView([34.2, 9.6], 6);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(this.map);
      this.map.on("click", (e: L.LeafletMouseEvent) => this.picked.emit([+e.latlng.lat.toFixed(6), +e.latlng.lng.toFixed(6)]));
      setTimeout(() => this.map?.invalidateSize(), 80);
      this.ready.set(true);
    });
    effect(() => {
      const v = this.value();
      if (!this.ready() || !v) return;
      untracked(() => {
        if (!this.mk) this.mk = L.marker(v, { draggable: true, icon }).addTo(this.map!).on("dragend", (e) => { const p = (e.target as L.Marker).getLatLng(); this.picked.emit([+p.lat.toFixed(6), +p.lng.toFixed(6)]); });
        else this.mk.setLatLng(v);
      });
    });
  }
  ngOnDestroy() { this.map?.remove(); }
}

@Component({
  selector: "faza-propose",
  imports: [RouterLink, FormsModule, PageHead, PickMap],
  template: `
    @if (done(); as d) {
      <div class="wrap section">
        <div class="thanks">
          <span class="thanks__stamp" aria-hidden="true">Yaatik<br />essaha</span>
          <h2 class="h-lg">Merci, sahbi !</h2>
          <p class="lead">{{ d.message }}</p>
          <div class="hero__cta" style="justify-content: center"><a class="btn btn--dark" routerLink="/mon-espace" [queryParams]="{ tab: 'propositions' }">Suivre mes propositions</a><a class="btn btn--ghost" routerLink="/communaute">Retour à la communauté</a></div>
        </div>
      </div>
    } @else {
      <header fazaPageHead tone="terra" kicker="Partage ta blassa" title="Proposer un lieu" ar="بلاصة"
        sub="Pour garder FAZA fiable, chaque lieu a besoin de sa position exacte et de sa page Instagram ou Facebook. L’équipe valide avant publication (+20 points)."></header>
      <div class="wrap section">
        <form class="propose" (ngSubmit)="submit()" novalidate>
          <div class="propose__col">
            <label class="field"><span>Nom du lieu</span><input class="input" name="name" [(ngModel)]="f.name" />@if (errs()['name']) {<small class="form-error" role="alert">{{ errs()['name'] }}</small>}</label>
            <div class="row2">
              <label class="field"><span>Rubrique</span><select class="input" name="category" [(ngModel)]="f.category">@for (r of rubriques; track r.id) {<option [value]="r.id">{{ r.name }} — {{ r.fr }}</option>}</select></label>
              <label class="field"><span>Gouvernorat</span><select class="input" name="governorate" [(ngModel)]="f.governorate"><option value="">Choisir…</option>@for (g of govs.data() || []; track g.slug) {<option [value]="g.slug">{{ g.name }}</option>}</select>@if (errs()['governorate']) {<small class="form-error" role="alert">{{ errs()['governorate'] }}</small>}</label>
            </div>
            <label class="field"><span>Pourquoi c’est bien ? (20 à 600 caractères)</span><textarea class="textarea" name="description" [(ngModel)]="f.description"></textarea><small class="muted">{{ f.description.length }}/600</small>@if (errs()['description']) {<small class="form-error" role="alert">{{ errs()['description'] }}</small>}</label>
            <div class="row2">
              <label class="field"><span>Prix indicatif par personne (DT)</span><input class="input" type="number" min="0" name="price" [(ngModel)]="f.price" />@if (errs()['price']) {<small class="form-error" role="alert">{{ errs()['price'] }}</small>}</label>
              <label class="field"><span>Adresse (facultatif)</span><input class="input" name="address" [(ngModel)]="f.address" /></label>
            </div>
            <div class="row2">
              <label class="field"><span>Page Instagram</span><input class="input" placeholder="@nom ou lien" name="instagram" [(ngModel)]="f.instagram" />@if (errs()['instagram']) {<small class="form-error" role="alert">{{ errs()['instagram'] }}</small>}</label>
              <label class="field"><span>Page Facebook</span><input class="input" placeholder="nom de la page ou lien" name="facebook" [(ngModel)]="f.facebook" />@if (errs()['facebook']) {<small class="form-error" role="alert">{{ errs()['facebook'] }}</small>}</label>
            </div>
            @if (errs()['social']) {<small class="form-error" role="alert">{{ errs()['social'] }}</small>}
            <fieldset class="field"><legend>Ambiance</legend><div class="chips">@for (t of tags; track t[0]) {<button type="button" class="chip" [attr.aria-pressed]="f.tags.includes(t[0])" (click)="tog(t[0])">{{ t[1] }}</button>}</div></fieldset>
            <label class="btn btn--ghost">📷 {{ image() ? "Photo ajoutée ✓" : "Ajouter une photo" }}<input type="file" accept="image/*" hidden (change)="photo($event)" /></label>
            @if (image()) { <img [src]="image()" alt="Aperçu" style="max-height: 120px; border-radius: 10px; margin-top: .6rem" /> }
          </div>
          <div class="propose__col">
            <div class="field"><span>Position exacte : clique la carte (ou déplace le repère)</span>
              <faza-pick-map [value]="pos()" (picked)="setPos($event)" />
              <div class="row2" style="margin-top: .5rem">
                <button type="button" class="btn btn--ghost btn--sm" (click)="locate()">Utiliser ma position</button>
                <small class="muted">{{ f.lat != null ? f.lat + ", " + f.lng : "Aucune position choisie" }}</small>
              </div>
              @if (errs()['location']) {<small class="form-error" role="alert">{{ errs()['location'] }}</small>}
            </div>
            <button class="btn btn--terra btn--block" [disabled]="busy()">{{ busy() ? "Envoi…" : "Envoyer pour validation" }}</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class ProposePlace {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  rubriques = RUBRIQUES;
  tags = Object.entries(TAG_LABEL);
  govs = fetchData<any[]>(() => "/governorates");
  f = { name: "", category: "discover", governorate: "", description: "", address: "", price: 0 as number | string, instagram: "", facebook: "", tags: [] as string[], lat: null as number | null, lng: null as number | null };
  image = signal<string | null>(null);
  pos = signal<[number, number] | null>(null);
  errs = signal<Record<string, string>>({});
  busy = signal(false);
  done = signal<any>(null);

  setPos([a, b]: [number, number]) { this.f.lat = a; this.f.lng = b; this.pos.set([a, b]); }
  tog(t: string) { this.f.tags = this.f.tags.includes(t) ? this.f.tags.filter((x) => x !== t) : [...this.f.tags, t]; }
  locate() {
    navigator.geolocation?.getCurrentPosition(
      (p) => this.setPos([+p.coords.latitude.toFixed(6), +p.coords.longitude.toFixed(6)]),
      () => this.toast.show("Position indisponible : clique la carte.", { error: true }),
    );
  }
  async photo(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
    try { this.image.set(await this.api.uploadImage(file)); } catch (x: any) { this.toast.show(x.message, { error: true }); }
  }
  async submit() {
    this.busy.set(true); this.errs.set({});
    try { this.done.set(await this.api.post("/community/places", { ...this.f, image: this.image(), price: +this.f.price })); }
    catch (x: any) { this.errs.set(x.fields || {}); this.toast.show(x.message, { error: true }); }
    finally { this.busy.set(false); }
  }
}
