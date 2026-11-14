import { Component, computed, inject, input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { hash } from "../lib/format";

// Illustrations par défaut des lieux (quand aucune photo n’est renseignée).
// Chaque lieu reçoit une variante légèrement différente selon son identifiant (`seed`).
// Pour afficher une vraie photo : renseignez le champ `image` du lieu (voir README).
// Le dessin est produit sous forme de texte SVG (contenu statique, sans donnée utilisateur).
const C = { bleu: "#0E2F4F", bleu2: "#17497A", bleu3: "#2B6AA3", ciel: "#8FB8DE", sable: "#EAD9B5", sable2: "#F3E9D0", terra: "#C65D3B", terraL: "#E39A78", rouge: "#D62839", papier: "#FAF5EA", vert: "#2F6B55", vert2: "#3F8A6C" };
type V = { a: number; b: number; id: number };

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const grad = (id: string, top: string, bottom: string) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="400" height="260" fill="url(#${id})"/>`;
const Sun = (x: number, y: number, r = 22, c = C.terraL) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const Palm = (x: number, y: number, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C2 -30 -2 -55 3 -80" stroke="#7a4b2a" stroke-width="5" fill="none" stroke-linecap="round"/>` +
  [-70, -35, 0, 35, 70].map((a) => `<path d="M3 -80 C25 -96 45 -86 52 -70" fill="none" stroke="${C.vert}" stroke-width="6" stroke-linecap="round" transform="rotate(${a} 3 -80)"/>`).join("") + `</g>`;
const Pine = (x: number, y: number, s = 1, c = C.vert) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2" y="-6" width="4" height="10" fill="#5b3a22"/><path d="M0 -62 L16 -26 H-16Z M0 -44 L20 -6 H-20Z" fill="${c}"/></g>`;

const SCENES: Record<string, (v: V) => string> = {
  sea: (v) =>
    grad(`sk-sea${v.id}`, C.sable2, "#f3c9a4") + Sun(90 + v.a * 220, 118, 26) +
    `<path d="M0 150 C60 140 90 160 150 150 S260 138 400 152 V260 H0Z" fill="${C.bleu3}"/>` +
    `<path d="M0 176 C70 168 120 186 190 176 S320 168 400 180 V260 H0Z" fill="${C.bleu2}"/>` +
    `<path d="M0 208 C80 200 150 216 230 208 S340 202 400 212 V260 H0Z" fill="${C.bleu}"/>` +
    range(4).map((i) => `<path d="M${30 + i * 90} ${190 + (i % 2) * 14} q12 -7 24 0" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none"/>`).join("") +
    `<g transform="translate(${210 + v.b * 100} 150)"><path d="M-16 8 L16 8 L10 16 H-10Z" fill="#fff"/><path d="M0 -26 V6 L16 6Z" fill="#fff"/><path d="M-2 -20 V6 H-14Z" fill="${C.sable}"/></g>`,
  medina: (v) => {
    const o = v.b * 20;
    return `<rect width="400" height="260" fill="${C.ciel}"/>` + Sun(310 - v.a * 40, 52, 20, C.sable2) +
      `<rect x="0" y="196" width="400" height="64" fill="${C.sable}"/>` +
      `<rect x="${40 + o}" y="96" width="150" height="110" fill="${C.papier}"/>` +
      `<path d="M${60 + o} 96 q40 -52 80 0Z" fill="${C.papier}" stroke="${C.sable}"/>` +
      `<rect x="${196 + o}" y="70" width="46" height="136" fill="${C.papier}"/>` +
      `<rect x="${196 + o}" y="62" width="46" height="10" fill="${C.bleu2}"/>` +
      `<path d="M${200 + o} 62 q19 -34 38 0Z" fill="${C.bleu2}"/>` +
      `<path d="M${86 + o} 206 V150 a27 27 0 0 1 54 0 V206Z" fill="${C.bleu}"/>` +
      range(12).map((i) => `<circle cx="${96 + o + (i % 4) * 14}" cy="${160 + Math.floor(i / 4) * 14}" r="2.2" fill="${C.sable}"/>`).join("") +
      `<rect x="${250 + o}" y="120" width="110" height="86" fill="${C.papier}"/>` +
      `<rect x="${270 + o}" y="140" width="26" height="30" fill="${C.bleu2}"/><rect x="${314 + o}" y="140" width="26" height="30" fill="${C.bleu2}"/>`;
  },
  ruins: (v) =>
    grad(`sk-r${v.id}`, C.ciel, C.sable2) + Sun(60 + v.a * 260, 60, 20, "#fff2d0") +
    `<path d="M0 200 C80 188 170 206 260 196 S360 190 400 198 V260 H0Z" fill="${C.terraL}"/>` +
    `<rect x="0" y="214" width="400" height="46" fill="${C.terra}"/>` +
    [70, 130, 190, 250].map((x, i) =>
      `<g><rect x="${x}" y="${i === 2 ? 118 : 92 + (i % 2) * 14}" width="22" height="${i === 2 ? 92 : 118 - (i % 2) * 14}" fill="${C.sable}"/>` +
      `<rect x="${x - 4}" y="${i === 2 ? 112 : 86 + (i % 2) * 14}" width="30" height="8" fill="${C.sable2}"/>` +
      `<path d="M${x + 6} 120 V205 M${x + 12} 120 V205 M${x + 18} 120 V205" stroke="${C.terraL}" stroke-width="1.2" opacity=".6"/></g>`).join("") +
    `<path d="M130 90 q60 -46 120 0" stroke="${C.sable2}" stroke-width="9" fill="none"/>`,
  oasis: (v) =>
    grad(`sk-o${v.id}`, C.ciel, "#f4dcb1") + Sun(300 - v.a * 120, 70, 22, "#ffe8b5") +
    `<path d="M0 170 C80 140 150 180 240 160 S350 150 400 170 V260 H0Z" fill="${C.sable}"/>` +
    `<path d="M0 210 C100 190 190 222 300 206 S380 200 400 208 V260 H0Z" fill="${C.terraL}"/>` +
    `<ellipse cx="190" cy="226" rx="70" ry="9" fill="${C.bleu3}" opacity=".8"/>` +
    Palm(110, 216, 1.05) + Palm(160, 222, 0.8) + Palm(290, 212, 1.1) + Palm(330, 224, 0.75),
  desert: (v) =>
    grad(`sk-d${v.id}`, "#f8d8ae", C.sable2) + Sun(80 + v.a * 240, 96, 44, "#f2a574") +
    `<path d="M0 160 C90 120 170 170 260 144 S360 130 400 150 V260 H0Z" fill="${C.terraL}"/>` +
    `<path d="M0 196 C110 166 190 214 290 190 S370 176 400 190 V260 H0Z" fill="${C.terra}"/>` +
    `<path d="M0 232 C120 214 230 246 400 222 V260 H0Z" fill="#8a3b22"/>` +
    `<g transform="translate(${220 + v.b * 80} 176)" fill="${C.bleu}"><circle r="3" cx="0" cy="-12"/><path d="M-4 -8 H4 L6 6 H-6Z"/><circle r="3" cx="24" cy="-10"/><path d="M20 -6 H28 L30 8 H18Z"/></g>`,
  mountain: (v) =>
    grad(`sk-m${v.id}`, C.ciel, C.sable2) + Sun(310 - v.a * 80, 58, 18, "#fff2d0") +
    `<path d="M-10 190 L90 70 L150 140 L210 56 L300 160 L330 120 L410 190 V260 H-10Z" fill="${C.bleu3}"/>` +
    `<path d="M90 70 l-22 28 q12 8 22 -6 q12 14 24 4Z M210 56 l-26 34 q14 8 26 -6 q14 14 28 2Z" fill="#fff" opacity=".92"/>` +
    `<path d="M-10 214 L60 150 L130 200 L220 140 L320 210 L410 160 V260 H-10Z" fill="${C.bleu}"/>` +
    Pine(60, 236, 0.9, "#244f45") + Pine(110, 242, 0.7, "#244f45") + Pine(310, 240, 1, "#244f45"),
  forest: (v) =>
    grad(`sk-f${v.id}`, "#cfe2d6", C.sable2) + Sun(60 + v.a * 280, 56, 18, "#fff2d0") +
    [30, 90, 150, 215, 280, 345].map((x, i) => Pine(x, 170 + (i % 2) * 10, 0.7, "#3c7a63")).join("") +
    `<rect y="176" width="400" height="84" fill="#2f6b55"/>` +
    [10, 70, 125, 190, 250, 315, 375].map((x, i) => Pine(x, 238 - (i % 3) * 10, 1.15 - (i % 3) * 0.12, i % 2 ? "#244f45" : C.vert)).join(""),
  food: (v) => {
    const c = v.a > 0.5 ? C.terra : C.bleu2;
    return `<rect width="400" height="260" fill="${c}"/>` +
      `<g opacity=".14" stroke="${C.sable}" stroke-width="2" fill="none">` + range(5).map((i) => `<rect x="${20 + i * 80}" y="20" width="60" height="60" transform="rotate(45 ${50 + i * 80} 50)"/>`).join("") + `</g>` +
      `<circle cx="200" cy="140" r="86" fill="${C.sable2}"/>` +
      `<circle cx="200" cy="140" r="70" fill="none" stroke="${C.terra}" stroke-width="3" stroke-dasharray="4 8"/>` +
      `<circle cx="200" cy="140" r="54" fill="${C.papier}"/>` +
      `<path d="M200 100 L212 128 L242 132 L220 152 L226 182 L200 166 L174 182 L180 152 L158 132 L188 128Z" fill="${c}"/>` +
      `<circle cx="200" cy="140" r="9" fill="${C.sable}"/>` +
      [150, 200, 250].map((x, i) => `<path d="M${x} 40 q-10 -12 0 -24 q10 -12 0 -24" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round" transform="translate(0 ${34 + (i % 2) * 8})"/>`).join("");
  },
  hotel: (v) =>
    grad(`sk-h${v.id}`, C.bleu, C.bleu3) +
    range(16).map((i) => `<circle cx="${(i * 97 + v.id * 13) % 400}" cy="${(i * 53) % 110}" r="${i % 4 === 0 ? 2 : 1.2}" fill="#fff" opacity=".8"/>`).join("") +
    `<circle cx="${80 + v.a * 220}" cy="58" r="20" fill="${C.sable2}"/><circle cx="${90 + v.a * 220}" cy="52" r="18" fill="${C.bleu}"/>` +
    `<rect y="200" width="400" height="60" fill="#0a2238"/>` +
    `<rect x="70" y="120" width="180" height="86" fill="${C.papier}"/><rect x="250" y="146" width="90" height="60" fill="${C.sable2}"/>` +
    `<path d="M70 120 q90 -56 180 0Z" fill="${C.sable}"/>` +
    `<path d="M130 206 V160 a22 22 0 0 1 44 0 V206Z" fill="#f4b860"/><path d="M202 206 V166 a14 14 0 0 1 28 0 V206Z" fill="#f4b860" opacity=".85"/>` +
    `<rect x="270" y="162" width="22" height="22" fill="#f4b860"/><rect x="304" y="162" width="22" height="22" fill="#f4b860" opacity=".8"/>`,
};

export function sceneMarkup(type = "medina", seed = "x") {
  const h = hash(String(seed));
  const v = { a: (h % 100) / 100, b: ((h >> 7) % 100) / 100, id: h % 9973 };
  return (SCENES[type] || SCENES["medina"])(v);
}

/** Usage : <svg fazaScene type="sea" [seed]="place.slug"></svg> */
@Component({
  selector: "svg[fazaScene]",
  template: "",
  host: {
    class: "scene",
    viewBox: "0 0 400 260",
    preserveAspectRatio: "xMidYMid slice",
    role: "img",
    "[attr.aria-label]": "label() || 'Illustration : ' + (type() || 'medina')",
    "[innerHTML]": "html()",
  },
})
export class Scene {
  private san = inject(DomSanitizer);
  type = input<string | null | undefined>("medina");
  seed = input<string | null | undefined>("x");
  label = input<string>();
  html = computed(() => this.san.bypassSecurityTrustHtml(sceneMarkup(this.type() || "medina", this.seed() || "x")));
}
