import { Component, computed, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { RUB, SLOT_LABEL, dt } from "../lib/format";
import { SocialLinks } from "./common";

// Frise d’un programme : étapes par jour, avec remplacement / suppression si `editable`.
@Component({
  selector: "faza-program",
  imports: [RouterLink, SocialLinks],
  host: { style: "display: contents" },
  template: `
    <div class="prog">
      <div class="prog__sum">
        <div><span>Par personne</span><b>{{ dt(total()) }}</b></div>
        <div><span>Groupe ({{ program().people }})</span><b>{{ dt(total() * program().people) }}</b></div>
        <div [class]="left() < 0 ? 'bad' : 'good'"><span>{{ left() < 0 ? "Dépassement" : "Reste" }}</span><b>{{ dt(abs(left())) }}</b></div>
      </div>
      @for (d of days(); track d) {
        <section class="prog__day">
          <h3 class="h-md">Jour {{ d }}</h3>
          <ol class="tl">
            @for (it of program().items; track $index; let idx = $index) {
              @if (it.day === d) {
                <li class="tl__it tl__it--full" [style.--c]="rub[it.place.category].color">
                  <span class="tl__slot">{{ slot[it.slot] }}</span>
                  <div class="tl__main">
                    <a [routerLink]="['/lieu', it.place.slug]" class="tl__name">{{ it.place.name }}</a>
                    <p class="muted small">{{ rub[it.place.category].name }} · {{ it.place.gov.name }} — {{ it.place.description }}</p>
                    <faza-social [place]="it.place" [compact]="true" />
                    @if (editable()) {
                      <div class="tl__act">
                        @if (it.alternatives?.length > 0) {
                          <label class="small">Remplacer par
                            <select class="input input--sm" (change)="choose(idx, it, $any($event.target))">
                              <option value="" selected>choisir…</option>
                              @for (a of it.alternatives; track a.id) { <option [value]="a.id">{{ a.name }} ({{ dt(a.price) }})</option> }
                            </select>
                          </label>
                        }
                        <button class="btn btn--ghost btn--sm" (click)="remove.emit(idx)">Retirer</button>
                      </div>
                    }
                  </div>
                  <span class="tl__cost">{{ dt(it.cost) }}</span>
                </li>
              }
            }
          </ol>
        </section>
      }
    </div>
  `,
})
export class Program {
  program = input.required<any>();
  editable = input(false);
  replace = output<{ idx: number; alt: any }>();
  remove = output<number>();
  dt = dt; rub = RUB; slot = SLOT_LABEL; abs = Math.abs;
  days = computed(() => [...new Set<number>(this.program().items.map((i: any) => i.day))].sort());
  total = computed(() => this.program().items.reduce((a: number, b: any) => a + b.cost, 0));
  left = computed(() => Math.round((this.program().budget - this.total()) * 10) / 10);
  choose(idx: number, it: any, sel: HTMLSelectElement) {
    const alt = it.alternatives.find((a: any) => a.id === +sel.value);
    sel.value = "";
    if (alt) this.replace.emit({ idx, alt });
  }
}
