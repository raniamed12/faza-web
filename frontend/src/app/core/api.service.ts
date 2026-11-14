import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, firstValueFrom } from "rxjs";

// Client HTTP pour l’API FAZA. Le jeton de connexion est gardé dans le navigateur.
const KEY = "faza.token";
export const getToken = (): string | null => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t: string | null) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* navigation privée */ } };

/** Erreur renvoyée par l’API : message lisible, code HTTP et erreurs par champ. */
export interface ApiError extends Error { status: number; fields: Record<string, string>; }

/** Intercepteur : ajoute « Authorization: Bearer … » à chaque appel vers /api. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getToken();
  return next(token && req.url.startsWith("/api") ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};

function toApiError(e: unknown): ApiError {
  const r = e as HttpErrorResponse;
  if (!r || r.status === 0) return Object.assign(new Error("Le serveur ne répond pas. Vérifie qu’il est lancé (npm run dev)."), { status: 0, fields: {} });
  const body = (r.error && typeof r.error === "object" ? r.error : {}) as { error?: string; fields?: Record<string, string> };
  return Object.assign(new Error(body.error || "Une erreur est survenue."), { status: r.status, fields: body.fields || {} });
}

@Injectable({ providedIn: "root" })
export class ApiService {
  private http = inject(HttpClient);

  private async run<T>(obs: Observable<T>): Promise<T> {
    try { return await firstValueFrom(obs); } catch (e) { throw toApiError(e); }
  }
  get<T = any>(p: string) { return this.run<T>(this.http.get<T>(`/api${p}`)); }
  post<T = any>(p: string, b?: unknown) { return this.run<T>(this.http.post<T>(`/api${p}`, b || {})); }
  put<T = any>(p: string, b?: unknown) { return this.run<T>(this.http.put<T>(`/api${p}`, b || {})); }
  patch<T = any>(p: string, b?: unknown) { return this.run<T>(this.http.patch<T>(`/api${p}`, b || {})); }
  del<T = any>(p: string) { return this.run<T>(this.http.delete<T>(`/api${p}`)); }

  /** Réduit l’image (1200 px max, JPEG) puis la téléverse. Renvoie son URL. */
  async uploadImage(file: File): Promise<string> {
    const dataUrl = await resizeImage(file);
    const { url } = await this.post<{ url: string }>("/uploads", { dataUrl });
    return url;
  }
}

export function resizeImage(file: File, max = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return reject(new Error("Ce fichier n’est pas une image."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Impossible de lire cette image."));
    img.src = url;
  });
}
