// Plan dessiné à la main du Grand Tunis (repris du prototype Benna), en français.
// Génère le fond de carte SVG (viewBox 0 0 1600 1000). Les épingles sont ajoutées par React.
const motor = ["M300 520 C380 560 450 590 520 610", "M520 300 C600 380 720 420 850 430 C960 440 1060 460 1150 480", "M600 160 C760 180 920 220 1130 250"];
const primary = ["M560 600 C700 630 900 670 1080 700", "M1080 700 C1120 620 1140 540 1150 480 C1175 430 1195 400 1205 370 C1190 320 1160 280 1130 250 C1100 200 1075 160 1055 110", "M540 610 C530 500 520 400 520 300 C530 230 570 190 610 160", "M600 610 C800 600 980 560 1100 540 C1140 520 1150 500 1150 480"];
const second = ["M560 600 C620 520 700 470 760 440", "M480 760 C500 700 520 650 540 620", "M420 200 C460 260 490 280 520 300", "M400 420 C460 430 500 440 560 470", "M650 300 C700 330 760 360 800 380", "M860 430 C870 380 880 330 900 300", "M1000 300 C1060 330 1110 360 1180 380", "M700 780 C760 740 820 720 900 760", "M350 650 C420 640 470 630 520 620", "M620 700 C660 660 690 640 720 620", "M1130 250 C1150 280 1170 300 1205 320", "M960 210 C980 160 1010 130 1050 110"];
const coast = "M1080 -2000 L1080 0 C1120 80 1100 160 1170 200 C1260 260 1250 330 1270 380 C1250 450 1200 520 1180 600 C1150 680 1120 760 1060 800 C980 860 960 920 900 1000 L760 3000 L4000 3000 L4000 -2000 Z";
const lake = "M640 575 C665 548 720 535 780 540 C830 528 880 520 930 538 C975 552 1012 575 1036 610 C1052 642 1040 676 1010 700 C980 728 940 746 890 742 C840 750 790 736 745 722 C700 712 660 692 640 662 C624 636 624 600 640 575Z";

const R = (arr: string[], w: number, o: string, c: string) => `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${arr.map((d) => `<path d="${d}" stroke="${o}" stroke-width="${w + 3}"/>`).join("")}${arr.map((d) => `<path d="${d}" stroke="${c}" stroke-width="${w}"/>`).join("")}</g>`;
const lbl = (t: string, x: number, y: number, s = 13) => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" fill="#6b6f76" stroke="#fff" stroke-width="4" paint-order="stroke" style="font-family:var(--font-body);font-weight:700;letter-spacing:.14em">${t}</text>`;
const sea = (t: string, x: number, y: number, s: number, rot = 0) => `<text x="${x}" y="${y}" font-size="${s}" fill="#1c6fa8" opacity=".55" text-anchor="middle" transform="rotate(${rot} ${x} ${y})" style="font-family:'Fraunces Variable',serif;font-style:italic">${t}</text>`;
const park = (d: string) => `<path d="${d}" fill="#bfe4a4" stroke="#a6d68a" stroke-width="1.5"/>`;
const boat = (x: number, y: number, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-9 0 L9 0 L6 4 L-6 4Z" fill="#fff"/><path d="M0 0 L0 -14 L8 -2Z" fill="#fff"/><path d="M-30 6 q6 -3 12 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6"/></g>`;

function blocks() {
  let seed = 7, out = "";
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const C = [[540, 600, 150, 320], [590, 350, 130, 220], [620, 195, 90, 110], [840, 440, 90, 90], [1130, 240, 70, 120], [1205, 360, 35, 50], [1145, 505, 55, 80], [1090, 700, 45, 70], [370, 560, 100, 150], [1060, 120, 50, 60], [500, 290, 80, 110]];
  C.forEach(([cx, cy, r, n]: number[]) => {
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.283, d = Math.sqrt(rnd()) * r, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8;
      const w = 5 + rnd() * 9, h = 4 + rnd() * 7;
      out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1" transform="rotate(${(rnd() * 30 - 15).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
    }
  });
  return out; // dessinés avant la mer et le lac : ceux qui tombent dans l’eau sont recouverts
}

let minor = "";
for (let i = 0; i < 70; i++) {
  const x = 320 + ((i * 137) % 820), y = 140 + ((i * 211) % 640), a = (((i * 47) % 180) * Math.PI) / 180, L = 40 + (i % 5) * 14;
  minor += `<path d="M${x} ${y} l${(L * Math.cos(a)).toFixed(1)} ${(L * Math.sin(a)).toFixed(1)}"/>`;
}

export const TUNIS_MAP_SVG = `
<defs><linearGradient id="seaG" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="#8fdcf2"/><stop offset=".35" stop-color="#5cc3ea"/><stop offset="1" stop-color="#2f9bd5"/></linearGradient>
<radialGradient id="lakeG" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#9fdcf3"/><stop offset="1" stop-color="#6cc4ea"/></radialGradient></defs>
<rect x="-2000" y="-2000" width="6000" height="5000" fill="#f4f0e7"/>
<g fill="#eee8dc" opacity=".7"><ellipse cx="540" cy="600" rx="170" ry="120"/><ellipse cx="590" cy="350" rx="150" ry="110"/><ellipse cx="620" cy="190" rx="110" ry="70"/><ellipse cx="840" cy="440" rx="110" ry="60"/><ellipse cx="1130" cy="240" rx="80" ry="70"/><ellipse cx="1150" cy="500" rx="70" ry="80"/><ellipse cx="1090" cy="700" rx="60" ry="60"/><ellipse cx="370" cy="560" rx="110" ry="90"/></g>
<ellipse cx="660" cy="130" rx="120" ry="45" fill="#dff2f4" stroke="#bfe3ea" stroke-width="2"/>
${park("M520 400 C560 380 610 400 600 440 C590 480 540 480 520 460 C505 440 505 415 520 400Z")}${park("M1100 500 C1130 485 1170 500 1165 530 C1150 555 1110 550 1100 530Z")}${park("M240 300 C300 270 360 300 350 350 C330 390 270 390 245 360Z")}${park("M1000 160 C1030 150 1060 170 1050 195 C1030 210 1000 200 1000 160Z")}${park("M920 350 C950 340 980 355 975 380 C955 395 925 385 920 350Z")}
<g fill="#e1d9c8">${blocks()}</g>
<g stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".95">${minor}</g>
${R(second, 5, "#dcd5c6", "#ffffff")}${R(primary, 7, "#e8b546", "#ffd86e")}${R(motor, 8, "#e48a3a", "#f8a95c")}
<path d="${lake}" fill="url(#lakeG)" stroke="#55b7e2" stroke-width="2"/>
${R(["M560 600 C700 630 900 670 1080 700"], 7, "#e8b546", "#ffd86e")}
<path d="${coast}" fill="none" stroke="#f3dfa2" stroke-width="22"/>
<path d="${coast}" fill="url(#seaG)"/>
<path d="${coast}" fill="none" stroke="#bfeefb" stroke-width="3" opacity=".9"/>
${boat(1330, 520, -6)}${boat(1260, 760, 4)}${boat(1420, 300, -3)}${boat(1180, 880, 2)}
${sea("Golfe de Tunis", 1430, 420, 34, -8)}${sea("Mer Méditerranée", 1460, 150, 24, -4)}${sea("Lac de Tunis", 840, 640, 20)}${sea("Sebkhet Ariana", 660, 136, 14)}
${lbl("GAMMARTH", 1000, 90)}${lbl("LA MARSA", 1060, 236)}${lbl("SIDI BOU SAÏD", 1150, 420, 12)}${lbl("CARTHAGE", 1070, 470)}${lbl("LA GOULETTE", 1150, 768, 12)}
${lbl("BERGES DU LAC", 860, 398, 12)}${lbl("MÉDINA", 500, 716)}${lbl("CENTRE-VILLE", 650, 552, 12)}${lbl("EL MENZAH", 660, 338, 12)}${lbl("ENNASR", 440, 282)}${lbl("ARIANA", 650, 214)}${lbl("LE BARDO", 350, 520, 12)}
<text x="380" y="620" font-size="34" text-anchor="middle" fill="#55595f" stroke="#fff" stroke-width="6" paint-order="stroke" style="font-family:var(--font-body);font-weight:800;letter-spacing:.2em">TUNIS</text>`;
