// One-off generator for branded placeholder product images.
// None of the 110 live products have a real photo (image_url is null for
// all of them) — per the brief we must never fabricate a real product
// photo, so this renders honest, clearly-labeled branded placeholders
// instead: one gradient + icon combo per category, in 3 angle-label
// variants each, reused across every product in that category.
//
// Run once with: node scripts/generate-placeholders.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "placeholders");
mkdirSync(OUT_DIR, { recursive: true });

const PINK = { light: "#F5B8D6", mid: "#E37BAF", deep: "#A34677" };
const BLUE = { light: "#A0C8F2", mid: "#5A93DD", deep: "#2F5794" };
const INK = "#0B0B14";
const CREAM = "#FFFAFC";

const CATEGORIES = [
  { slug: "album", label: "Album", icon: iconDisc },
  { slug: "light-stick", label: "Light Stick", icon: iconWand },
  { slug: "magazine", label: "Magazine", icon: iconMagazine },
  { slug: "dicon", label: "DICON", icon: iconPolaroid },
  { slug: "photobook", label: "Photobook", icon: iconBook },
  { slug: "collectable", label: "Collectable", icon: iconGift },
];

const VARIANTS = [
  { key: "front", tag: "Front" },
  { key: "package", tag: "Package" },
  { key: "detail", tag: "Detail" },
];

function iconDisc(c) {
  return `<circle cx="0" cy="0" r="120" fill="none" stroke="${c}" stroke-width="10"/>
  <circle cx="0" cy="0" r="34" fill="${c}"/>
  <circle cx="0" cy="0" r="10" fill="${CREAM}"/>`;
}

function iconWand(c) {
  return `<rect x="-16" y="-140" width="32" height="180" rx="16" fill="${c}"/>
  <path d="M0 -190 L34 -130 L-34 -130 Z" fill="${c}"/>
  <circle cx="0" cy="-190" r="26" fill="${c}"/>`;
}

function iconMagazine(c) {
  return `<rect x="-90" y="-120" width="180" height="240" rx="10" fill="none" stroke="${c}" stroke-width="10"/>
  <line x1="-60" y1="-70" x2="60" y2="-70" stroke="${c}" stroke-width="8"/>
  <line x1="-60" y1="-30" x2="60" y2="-30" stroke="${c}" stroke-width="8"/>
  <line x1="-60" y1="10" x2="20" y2="10" stroke="${c}" stroke-width="8"/>`;
}

function iconPolaroid(c) {
  return `<rect x="-100" y="-120" width="200" height="220" rx="12" fill="none" stroke="${c}" stroke-width="10"/>
  <rect x="-76" y="-96" width="152" height="130" rx="6" fill="${c}" opacity="0.35"/>`;
}

function iconBook(c) {
  return `<path d="M-100 -110 h90 a20 20 0 0 1 20 20 v180 a20 20 0 0 0 -20 -20 h-90 Z" fill="none" stroke="${c}" stroke-width="10"/>
  <path d="M100 -110 h-90 a20 20 0 0 0 -20 20 v180 a20 20 0 0 1 20 -20 h90 Z" fill="none" stroke="${c}" stroke-width="10"/>`;
}

function iconGift(c) {
  return `<rect x="-90" y="-40" width="180" height="150" rx="10" fill="none" stroke="${c}" stroke-width="10"/>
  <line x1="-90" y1="10" x2="90" y2="10" stroke="${c}" stroke-width="8"/>
  <line x1="0" y1="-40" x2="0" y2="110" stroke="${c}" stroke-width="8"/>
  <path d="M0 -40 C -40 -100 -100 -70 0 -40 C 100 -70 40 -100 0 -40 Z" fill="${c}"/>`;
}

function starMark(cx, cy, scale, fill) {
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">
    <path d="M0 -14 L4 -4 L14 -3 L6 4 L8 14 L0 8 L-8 14 L-6 4 L-14 -3 L-4 -4 Z" fill="${fill}"/>
  </g>`;
}

function renderSvg({ label, tag, gradFrom, gradTo, iconFn, iconColor }) {
  const w = 800;
  const h = 1000;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} placeholder image, ${tag} view">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${gradFrom}"/>
      <stop offset="100%" stop-color="${gradTo}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="24" y="24" width="${w - 48}" height="${h - 48}" rx="28" fill="none" stroke="${CREAM}" stroke-opacity="0.5" stroke-width="2"/>
  <g transform="translate(${w / 2} ${h / 2 - 40})">
    ${iconFn(iconColor)}
  </g>
  ${starMark(64, 64, 1.1, CREAM)}
  <text x="${w / 2}" y="${h - 150}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="${INK}">${label}</text>
  <text x="${w / 2}" y="${h - 108}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="18" letter-spacing="3" fill="${INK}" opacity="0.55">IDOL FAIRIES PH</text>
  <rect x="${w / 2 - 70}" y="${h - 76}" width="140" height="34" rx="17" fill="${INK}" opacity="0.85"/>
  <text x="${w / 2}" y="${h - 53}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" fill="${CREAM}">${tag} · Photo soon</text>
</svg>`;
}

const PALETTES = {
  album: { gradFrom: PINK.light, gradTo: BLUE.light, iconColor: PINK.deep },
  "light-stick": { gradFrom: BLUE.light, gradTo: PINK.light, iconColor: BLUE.deep },
  magazine: { gradFrom: PINK.mid, gradTo: BLUE.light, iconColor: CREAM },
  dicon: { gradFrom: BLUE.mid, gradTo: PINK.light, iconColor: CREAM },
  photobook: { gradFrom: PINK.light, gradTo: PINK.mid, iconColor: INK },
  collectable: { gradFrom: BLUE.mid, gradTo: BLUE.light, iconColor: CREAM },
};

let count = 0;
for (const category of CATEGORIES) {
  const palette = PALETTES[category.slug];
  for (const variant of VARIANTS) {
    const svg = renderSvg({
      label: category.label,
      tag: variant.tag,
      iconFn: category.icon,
      ...palette,
    });
    const filePath = join(OUT_DIR, `${category.slug}-${variant.key}.svg`);
    writeFileSync(filePath, svg, "utf8");
    count += 1;
  }
}

console.log(`Generated ${count} placeholder SVGs in ${OUT_DIR}`);
