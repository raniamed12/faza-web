import { Injectable, inject, signal } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ApiService, getToken, setToken } from "./api.service";

export interface User { id: number; name: string; email: string; role: "user" | "admin"; points?: number; badges?: string[]; }

// Authentification : l’utilisateur courant est disponible partout via AuthService.user().
@Injectable({ providedIn: "root" })
export class AuthService {
  private api = inject(ApiService);
  readonly user = signal<User | null>(null);
  readonly ready = signal(!getToken());
  /** Résolue quand on sait si l’utilisateur est connecté. */
  readonly whenReady: Promise<void>;

  constructor() {
    this.whenReady = !getToken() ? Promise.resolve() : this.api.get<{ user: User }>("/auth/me")
      .then((r) => this.user.set(r.user))
      .catch(() => setToken(null))
      .finally(() => this.ready.set(true));
  }

  async login(email: string, password: string) {
    const r = await this.api.post<{ token: string; user: User }>("/auth/login", { email, password });
    setToken(r.token); this.user.set(r.user); return r.user;
  }
  async register(name: string, email: string, password: string) {
    const r = await this.api.post<{ token: string; user: User }>("/auth/register", { name, email, password });
    setToken(r.token); this.user.set(r.user); return r.user;
  }
  logout() { setToken(null); this.user.set(null); }
}

/** Garde de route : redirige vers /connexion (avec l’adresse d’origine) si personne n’est connecté. */
export const privateGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService), router = inject(Router);
  await auth.whenReady;
  return auth.user() ? true : router.createUrlTree(["/connexion"], { queryParams: { from: state.url } });
};
