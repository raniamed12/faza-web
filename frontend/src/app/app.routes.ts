import { Routes } from "@angular/router";
import { privateGuard } from "./core/auth.service";
import { Home } from "./pages/home";

// Les pages autres que l’accueil sont chargées à la demande (lazy loading).
export const routes: Routes = [
  { path: "", component: Home },
  { path: "explorer", loadComponent: () => import("./pages/explorer").then((m) => m.Explorer) },
  { path: "gouvernorat/:slug", loadComponent: () => import("./pages/governorate").then((m) => m.Governorate) },
  { path: "lieu/:slug", loadComponent: () => import("./pages/place").then((m) => m.Place) },
  { path: "mix", loadComponent: () => import("./pages/mix").then((m) => m.Mix) },
  { path: "jaw-tounsna", loadComponent: () => import("./pages/events").then((m) => m.Events) },
  { path: "communaute", loadComponent: () => import("./pages/community").then((m) => m.Community) },
  { path: "communaute/proposer", canActivate: [privateGuard], loadComponent: () => import("./pages/propose-place").then((m) => m.ProposePlace) },
  { path: "connexion", data: { mode: "login" }, loadComponent: () => import("./pages/auth").then((m) => m.Auth) },
  { path: "inscription", data: { mode: "register" }, loadComponent: () => import("./pages/auth").then((m) => m.Auth) },
  { path: "mon-espace", canActivate: [privateGuard], loadComponent: () => import("./pages/my-space").then((m) => m.MySpace) },
  { path: "programme/:code", loadComponent: () => import("./pages/shared").then((m) => m.Shared) },
  // Une seule instance de Benna pour /benna et /benna/lieu/:slug : le carnet garde sa page et son filtre.
  { path: "benna", loadComponent: () => import("./benna/benna").then((m) => m.Benna), children: [{ path: "", children: [] }, { path: "lieu/:slug", children: [] }] },
  { path: "**", loadComponent: () => import("./pages/not-found").then((m) => m.NotFound) },
];
