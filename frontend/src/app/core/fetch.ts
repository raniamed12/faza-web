import { effect, inject, signal, untracked } from "@angular/core";
import { ApiService } from "./api.service";

/**
 * Chargement de données avec états « chargement / erreur » (équivalent du useFetch React).
 * `path` est une fonction réactive : quand les signaux qu’elle lit changent, la requête est relancée.
 * Renvoyer `null` suspend le chargement. `reload()` relance la même requête.
 * À appeler dans un contexte d’injection (champ de classe ou constructeur d’un composant).
 */
export function fetchData<T = any>(path: () => string | null) {
  const api = inject(ApiService);
  const data = signal<T | null>(null);
  const error = signal<Error | null>(null);
  const loading = signal(true);
  const tick = signal(0);

  effect((onCleanup) => {
    const p = path();
    tick();
    if (p == null) return;
    let alive = true;
    onCleanup(() => { alive = false; });
    untracked(() => { loading.set(true); error.set(null); });
    api.get<T>(p)
      .then((d) => { if (alive) { data.set(d); error.set(null); loading.set(false); } })
      .catch((e) => { if (alive) { data.set(null); error.set(e); loading.set(false); } });
  });

  return { data: data.asReadonly(), error: error.asReadonly(), loading: loading.asReadonly(), reload: () => tick.update((n) => n + 1) };
}
export type Fetched<T = any> = ReturnType<typeof fetchData<T>>;
