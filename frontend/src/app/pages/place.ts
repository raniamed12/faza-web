import { Component, computed, inject, input, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { PlaceMap } from "../components/place-map";
import { ErrorBox, FavButton, Loading, PlaceCard, PlaceVisual, SocialLinks, Stars } from "../components/common";
import { EmptyDoor } from "../components/deco";
import { AuthService } from "../core/auth.service";
import { ToastService } from "../core/toast.service";
import { ApiService } from "../core/api.service";
import { fetchData } from "../core/fetch";
import { RUB, TAG_LABEL, priceFrom } from "../lib/format";
import { PRECISION_LABEL, osmLink } from "../lib/links";

const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

@Component({
  selector: "faza-place",
  imports: [RouterLink, FormsModule, PlaceMap, PlaceVisual, PlaceCard, FavButton, SocialLinks, Stars, Loading, ErrorBox, EmptyDoor],
  templateUrl: "./place.html",
})
export class Place {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  slug = input.required<string>();

  res = fetchData<any>(() => `/places/${this.slug()}`);
  around = fetchData<any[]>(() => { const d = this.res.data(); return d ? `/places?gov=${d.place.gov.slug}&limit=12` : null; });

  rating = signal(5); text = ""; photo = signal<string | null>(null); busy = signal(false); err = signal("");
  stars = [1, 2, 3, 4, 5]; days = DAYS; tagLabel = TAG_LABEL; precLabel = PRECISION_LABEL; priceFrom = priceFrom;

  p = computed(() => this.res.data()?.place);
  rub = computed(() => RUB[this.p().category]);
  osm = computed(() => osmLink(this.p()));
  near = computed(() => {
    const p = this.p(); if (!p) return [];
    const pool = (this.around.data() || []).filter((x) => x.id !== p.id);
    return [...pool.filter((x) => x.category !== p.category), ...pool.filter((x) => x.category === p.category)].slice(0, 3);
  });

  date(s: string) { return new Date(s.replace(" ", "T") + "Z").toLocaleDateString("fr-FR"); }
  dishList(dishes: any[]) { return dishes.map((d) => `${d.emoji} ${d.name}`).join(" · "); }

  async submit(e: Event) {
    e.preventDefault(); this.err.set(""); this.busy.set(true);
    try {
      await this.api.post(`/places/${this.p().slug}/reviews`, { rating: this.rating(), text: this.text, photo: this.photo() });
      this.text = ""; this.photo.set(null); this.res.reload(); this.toast.show("Merci pour ton avis !");
    } catch (x: any) { this.err.set(x.fields?.text || x.message); } finally { this.busy.set(false); }
  }
  async pick(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return;
    try { this.photo.set(await this.api.uploadImage(f)); } catch (x: any) { this.err.set(x.message); }
  }
}
