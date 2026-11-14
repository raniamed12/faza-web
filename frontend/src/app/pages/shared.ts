import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Program } from "../components/program";
import { ErrorBox, Loading } from "../components/common";
import { PageHead } from "../components/deco";
import { fetchData } from "../core/fetch";

@Component({
  selector: "faza-shared",
  imports: [RouterLink, Program, Loading, ErrorBox, PageHead],
  template: `
    @if (res.loading()) { <faza-loading /> }
    @else if (res.error()) { <faza-error [error]="res.error()" /> }
    @else if (res.data(); as d) {
      @let p = d.program;
      <header fazaPageHead tone="bleu" [kicker]="'Programme partagé par ' + p.author" [title]="p.title" [actions]="true"
        [sub]="p.governorate.name + ' · ' + p.days + ' jour' + (p.days > 1 ? 's' : '') + ' · ' + p.people + ' pers.'">
        <a class="btn" routerLink="/mix" [queryParams]="{ gov: p.governorate.slug, budget: p.budget }">Créer le mien avec FAZA MIX</a>
      </header>
      <div class="wrap section"><faza-program [program]="p" /></div>
    }
  `,
})
export class Shared {
  code = input.required<string>();
  res = fetchData<any>(() => `/programs/shared/${this.code()}`);
}
