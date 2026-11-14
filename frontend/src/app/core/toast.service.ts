import { Component, Injectable, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

// Petits messages de confirmation / d’erreur.
export interface Toast { id: number; text: string; error?: boolean; action?: { label: string; link: string }; }

@Injectable({ providedIn: "root" })
export class ToastService {
  readonly items = signal<Toast[]>([]);
  private n = 0;
  show(text: string, opts: { error?: boolean; ms?: number; action?: { label: string; link: string } } = {}) {
    const id = ++this.n;
    this.items.update((l) => [...l, { id, text, error: opts.error, action: opts.action }]);
    setTimeout(() => this.items.update((l) => l.filter((x) => x.id !== id)), opts.ms || 4200);
  }
}

@Component({
  selector: "faza-toasts",
  imports: [RouterLink],
  template: `
    <div class="toasts" role="status" aria-live="polite">
      @for (t of toasts.items(); track t.id) {
        <div class="toast" [class.toast--err]="t.error">{{ t.text }}@if (t.action) {<a [routerLink]="t.action.link">{{ t.action.label }}</a>}</div>
      }
    </div>
  `,
})
export class ToastsComponent {
  toasts = inject(ToastService);
}
