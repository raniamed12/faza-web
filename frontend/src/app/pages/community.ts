import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ErrorBox, Loading, Stars } from "../components/common";
import { EmptyDoor, PageHead } from "../components/deco";
import { AuthService } from "../core/auth.service";
import { fetchData } from "../core/fetch";
import { dt } from "../lib/format";

const ago = (d: string) => { const s = (Date.now() - +new Date(String(d).replace(" ", "T") + "Z")) / 1000; return s < 3600 ? `il y a ${Math.max(1, Math.round(s / 60))} min` : s < 86400 ? `il y a ${Math.round(s / 3600)} h` : `il y a ${Math.round(s / 86400)} j`; };
const STEPS = [
  { n: "1", t: "Propose", d: "Place le lieu sur la carte et ajoute sa page Instagram ou Facebook.", ic: "📍" },
  { n: "2", t: "On vérifie", d: "L’équipe valide la localisation et la page avant publication.", ic: "🔎" },
  { n: "3", t: "Gagne des points", d: "Avis +5, photo +3, programme partagé +10, lieu publié +20.", ic: "🏅" },
];
const MEDAL = ["#C65D3B", "#17497A", "#2F6B55", "#8B5A2B", "#D62839"];
const KIND: Record<string, string> = { review: "Avis", gem: "Pépite", program: "Programme" };

@Component({
  selector: "faza-community",
  imports: [RouterLink, Stars, Loading, ErrorBox, EmptyDoor, PageHead],
  template: `
    @if (feed.loading()) { <faza-loading /> }
    @else if (feed.error()) { <faza-error [error]="feed.error()" /> }
    @else {
      <header fazaPageHead tone="vert" kicker="Ceux qui connaissent le pays" title="La communauté" ar="الجماعة" [actions]="true"
        sub="Des adresses, des avis et des programmes partagés par celles et ceux qui sillonnent la Tunisie. Chaque contribution rapporte des points et des badges.">
        <a class="btn" routerLink="/communaute/proposer">Proposer un lieu</a>
        @if (!auth.user()) { <a class="btn btn--ghost on-dark" routerLink="/inscription">Rejoindre FAZA</a> }
      </header>

      <div class="wrap section comm">
        <ol class="steps">
          @for (s of steps; track s.n) { <li><span class="steps__n">{{ s.n }}</span><div><b>{{ s.ic }} {{ s.t }}</b><p class="muted">{{ s.d }}</p></div></li> }
        </ol>

        <div class="comm__grid">
          <section aria-label="Fil de la communauté">
            <h2 class="h-md comm__h">Ça se passe maintenant <span class="live">en direct</span></h2>
            @if (!feed.data()!.length) {
              <faza-empty-door title="Le fil est encore calme">
                Laisse un avis, partage un programme ou propose un lieu : ta contribution apparaîtra ici en premier.
                <div action class="hero__cta" style="justify-content: center"><a class="btn btn--terra" routerLink="/explorer">Laisser un premier avis</a><a class="btn btn--ghost" routerLink="/mix">Partager un programme</a></div>
              </faza-empty-door>
            } @else {
              <div class="feed">
                @for (x of feed.data(); track $index) {
                  <article [class]="'post post--' + x.type">
                    <span class="post__av" aria-hidden="true">{{ x.author?.[0]?.toUpperCase() || "?" }}</span>
                    <div class="post__body">
                      <p class="post__h"><b>{{ x.author }}</b> <span class="post__kind">{{ kind[x.type] }}</span> <span class="post__d">{{ ago(x.date) }}</span></p>
                      @switch (x.type) {
                        @case ("review") {
                          <p>a noté <a [routerLink]="['/lieu', x.slug]" class="link">{{ x.place }}</a> <faza-stars [value]="x.rating" /></p><p class="post__q">« {{ x.text }} »</p>@if (x.photo) {<img [src]="x.photo" alt="" loading="lazy" />}
                        }
                        @case ("gem") {
                          <p>a déniché une pépite à {{ x.place.gov.name }}</p><h3 class="h-sm"><a [routerLink]="['/lieu', x.place.slug]">{{ x.place.name }}</a></h3><p class="muted">{{ x.place.description }}</p>
                        }
                        @case ("program") {
                          <p>partage un programme à {{ x.gov }}</p><h3 class="h-sm"><a [routerLink]="['/programme', x.share_code]">{{ x.title }}</a></h3><p class="muted">{{ x.days }} jour{{ x.days > 1 ? "s" : "" }} · {{ dt(x.budget) }} par personne · {{ x.participants }} pers.</p>
                        }
                      }
                    </div>
                  </article>
                }
              </div>
            }
          </section>

          <aside class="comm__side">
            <div class="panel">
              <h2 class="h-md comm__h">Les plus actifs</h2>
              @if (!board.data()?.length) {
                <div class="podium podium--empty" aria-label="Classement vide">
                  @for (n of [2, 1, 3]; track n) { <div [class]="'podium__s podium__s--' + n"><span class="podium__who">?</span><span class="podium__b">{{ n }}</span></div> }
                  <p class="muted small">Personne n’a encore de points. Le premier avis te place sur la plus haute marche.</p>
                </div>
              } @else {
                <ol class="board">
                  @for (u of board.data(); track u.id; let i = $index) {
                    <li [class]="i < 3 ? 'is-top is-' + (i + 1) : ''">
                      <span class="board__n">{{ i < 3 ? medals[i] : i + 1 }}</span>
                      <div><b>{{ u.name }}</b><div class="pcard__tags">@for (b of u.badges; track b) {<span class="tag">{{ b }}</span>}</div></div>
                      <b class="board__pts">{{ u.points }}<small> pts</small></b>
                    </li>
                  }
                </ol>
              }
            </div>

            <div class="panel">
              <h2 class="h-md comm__h">Défis du moment</h2>
              <ul class="chal">
                @for (c of challenges.data() || []; track c.id; let i = $index) {
                  <li [style.--c]="medal[i % medal.length]">
                    <span class="medal" aria-hidden="true"><b>+{{ c.points }}</b><small>pts</small></span>
                    <div><b>{{ c.title }}</b><p class="muted small">{{ c.description }}</p>@if (c.badge) {<span class="chal__badge">Badge « {{ c.badge }} »</span>}</div>
                  </li>
                }
              </ul>
              @if (!auth.user()) { <p class="notice" style="margin-top: 1rem"><a class="link" routerLink="/inscription">Crée un compte</a> pour relever les défis.</p> }
            </div>
          </aside>
        </div>
      </div>
    }
  `,
})
export class Community {
  auth = inject(AuthService);
  steps = STEPS; medal = MEDAL; kind = KIND; medals = ["🥇", "🥈", "🥉"]; dt = dt; ago = ago;
  feed = fetchData<any[]>(() => "/community/feed");
  board = fetchData<any[]>(() => "/community/leaderboard");
  challenges = fetchData<any[]>(() => "/challenges");
}
