/**
 * Genera los placeholders locales de HARTWELL.
 * Uso: node scripts/make-placeholders.ts [--force]
 *
 * Cada imagen es una ilustración de la escena que corresponde al slot (finca, caballerizas,
 * cancha, regata, Riviera, colegio, biblioteca...) con grano de película, para que el diseño
 * se pueda evaluar sin fotografía real. Todas llevan una etiqueta PLACEHOLDER con su ruta y ratio.
 *
 * No sobrescribe archivos existentes salvo con --force: tus fotos reales quedan a salvo.
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { products, productImage, IMAGES_PER_COLOR, type Product, type ProductColor } from "../src/content/products.ts";
import * as media from "../src/content/media.ts";

const ROOT = path.resolve(import.meta.dirname, "..", "public");
const FORCE = process.argv.includes("--force");
let written = 0;
let skipped = 0;

async function writeSvg(publicPath: string, svg: string, w: number, h: number, format: "jpg" | "png" = "jpg") {
  const out = path.join(ROOT, publicPath);
  if (existsSync(out) && !FORCE) {
    skipped++;
    return;
  }
  mkdirSync(path.dirname(out), { recursive: true });
  const img = sharp(Buffer.from(svg)).resize(w, h);
  if (format === "png") await img.png().toFile(out);
  else await img.jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  written++;
}

/* ---------- color ---------- */
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (c: number[]) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
const mix = (a: string, b: string, t: number) => {
  const A = rgb(a);
  const B = rgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};
const shade = (hex: string, amt: number) => (amt >= 0 ? mix(hex, "#ffffff", amt) : mix(hex, "#000000", -amt));
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* PRNG determinístico */
function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ---------- capa fotográfica: grade cálido, viñeta y grano ---------- */
function film(w: number, h: number, inner: string, opts: { warm?: number; vignette?: number; grain?: number; label?: string[]; labelOnDark?: boolean } = {}) {
  const { warm = 0.1, vignette = 0.32, grain = 0.07, label, labelOnDark } = opts;
  const size = Math.round(Math.min(w, h) * 0.019);
  const lx = Math.round(w * 0.045);
  const ly = h - Math.round(h * 0.045);
  const labelSvg = label
    ? `<g font-family="Georgia, 'Times New Roman', serif" font-size="${size}" letter-spacing="${size * 0.12}" fill="${labelOnDark ? "rgba(246,242,234,0.82)" : "rgba(28,29,33,0.72)"}">
        ${label.map((l, i) => `<text x="${lx}" y="${ly - (label.length - 1 - i) * size * 1.55}">${esc(l)}</text>`).join("")}
      </g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="vig" cx="0.5" cy="0.48" r="0.75">
      <stop offset="0.55" stop-color="#1b140c" stop-opacity="0"/>
      <stop offset="1" stop-color="#1b140c" stop-opacity="${vignette}"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 ${grain * 9} -${grain * 4}"/>
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="${Math.max(w, h) * 0.004}"/></filter>
    <filter id="haze"><feGaussianBlur stdDeviation="${Math.max(w, h) * 0.0016}"/></filter>
  </defs>
  ${inner}
  <rect width="${w}" height="${h}" fill="#e8b878" opacity="${warm}"/>
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.9"/>
  ${labelSvg}
</svg>`;
}

/* ---------- elementos de paisaje ---------- */
function sky(w: number, h: number, top: string, bottom: string, horizon: number, sun?: { x: number; y: number; r: number; color: string }) {
  return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
  ${sun ? `<radialGradient id="sun" cx="${sun.x}" cy="${sun.y}" r="${sun.r}" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="${sun.color}" stop-opacity="0.95"/><stop offset="0.25" stop-color="${sun.color}" stop-opacity="0.45"/><stop offset="1" stop-color="${sun.color}" stop-opacity="0"/></radialGradient>` : ""}</defs>
  <rect width="${w}" height="${h * horizon + 2}" fill="url(#sky)"/>
  ${sun ? `<rect width="${w}" height="${h}" fill="url(#sun)"/>` : ""}`;
}

function hills(w: number, h: number, y: number, amp: number, color: string, seed: number) {
  const r = rand(seed);
  let d = `M0 ${y}`;
  const n = 6;
  for (let k = 1; k <= n; k++) {
    const x = (w / n) * k;
    d += ` Q ${x - w / n / 2} ${y - amp * (0.4 + r())} ${x} ${y - amp * r() * 0.6}`;
  }
  return `<path d="${d} L ${w} ${h} L 0 ${h} Z" fill="${color}"/>`;
}

function tree(x: number, base: number, r: number, color: string, trunk: string, kind: "round" | "cypress" = "round") {
  if (kind === "cypress") {
    return `<rect x="${x - r * 0.06}" y="${base - r * 0.5}" width="${r * 0.12}" height="${r * 0.5}" fill="${trunk}"/>
    <ellipse cx="${x}" cy="${base - r * 2.1}" rx="${r * 0.32}" ry="${r * 1.9}" fill="${color}"/>`;
  }
  return `<rect x="${x - r * 0.07}" y="${base - r * 1.2}" width="${r * 0.14}" height="${r * 1.2}" fill="${trunk}"/>
  <ellipse cx="${x}" cy="${base - r * 1.75}" rx="${r * 0.95}" ry="${r * 1.05}" fill="${color}"/>
  <ellipse cx="${x - r * 0.35}" cy="${base - r * 1.95}" rx="${r * 0.55}" ry="${r * 0.6}" fill="${shade(color, 0.07)}" opacity="0.7"/>`;
}

/** Jinete a caballo (silueta), anclado al centro inferior */
function rider(cx: number, base: number, s: number, color: string) {
  const X = (v: number) => cx + (v - 0.5) * s;
  const Y = (v: number) => base - (1 - v) * s;
  return `<g fill="${color}">
    <ellipse cx="${X(0.5)}" cy="${Y(0.55)}" rx="${s * 0.3}" ry="${s * 0.12}"/>
    <polygon points="${X(0.72)},${Y(0.5)} ${X(0.78)},${Y(0.27)} ${X(0.86)},${Y(0.25)} ${X(0.84)},${Y(0.52)}"/>
    <polygon points="${X(0.78)},${Y(0.27)} ${X(0.96)},${Y(0.36)} ${X(0.94)},${Y(0.41)} ${X(0.83)},${Y(0.35)}"/>
    ${[0.27, 0.35, 0.63, 0.71].map((lx, i) => `<rect x="${X(lx)}" y="${Y(0.6)}" width="${s * 0.035}" height="${s * (0.4 - (i % 2) * 0.02)}"/>`).join("")}
    <path d="M ${X(0.21)} ${Y(0.5)} Q ${X(0.12)} ${Y(0.6)} ${X(0.15)} ${Y(0.8)}" stroke="${color}" stroke-width="${s * 0.03}" fill="none"/>
    <polygon points="${X(0.45)},${Y(0.44)} ${X(0.5)},${Y(0.17)} ${X(0.59)},${Y(0.17)} ${X(0.61)},${Y(0.44)}"/>
    <circle cx="${X(0.545)}" cy="${Y(0.1)}" r="${s * 0.05}"/>
    <polygon points="${X(0.5)},${Y(0.43)} ${X(0.56)},${Y(0.43)} ${X(0.54)},${Y(0.66)} ${X(0.5)},${Y(0.66)}"/>
  </g>`;
}

function house(cx: number, base: number, width: number, wall: string, roof: string, win: string) {
  const hgt = width * 0.42;
  const x0 = cx - width / 2;
  const cols = 7;
  let wins = "";
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < cols; c++) {
      const wx = x0 + width * (0.08 + c * 0.125);
      const wy = base - hgt * (0.82 - r * 0.42);
      wins += `<rect x="${wx}" y="${wy}" width="${width * 0.05}" height="${hgt * 0.24}" fill="${win}"/>`;
    }
  return `<g>
    <rect x="${x0}" y="${base - hgt}" width="${width}" height="${hgt}" fill="${wall}"/>
    <polygon points="${x0 - width * 0.03},${base - hgt} ${cx},${base - hgt - width * 0.16} ${x0 + width * 1.03},${base - hgt}" fill="${roof}"/>
    <rect x="${cx - width * 0.11}" y="${base - hgt * 1.12}" width="${width * 0.22}" height="${hgt * 1.12}" fill="${shade(wall, 0.05)}"/>
    <polygon points="${cx - width * 0.13},${base - hgt * 1.12} ${cx},${base - hgt * 1.12 - width * 0.07} ${cx + width * 0.13},${base - hgt * 1.12}" fill="${roof}"/>
    ${wins}
    <rect x="${cx - width * 0.035}" y="${base - hgt * 0.42}" width="${width * 0.07}" height="${hgt * 0.42}" fill="${win}"/>
  </g>`;
}

/* ---------- escenas ---------- */
type SceneFn = (w: number, h: number, seed: number) => string;

const estate: SceneFn = (w, h, seed) => {
  const hy = h * 0.56;
  const vp = w * 0.5;
  const skyTop = "#B9B49A";
  const haze = "#E9D3A6";
  let trees = "";
  for (let k = 9; k >= 0; k--) {
    const s = 1 / (1 + k * 0.6);
    const base = hy + (h - hy) * s * 0.92;
    const off = Math.max(w, h) * 0.34 * s + w * 0.02;
    const r = h * 0.2 * s;
    const col = mix("#27331F", haze, (1 - s) * 0.75);
    const trunk = mix("#2B2219", haze, (1 - s) * 0.7);
    trees += tree(vp - off, base, r, col, trunk) + tree(vp + off, base, r, col, trunk);
  }
  return `${sky(w, h, skyTop, haze, 0.6, { x: 0.5, y: 0.5, r: 0.55, color: "#FFE2A8" })}
  ${hills(w, h, hy - h * 0.01, h * 0.03, mix("#6F7A5A", haze, 0.55), seed)}
  ${house(vp, hy + h * 0.005, w * 0.2, mix("#D8CBB0", haze, 0.35), mix("#6D6A63", haze, 0.4), mix("#5B5246", haze, 0.3))}
  <rect y="${hy}" width="${w}" height="${h - hy}" fill="#55613F"/>
  <rect y="${hy}" width="${w}" height="${(h - hy) * 0.35}" fill="${mix("#55613F", haze, 0.45)}" opacity="0.8"/>
  <polygon points="${vp - w * 0.008},${hy} ${vp + w * 0.008},${hy} ${vp + w * 0.24},${h} ${vp - w * 0.24},${h}" fill="#CBB58A"/>
  <polygon points="${vp - w * 0.008},${hy} ${vp + w * 0.008},${hy} ${vp + w * 0.24},${h} ${vp + w * 0.18},${h}" fill="#E1CB9C" opacity="0.6"/>
  ${trees}
  ${rider(vp + w * 0.02, hy + (h - hy) * 0.5, h * 0.2, "#23262C")}
  <rect width="${w}" height="${h}" fill="#FFD9A0" opacity="0.08"/>`;
};

const garden: SceneFn = (w, h) => {
  const hy = h * 0.42;
  let parterre = "";
  for (let row = 0; row < 4; row++) {
    const s = 1 - row * 0.2;
    const y = h - (h - hy) * (0.15 + row * 0.22);
    const bw = w * 0.3 * s;
    const bh = (h - hy) * 0.1 * s;
    parterre += `<rect x="${w * 0.5 - w * 0.08 - bw}" y="${y - bh}" width="${bw}" height="${bh}" rx="${bh * 0.4}" fill="${mix("#2E3C27", "#D9C49A", row * 0.12)}"/>
    <rect x="${w * 0.5 + w * 0.08}" y="${y - bh}" width="${bw}" height="${bh}" rx="${bh * 0.4}" fill="${mix("#2E3C27", "#D9C49A", row * 0.12)}"/>`;
  }
  return `${sky(w, h, "#C2C4B4", "#EAD9B4", 0.45, { x: 0.8, y: 0.2, r: 0.5, color: "#FFE8BC" })}
  ${house(w * 0.5, hy, w * 0.62, "#DCCFB4", "#5E5D59", "#4A433A")}
  <rect y="${hy}" width="${w}" height="${h - hy}" fill="#6A7650"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${w * 0.36 - i * w * 0.02}" y="${hy + i * h * 0.018}" width="${w * 0.28 + i * w * 0.04}" height="${h * 0.018}" fill="${shade("#CFC2A6", -i * 0.04)}"/>`).join("")}
  <polygon points="${w * 0.44},${hy + h * 0.09} ${w * 0.56},${hy + h * 0.09} ${w * 0.7},${h} ${w * 0.3},${h}" fill="#D3C4A2"/>
  ${parterre}
  <g fill="#BFB29A"><rect x="${w * 0.17}" y="${h * 0.62}" width="${w * 0.05}" height="${h * 0.08}"/><ellipse cx="${w * 0.195}" cy="${h * 0.61}" rx="${w * 0.045}" ry="${h * 0.025}"/></g>
  <g fill="#BFB29A"><rect x="${w * 0.78}" y="${h * 0.62}" width="${w * 0.05}" height="${h * 0.08}"/><ellipse cx="${w * 0.805}" cy="${h * 0.61}" rx="${w * 0.045}" ry="${h * 0.025}"/></g>`;
};

const stables: SceneFn = (w, h) => {
  const wall = "#4B3627";
  let planks = "";
  for (let x = 0; x < w; x += w * 0.035) planks += `<rect x="${x}" y="0" width="${w * 0.004}" height="${h * 0.82}" fill="#2E2018" opacity="0.6"/>`;
  const door = (cx: number) => `<rect x="${cx - w * 0.15}" y="${h * 0.3}" width="${w * 0.3}" height="${h * 0.52}" fill="#E7DDC8"/>
    <rect x="${cx - w * 0.135}" y="${h * 0.315}" width="${w * 0.27}" height="${h * 0.5}" fill="#2A1D15"/>
    <rect x="${cx - w * 0.135}" y="${h * 0.56}" width="${w * 0.27}" height="${h * 0.255}" fill="#5C4331"/>
    <path d="M ${cx - w * 0.135} ${h * 0.56} L ${cx + w * 0.135} ${h * 0.815} M ${cx + w * 0.135} ${h * 0.56} L ${cx - w * 0.135} ${h * 0.815}" stroke="#E7DDC8" stroke-width="${w * 0.012}"/>`;
  return `<rect width="${w}" height="${h}" fill="${wall}"/>${planks}
  <polygon points="0,0 ${w},0 ${w},${h * 0.14} 0,${h * 0.14}" fill="#3A2A1F"/>
  ${door(w * 0.3)}${door(w * 0.72)}
  <g fill="#3B2E26"><ellipse cx="${w * 0.3}" cy="${h * 0.47}" rx="${w * 0.06}" ry="${h * 0.07}"/><polygon points="${w * 0.27},${h * 0.44} ${w * 0.25},${h * 0.37} ${w * 0.29},${h * 0.42}"/><rect x="${w * 0.285}" y="${h * 0.5}" width="${w * 0.03}" height="${h * 0.06}"/></g>
  <rect y="${h * 0.82}" width="${w}" height="${h * 0.18}" fill="#A99572"/>
  <rect y="${h * 0.82}" width="${w}" height="${h * 0.02}" fill="#6E5D45"/>
  <circle cx="${w * 0.51}" cy="${h * 0.24}" r="${w * 0.02}" fill="#F3D79C"/>
  <rect width="${w}" height="${h}" fill="url(#light)"/>
  <defs><linearGradient id="light" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="#FFD9A0" stop-opacity="0.32"/><stop offset="0.6" stop-color="#FFD9A0" stop-opacity="0"/></linearGradient></defs>
  ${rider(w * 0.8, h * 0.9, h * 0.26, "#1F1C1A")}`;
};

const lawn: SceneFn = (w, h) => {
  const hy = h * 0.4;
  let stripes = "";
  for (let i = 0; i < 9; i++) {
    const t0 = i / 9;
    const t1 = (i + 1) / 9;
    const y0 = hy + (h - hy) * t0 * t0;
    const y1 = hy + (h - hy) * t1 * t1;
    stripes += `<rect y="${y0}" width="${w}" height="${y1 - y0 + 1}" fill="${i % 2 ? "#6C8050" : "#5E7245"}"/>`;
  }
  const L = (x0: number, x1: number) => `M ${w * x0} ${hy + (h - hy) * 0.08} L ${w * x1} ${h}`;
  return `${sky(w, h, "#BDC8C4", "#EEE3C6", 0.42, { x: 0.2, y: 0.15, r: 0.6, color: "#FFF0CF" })}
  <rect y="${hy - h * 0.16}" width="${w}" height="${h * 0.17}" fill="#2D3B27"/>
  ${[0.1, 0.25, 0.42, 0.6, 0.78, 0.93].map((x, i) => `<ellipse cx="${w * x}" cy="${hy - h * 0.16}" rx="${w * 0.1}" ry="${h * (0.04 + (i % 3) * 0.012)}" fill="#2D3B27"/>`).join("")}
  <g><rect x="${w * 0.06}" y="${hy - h * 0.12}" width="${w * 0.22}" height="${h * 0.1}" fill="#EDE6D6"/><polygon points="${w * 0.05},${hy - h * 0.12} ${w * 0.17},${hy - h * 0.18} ${w * 0.29},${hy - h * 0.12}" fill="#2F4A35"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${w * (0.085 + i * 0.05)}" y="${hy - h * 0.1}" width="${w * 0.025}" height="${h * 0.05}" fill="#3E4B44"/>`).join("")}</g>
  ${stripes}
  <path d="${L(0.3, 0.02)} ${L(0.7, 0.98)} ${L(0.35, 0.14)} ${L(0.65, 0.86)} M ${w * 0.3} ${hy + (h - hy) * 0.08} L ${w * 0.7} ${hy + (h - hy) * 0.08} M ${w * 0.5} ${hy + (h - hy) * 0.3} L ${w * 0.5} ${h * 0.88}" stroke="#F4EFE4" stroke-width="${w * 0.004}" fill="none" opacity="0.92"/>
  <rect x="${w * 0.12}" y="${hy + (h - hy) * 0.32}" width="${w * 0.76}" height="${h * 0.06}" fill="#20251F" opacity="0.55"/>
  <rect x="${w * 0.12}" y="${hy + (h - hy) * 0.32}" width="${w * 0.76}" height="${h * 0.008}" fill="#F4EFE4"/>
  <rect x="${w * 0.115}" y="${hy + (h - hy) * 0.29}" width="${w * 0.008}" height="${h * 0.1}" fill="#1E3326"/><rect x="${w * 0.877}" y="${hy + (h - hy) * 0.29}" width="${w * 0.008}" height="${h * 0.1}" fill="#1E3326"/>
  <g><rect x="${w * 0.72}" y="${h * 0.84}" width="${w * 0.22}" height="${h * 0.02}" fill="#8A6A48"/><rect x="${w * 0.73}" y="${h * 0.86}" width="${w * 0.01}" height="${h * 0.05}" fill="#6E5338"/><rect x="${w * 0.92}" y="${h * 0.86}" width="${w * 0.01}" height="${h * 0.05}" fill="#6E5338"/></g>`;
};

function boat(x: number, y: number, s: number, sail: string) {
  return `<g><path d="M ${x - s * 0.5} ${y} L ${x + s * 0.55} ${y} L ${x + s * 0.4} ${y + s * 0.12} L ${x - s * 0.38} ${y + s * 0.12} Z" fill="#4A3020"/>
  <rect x="${x - s * 0.015}" y="${y - s * 1.3}" width="${s * 0.03}" height="${s * 1.3}" fill="#5A4636"/>
  <polygon points="${x + s * 0.02},${y - s * 1.25} ${x + s * 0.5},${y - s * 0.08} ${x + s * 0.02},${y - s * 0.08}" fill="${sail}"/>
  <polygon points="${x - s * 0.03},${y - s * 1.05} ${x - s * 0.42},${y - s * 0.1} ${x - s * 0.03},${y - s * 0.1}" fill="${shade(sail, -0.08)}"/></g>`;
}

const regatta: SceneFn = (w, h, seed) => {
  const hy = h * 0.5;
  const r = rand(seed);
  let streaks = "";
  for (let i = 0; i < 26; i++) streaks += `<rect x="${r() * w}" y="${hy + (h - hy) * r()}" width="${w * (0.05 + r() * 0.15)}" height="${h * 0.003}" fill="#F3E3C0" opacity="${0.15 + r() * 0.3}"/>`;
  return `${sky(w, h, "#9FB2B8", "#EBDDBB", 0.5, { x: 0.65, y: 0.42, r: 0.5, color: "#FFE6B5" })}
  ${hills(w, h, hy, h * 0.06, "#8C9A94", seed)}
  ${hills(w, h, hy + h * 0.005, h * 0.03, "#6E7E73", seed + 3)}
  <rect y="${hy}" width="${w}" height="${h - hy}" fill="#4F6D78"/>
  <rect y="${hy}" width="${w}" height="${(h - hy) * 0.5}" fill="#7F98A0" opacity="0.5"/>
  ${streaks}
  ${boat(w * 0.25, hy + h * 0.04, h * 0.14, "#EDE5D3")}
  ${boat(w * 0.66, hy + h * 0.12, h * 0.3, "#F4EEE1")}
  ${boat(w * 0.88, hy + h * 0.02, h * 0.08, "#E2D8C4")}
  <g fill="#3A2C22">${[0.04, 0.12, 0.2].map((x) => `<rect x="${w * x}" y="${h * 0.84}" width="${w * 0.018}" height="${h * 0.16}"/>`).join("")}<rect x="0" y="${h * 0.86}" width="${w * 0.26}" height="${h * 0.025}"/></g>`;
};

const riviera: SceneFn = (w, h) => {
  const hy = h * 0.46;
  const parasol = (cx: number, cy: number, s: number) => {
    let stripes = "";
    for (let i = 0; i < 6; i++) {
      const a0 = Math.PI + (i * Math.PI) / 6;
      const a1 = Math.PI + ((i + 1) * Math.PI) / 6;
      stripes += `<path d="M ${cx} ${cy} L ${cx + Math.cos(a0) * s} ${cy + Math.sin(a0) * s * 0.45} L ${cx + Math.cos(a1) * s} ${cy + Math.sin(a1) * s * 0.45} Z" fill="${i % 2 ? "#F2ECDF" : "#2B3D5A"}"/>`;
    }
    return `<rect x="${cx - s * 0.02}" y="${cy}" width="${s * 0.04}" height="${s * 1.2}" fill="#D9CDB6"/>${stripes}`;
  };
  return `${sky(w, h, "#A9C0CC", "#F0E1C2", 0.46, { x: 0.3, y: 0.3, r: 0.6, color: "#FFF1D2" })}
  <rect y="${hy}" width="${w}" height="${h - hy}" fill="#2F5A73"/>
  <rect y="${hy}" width="${w}" height="${(h - hy) * 0.3}" fill="#6E93A6" opacity="0.6"/>
  <path d="M ${w * 0.55} ${hy} Q ${w * 0.7} ${h * 0.2} ${w} ${h * 0.16} L ${w} ${h * 0.7} L ${w * 0.6} ${h * 0.7} Z" fill="#8C7A5C"/>
  <g><rect x="${w * 0.68}" y="${h * 0.22}" width="${w * 0.2}" height="${h * 0.14}" fill="#E3C39A"/><polygon points="${w * 0.67},${h * 0.22} ${w * 0.78},${h * 0.17} ${w * 0.89},${h * 0.22}" fill="#A5583C"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${w * (0.695 + i * 0.045)}" y="${h * 0.25}" width="${w * 0.022}" height="${h * 0.05}" fill="#3F5D45"/>`).join("")}</g>
  ${[0.6, 0.64, 0.92, 0.96].map((x) => tree(w * x, h * 0.4, h * 0.05, "#2E3B26", "#3B2E22", "cypress")).join("")}
  <rect y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="#E4D8C2"/>
  <rect y="${h * 0.68}" width="${w}" height="${h * 0.03}" fill="#EFE7D8"/>
  ${Array.from({ length: 16 }, (_, i) => `<rect x="${(w / 16) * i + w * 0.015}" y="${h * 0.71}" width="${w * 0.018}" height="${h * 0.08}" rx="${w * 0.008}" fill="#F2ECDF"/>`).join("")}
  <rect y="${h * 0.79}" width="${w}" height="${h * 0.02}" fill="#D4C6AD"/>
  ${parasol(w * 0.24, h * 0.56, w * 0.18)}${parasol(w * 0.56, h * 0.6, w * 0.13)}`;
};

const college: SceneFn = (w, h) => {
  const stone = "#C9B693";
  let arches = "";
  const n = 4;
  for (let i = 0; i < n; i++) {
    const cx = (w / n) * (i + 0.5);
    const aw = (w / n) * 0.62;
    arches += `<path d="M ${cx - aw / 2} ${h * 0.82} L ${cx - aw / 2} ${h * 0.42} A ${aw / 2} ${aw / 2} 0 0 1 ${cx + aw / 2} ${h * 0.42} L ${cx + aw / 2} ${h * 0.82} Z" fill="#4D4134"/>
    <path d="M ${cx - aw / 2} ${h * 0.82} L ${cx - aw / 2} ${h * 0.42} A ${aw / 2} ${aw / 2} 0 0 1 ${cx + aw / 2} ${h * 0.42}" stroke="${shade(stone, 0.12)}" stroke-width="${w * 0.012}" fill="none"/>
    <rect x="${cx - aw * 0.1}" y="${h * 0.5}" width="${aw * 0.2}" height="${h * 0.32}" fill="#7A8C69" opacity="0.5"/>`;
  }
  let courses = "";
  for (let y = 0; y < h * 0.82; y += h * 0.04) courses += `<rect y="${y}" width="${w}" height="${h * 0.002}" fill="#9C8968" opacity="0.5"/>`;
  return `<rect width="${w}" height="${h}" fill="${stone}"/>${courses}${arches}
  <rect y="0" width="${w}" height="${h * 0.16}" fill="#B4A07E"/>
  ${[0.05, 0.3, 0.7].map((x, i) => `<ellipse cx="${w * x}" cy="${h * 0.12}" rx="${w * 0.14}" ry="${h * (0.07 + i * 0.02)}" fill="#3F5232" opacity="0.92"/>`).join("")}
  <rect y="${h * 0.82}" width="${w}" height="${h * 0.18}" fill="#A69477"/>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${(w / 14) * i}" y="${h * 0.82}" width="${w * 0.002}" height="${h * 0.18}" fill="#857559"/>`).join("")}
  <defs><linearGradient id="shaft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE3AE" stop-opacity="0.35"/><stop offset="0.7" stop-color="#FFE3AE" stop-opacity="0"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#shaft)"/>`;
};

const library: SceneFn = (w, h, seed) => {
  const r = rand(seed);
  const spines = ["#5C2128", "#1E2B44", "#2A4334", "#B48F5E", "#E6DCC6", "#6E4631", "#3C3E42", "#7C6A4C"];
  let shelves = "";
  const rows = 6;
  for (let row = 0; row < rows; row++) {
    const y = h * 0.06 + row * (h * 0.85) / rows;
    const rh = (h * 0.85) / rows;
    let x = w * 0.04;
    while (x < w * 0.6) {
      const bw = w * (0.012 + r() * 0.018);
      const bh = rh * (0.62 + r() * 0.28);
      shelves += `<rect x="${x}" y="${y + rh - bh - rh * 0.08}" width="${bw}" height="${bh}" fill="${spines[Math.floor(r() * spines.length)]}"/>`;
      x += bw + w * 0.002;
    }
    shelves += `<rect x="${w * 0.03}" y="${y + rh - rh * 0.08}" width="${w * 0.6}" height="${rh * 0.08}" fill="#2B1E15"/>`;
  }
  return `<rect width="${w}" height="${h}" fill="#3A2A1E"/>
  <rect x="${w * 0.03}" y="${h * 0.04}" width="${w * 0.6}" height="${h * 0.9}" fill="#2B1F17"/>
  ${shelves}
  <rect x="${w * 0.68}" y="${h * 0.08}" width="${w * 0.26}" height="${h * 0.66}" fill="#F1E2C2"/>
  <rect x="${w * 0.805}" y="${h * 0.08}" width="${w * 0.012}" height="${h * 0.66}" fill="#4A3628"/>
  <rect x="${w * 0.68}" y="${h * 0.36}" width="${w * 0.26}" height="${h * 0.012}" fill="#4A3628"/>
  <polygon points="${w * 0.68},${h * 0.74} ${w * 0.94},${h * 0.74} ${w * 0.7},${h} ${w * 0.35},${h}" fill="#F1E2C2" opacity="0.18"/>
  <g fill="#6E4631"><rect x="${w * 0.66}" y="${h * 0.72}" width="${w * 0.3}" height="${h * 0.16}" rx="${w * 0.03}"/><rect x="${w * 0.64}" y="${h * 0.66}" width="${w * 0.07}" height="${h * 0.24}" rx="${w * 0.03}"/><rect x="${w * 0.91}" y="${h * 0.66}" width="${w * 0.07}" height="${h * 0.24}" rx="${w * 0.03}"/></g>
  <rect x="${w * 0.7}" y="${h * 0.7}" width="${w * 0.22}" height="${h * 0.06}" fill="#EADFC8" opacity="0.95"/>
  <rect y="${h * 0.94}" width="${w}" height="${h * 0.06}" fill="#24180F"/>`;
};

const drive: SceneFn = (w, h) => {
  const hy = h * 0.5;
  const vp = w * 0.42;
  let cypress = "";
  for (let k = 8; k >= 0; k--) {
    const s = 1 / (1 + k * 0.7);
    const base = hy + (h - hy) * s * 0.9;
    const off = w * 0.3 * s + w * 0.01;
    const col = mix("#26321F", "#E5CC98", (1 - s) * 0.7);
    cypress += tree(vp - off, base, h * 0.14 * s, col, "#3B2E22", "cypress") + tree(vp + off, base, h * 0.14 * s, col, "#3B2E22", "cypress");
  }
  const cx = w * 0.62;
  const cy = h * 0.83;
  const cw = w * 0.34;
  return `${sky(w, h, "#C3BBA0", "#F1D8A6", 0.52, { x: 0.45, y: 0.5, r: 0.5, color: "#FFDDA0" })}
  ${hills(w, h, hy, h * 0.08, "#C9A96B", 11)}
  ${hills(w, h, hy + h * 0.03, h * 0.05, "#A9915A", 13)}
  <rect y="${hy + h * 0.03}" width="${w}" height="${h}" fill="#9D8A55"/>
  <polygon points="${vp - w * 0.006},${hy} ${vp + w * 0.006},${hy} ${vp + w * 0.42},${h} ${vp - w * 0.3},${h}" fill="#BCA77E"/>
  ${cypress}
  <g>
    <ellipse cx="${cx}" cy="${cy + h * 0.06}" rx="${cw * 0.55}" ry="${h * 0.02}" fill="#3A2E1E" opacity="0.4"/>
    <path d="M ${cx - cw / 2} ${cy} Q ${cx - cw / 2} ${cy - h * 0.06} ${cx - cw * 0.3} ${cy - h * 0.065} L ${cx + cw * 0.05} ${cy - h * 0.07} L ${cx + cw * 0.2} ${cy - h * 0.11} L ${cx + cw * 0.28} ${cy - h * 0.07} L ${cx + cw * 0.45} ${cy - h * 0.06} Q ${cx + cw / 2} ${cy - h * 0.03} ${cx + cw / 2} ${cy} Z" fill="#E9DEC5"/>
    <path d="M ${cx + cw * 0.05} ${cy - h * 0.07} L ${cx + cw * 0.2} ${cy - h * 0.11}" stroke="#5B544A" stroke-width="${w * 0.003}"/>
    <rect x="${cx - cw * 0.48}" y="${cy - h * 0.02}" width="${cw * 0.96}" height="${h * 0.006}" fill="#8F8573"/>
    <circle cx="${cx - cw * 0.28}" cy="${cy + h * 0.005}" r="${h * 0.04}" fill="#1E1D1B"/><circle cx="${cx - cw * 0.28}" cy="${cy + h * 0.005}" r="${h * 0.02}" fill="#CFC6B2"/>
    <circle cx="${cx + cw * 0.3}" cy="${cy + h * 0.005}" r="${h * 0.04}" fill="#1E1D1B"/><circle cx="${cx + cw * 0.3}" cy="${cy + h * 0.005}" r="${h * 0.02}" fill="#CFC6B2"/>
  </g>`;
};

const atelier: SceneFn = (w, h, seed) => {
  const r = rand(seed);
  let grain = "";
  for (let i = 0; i < 40; i++) grain += `<rect x="0" y="${r() * h}" width="${w}" height="${h * 0.002}" fill="#5E4530" opacity="${0.15 + r() * 0.25}"/>`;
  return `<rect width="${w}" height="${h}" fill="#8A6A4A"/>${grain}
  <path d="M ${w * 0.1} ${h * 0.12} L ${w * 0.62} ${h * 0.1} L ${w * 0.7} ${h * 0.55} L ${w * 0.16} ${h * 0.6} Z" fill="#EDE3CF"/>
  <path d="M ${w * 0.14} ${h * 0.16} L ${w * 0.58} ${h * 0.14} L ${w * 0.65} ${h * 0.52} L ${w * 0.19} ${h * 0.56} Z" stroke="#9A8B70" stroke-width="${w * 0.003}" stroke-dasharray="${w * 0.012} ${w * 0.008}" fill="none"/>
  <rect x="${w * 0.42}" y="${h * 0.58}" width="${w * 0.6}" height="${h * 0.2}" fill="#55585C" transform="rotate(-8 ${w * 0.7} ${h * 0.68})"/>
  <ellipse cx="${w * 0.43}" cy="${h * 0.7}" rx="${w * 0.04}" ry="${h * 0.1}" fill="#3F4246" transform="rotate(-8 ${w * 0.7} ${h * 0.68})"/>
  <g transform="rotate(25 ${w * 0.3} ${h * 0.78})"><circle cx="${w * 0.2}" cy="${h * 0.78}" r="${w * 0.035}" stroke="#2B2B2D" stroke-width="${w * 0.012}" fill="none"/><circle cx="${w * 0.2}" cy="${h * 0.86}" r="${w * 0.035}" stroke="#2B2B2D" stroke-width="${w * 0.012}" fill="none"/><polygon points="${w * 0.235},${h * 0.79} ${w * 0.5},${h * 0.81} ${w * 0.235},${h * 0.83}" fill="#B9BCC0"/></g>
  <path d="M ${w * 0.62} ${h * 0.2} Q ${w * 0.9} ${h * 0.25} ${w * 0.82} ${h * 0.45} T ${w * 0.95} ${h * 0.6}" stroke="#D9B84F" stroke-width="${w * 0.03}" fill="none"/>
  <polygon points="${w * 0.3},${h * 0.66} ${w * 0.37},${h * 0.64} ${w * 0.34},${h * 0.7}" fill="#EFEADF"/>`;
};

const stilllife: SceneFn = (w, h) => {
  return `<rect width="${w}" height="${h}" fill="#7E6246"/>
  ${Array.from({ length: 30 }, (_, i) => `<rect y="${(h / 30) * i}" width="${w}" height="${h * 0.003}" fill="#5F4732" opacity="0.4"/>`).join("")}
  <rect x="${w * 0.12}" y="${h * 0.14}" width="${w * 0.44}" height="${h * 0.3}" fill="#1E2B44"/><rect x="${w * 0.12}" y="${h * 0.14}" width="${w * 0.44}" height="${h * 0.04}" fill="#2B3A57"/>
  <rect x="${w * 0.15}" y="${h * 0.1}" width="${w * 0.4}" height="${h * 0.06}" fill="#EADFC8"/>
  <rect x="${w * 0.6}" y="${h * 0.2}" width="${w * 0.3}" height="${h * 0.3}" fill="#5C2128" transform="rotate(12 ${w * 0.75} ${h * 0.35})"/>
  <circle cx="${w * 0.38}" cy="${h * 0.7}" r="${Math.min(w, h) * 0.16}" stroke="#6E4631" stroke-width="${Math.min(w, h) * 0.045}" fill="none"/>
  <rect x="${w * 0.36}" y="${h * 0.52}" width="${w * 0.08}" height="${h * 0.05}" stroke="#C9A35F" stroke-width="${w * 0.01}" fill="none"/>
  <ellipse cx="${w * 0.76}" cy="${h * 0.74}" rx="${w * 0.14}" ry="${h * 0.09}" fill="#2A4334"/><ellipse cx="${w * 0.84}" cy="${h * 0.8}" rx="${w * 0.1}" ry="${h * 0.03}" fill="#22382B"/>`;
};

const SCENES: Record<media.Scene, SceneFn> = { estate, garden, stables, lawn, regatta, riviera, college, library, drive, atelier, stilllife };

/* ---------- productos ---------- */
function garment(p: Product, color: ProductColor, view: number, w: number, h: number) {
  const c = color.hex;
  const seam = shade(c, lum(c) < 90 ? 0.18 : -0.18);
  const stroke = `stroke="${seam}" stroke-width="${w * 0.004}" fill="none"`;
  const U = (x: number) => w * x;
  const V = (y: number) => h * y;
  const back = view === 2;
  const slug = p.slug;
  let body = "";
  switch (p.category) {
    case "shirts":
    case "polo": {
      const short = p.category === "polo";
      const sleeve = short
        ? `<polygon points="${U(0.3)},${V(0.24)} ${U(0.14)},${V(0.36)} ${U(0.2)},${V(0.45)} ${U(0.32)},${V(0.38)}" fill="${c}"/><polygon points="${U(0.7)},${V(0.24)} ${U(0.86)},${V(0.36)} ${U(0.8)},${V(0.45)} ${U(0.68)},${V(0.38)}" fill="${c}"/>`
        : `<polygon points="${U(0.3)},${V(0.24)} ${U(0.12)},${V(0.6)} ${U(0.2)},${V(0.63)} ${U(0.33)},${V(0.4)}" fill="${c}"/><polygon points="${U(0.7)},${V(0.24)} ${U(0.88)},${V(0.6)} ${U(0.8)},${V(0.63)} ${U(0.67)},${V(0.4)}" fill="${c}"/>`;
      body = `${sleeve}
      <path d="M ${U(0.3)} ${V(0.24)} L ${U(0.42)} ${V(0.19)} L ${U(0.58)} ${V(0.19)} L ${U(0.7)} ${V(0.24)} L ${U(0.69)} ${V(0.8)} Q ${U(0.5)} ${V(0.84)} ${U(0.31)} ${V(0.8)} Z" fill="${c}"/>
      ${back ? `<path d="M ${U(0.31)} ${V(0.3)} L ${U(0.69)} ${V(0.3)}" ${stroke}/>` : `<polygon points="${U(0.42)},${V(0.19)} ${U(0.5)},${V(0.27)} ${U(0.45)},${V(0.29)} ${U(0.39)},${V(0.22)}" fill="${shade(c, -0.06)}"/><polygon points="${U(0.58)},${V(0.19)} ${U(0.5)},${V(0.27)} ${U(0.55)},${V(0.29)} ${U(0.61)},${V(0.22)}" fill="${shade(c, -0.06)}"/>
      <path d="M ${U(0.5)} ${V(0.27)} L ${U(0.5)} ${V(short ? 0.38 : 0.82)}" ${stroke}/>
      ${Array.from({ length: short ? 2 : 6 }, (_, i) => `<circle cx="${U(0.512)}" cy="${V(0.31 + i * 0.085)}" r="${w * 0.006}" fill="${shade(c, -0.25)}"/>`).join("")}
      ${short ? `<g fill="${seam}" opacity="0.7"><text x="${U(0.36)}" y="${V(0.36)}" font-family="Georgia, serif" font-size="${w * 0.025}">HW</text></g>` : `<path d="M ${U(0.36)} ${V(0.36)} h ${U(0.07)} v ${V(0.06)} h -${U(0.07)} Z" ${stroke}/>`}`}`;
      break;
    }
    case "knitwear": {
      const vest = slug.includes("vest");
      const sleeves = vest
        ? ""
        : `<polygon points="${U(0.3)},${V(0.24)} ${U(0.12)},${V(0.62)} ${U(0.2)},${V(0.66)} ${U(0.33)},${V(0.42)}" fill="${c}"/><polygon points="${U(0.7)},${V(0.24)} ${U(0.88)},${V(0.62)} ${U(0.8)},${V(0.66)} ${U(0.67)},${V(0.42)}" fill="${c}"/>`;
      let cables = "";
      if (slug.includes("cable") && !back) for (const x of [0.4, 0.5, 0.6]) for (let y = 0.3; y < 0.74; y += 0.06) cables += `<path d="M ${U(x - 0.025)} ${V(y)} Q ${U(x)} ${V(y + 0.03)} ${U(x + 0.025)} ${V(y + 0.06)} M ${U(x + 0.025)} ${V(y)} Q ${U(x)} ${V(y + 0.03)} ${U(x - 0.025)} ${V(y + 0.06)}" ${stroke}/>`;
      body = `${sleeves}
      <path d="M ${U(0.3)} ${V(0.24)} L ${U(0.42)} ${V(0.2)} L ${U(0.58)} ${V(0.2)} L ${U(0.7)} ${V(0.24)} L ${U(0.68)} ${V(0.78)} L ${U(0.32)} ${V(0.78)} Z" fill="${c}"/>
      <rect x="${U(0.32)}" y="${V(0.74)}" width="${U(0.36)}" height="${V(0.05)}" fill="${shade(c, -0.07)}"/>
      ${back ? "" : vest ? `<polygon points="${U(0.42)},${V(0.2)} ${U(0.5)},${V(0.38)} ${U(0.58)},${V(0.2)}" fill="${shade(c, -0.3)}"/><path d="M ${U(0.43)} ${V(0.22)} L ${U(0.5)} ${V(0.36)} L ${U(0.57)} ${V(0.22)}" stroke="${slug.includes("cricket") ? "#5C2128" : seam}" stroke-width="${w * 0.008}" fill="none"/>` : `<path d="M ${U(0.42)} ${V(0.2)} Q ${U(0.5)} ${V(0.27)} ${U(0.58)} ${V(0.2)}" stroke="${shade(c, -0.12)}" stroke-width="${w * 0.018}" fill="none"/>`}
      ${cables}`;
      break;
    }
    case "trousers": {
      body = `<path d="M ${U(0.32)} ${V(0.14)} L ${U(0.68)} ${V(0.14)} L ${U(0.72)} ${V(0.88)} L ${U(0.54)} ${V(0.88)} L ${U(0.5)} ${V(0.38)} L ${U(0.46)} ${V(0.88)} L ${U(0.28)} ${V(0.88)} Z" fill="${c}"/>
      <rect x="${U(0.32)}" y="${V(0.14)}" width="${U(0.36)}" height="${V(0.04)}" fill="${shade(c, -0.08)}"/>
      ${back ? `<path d="M ${U(0.37)} ${V(0.24)} h ${U(0.08)} M ${U(0.55)} ${V(0.24)} h ${U(0.08)}" ${stroke}/>` : `<path d="M ${U(0.5)} ${V(0.18)} L ${U(0.5)} ${V(0.34)} M ${U(0.4)} ${V(0.18)} L ${U(0.37)} ${V(0.88)} M ${U(0.6)} ${V(0.18)} L ${U(0.63)} ${V(0.88)}" ${stroke}/>`}
      <rect x="${U(0.28)}" y="${V(0.85)}" width="${U(0.18)}" height="${V(0.03)}" fill="${shade(c, -0.06)}"/><rect x="${U(0.54)}" y="${V(0.85)}" width="${U(0.18)}" height="${V(0.03)}" fill="${shade(c, -0.06)}"/>`;
      break;
    }
    case "outerwear": {
      const long = slug.includes("coat");
      const hem = long ? 0.9 : 0.78;
      const field = slug.includes("field");
      body = `<polygon points="${U(0.28)},${V(0.22)} ${U(0.1)},${V(0.66)} ${U(0.19)},${V(0.69)} ${U(0.32)},${V(0.42)}" fill="${c}"/><polygon points="${U(0.72)},${V(0.22)} ${U(0.9)},${V(0.66)} ${U(0.81)},${V(0.69)} ${U(0.68)},${V(0.42)}" fill="${c}"/>
      <path d="M ${U(0.28)} ${V(0.22)} L ${U(0.42)} ${V(0.17)} L ${U(0.58)} ${V(0.17)} L ${U(0.72)} ${V(0.22)} L ${U(0.71)} ${V(hem)} L ${U(0.29)} ${V(hem)} Z" fill="${c}"/>
      ${back ? `<path d="M ${U(0.5)} ${V(long ? 0.5 : 0.6)} L ${U(0.5)} ${V(hem)}" ${stroke}/>${long ? `<rect x="${U(0.38)}" y="${V(0.5)}" width="${U(0.24)}" height="${V(0.03)}" fill="${shade(c, -0.08)}"/>` : ""}` : field ? `<polygon points="${U(0.4)},${V(0.16)} ${U(0.6)},${V(0.16)} ${U(0.63)},${V(0.22)} ${U(0.37)},${V(0.22)}" fill="#3E2B1F"/><path d="M ${U(0.5)} ${V(0.22)} L ${U(0.5)} ${V(hem)}" ${stroke}/>${[0.34, 0.54].flatMap((x) => [0.32, 0.56].map((y) => `<rect x="${U(x)}" y="${V(y)}" width="${U(0.12)}" height="${V(0.1)}" fill="${shade(c, -0.05)}" stroke="${seam}" stroke-width="${w * 0.003}"/>`)).join("")}` : `<polygon points="${U(0.42)},${V(0.17)} ${U(0.5)},${V(0.44)} ${U(0.41)},${V(0.36)} ${U(0.36)},${V(0.22)}" fill="${shade(c, -0.1)}"/><polygon points="${U(0.58)},${V(0.17)} ${U(0.5)},${V(0.44)} ${U(0.59)},${V(0.36)} ${U(0.64)},${V(0.22)}" fill="${shade(c, -0.1)}"/>
      ${[0.48, 0.58, long ? 0.68 : 0.58].map((y) => `<circle cx="${U(0.45)}" cy="${V(y)}" r="${w * 0.011}" fill="#B08A4E"/><circle cx="${U(0.55)}" cy="${V(y)}" r="${w * 0.011}" fill="#B08A4E"/>`).join("")}
      <path d="M ${U(0.33)} ${V(0.62)} h ${U(0.1)} M ${U(0.57)} ${V(0.62)} h ${U(0.1)} M ${U(0.35)} ${V(0.33)} h ${U(0.07)}" ${stroke}/>`}`;
      break;
    }
    case "accessories": {
      if (slug.includes("belt")) {
        body = `<circle cx="${U(0.5)}" cy="${V(0.5)}" r="${w * 0.24}" stroke="${c}" stroke-width="${w * 0.07}" fill="none"/>
        <circle cx="${U(0.5)}" cy="${V(0.5)}" r="${w * 0.24}" stroke="${seam}" stroke-width="${w * 0.002}" stroke-dasharray="${w * 0.01} ${w * 0.008}" fill="none"/>
        <rect x="${U(0.44)}" y="${V(0.5) - w * 0.28}" width="${U(0.12)}" height="${w * 0.09}" stroke="#B5904F" stroke-width="${w * 0.014}" fill="none"/>
        <rect x="${U(0.62)}" y="${V(0.5) + w * 0.12}" width="${U(0.2)}" height="${w * 0.07}" fill="${c}" transform="rotate(-30 ${U(0.72)} ${V(0.5) + w * 0.15})"/>`;
      } else if (slug.includes("cap")) {
        body = `<path d="M ${U(0.24)} ${V(0.56)} Q ${U(0.24)} ${V(0.3)} ${U(0.5)} ${V(0.3)} Q ${U(0.76)} ${V(0.3)} ${U(0.76)} ${V(0.56)} Z" fill="${c}"/>
        <path d="M ${U(0.5)} ${V(0.3)} L ${U(0.5)} ${V(0.56)} M ${U(0.37)} ${V(0.33)} Q ${U(0.4)} ${V(0.45)} ${U(0.38)} ${V(0.56)} M ${U(0.63)} ${V(0.33)} Q ${U(0.6)} ${V(0.45)} ${U(0.62)} ${V(0.56)}" ${stroke}/>
        <path d="M ${U(0.2)} ${V(0.56)} Q ${U(0.5)} ${V(back ? 0.6 : 0.68)} ${U(0.8)} ${V(0.56)} Q ${U(0.5)} ${V(0.6)} ${U(0.2)} ${V(0.56)} Z" fill="${shade(c, -0.1)}"/>
        <circle cx="${U(0.5)}" cy="${V(0.3)}" r="${w * 0.012}" fill="${shade(c, -0.15)}"/>
        ${back ? `<rect x="${U(0.44)}" y="${V(0.5)}" width="${U(0.12)}" height="${V(0.03)}" fill="#6E4631"/>` : `<text x="${U(0.5)}" y="${V(0.47)}" text-anchor="middle" font-family="Georgia, serif" font-size="${w * 0.05}" fill="${seam}">HW</text>`}`;
      } else {
        body = `<rect x="${U(0.28)}" y="${V(0.28)}" width="${U(0.44)}" height="${U(0.44)}" fill="${c}" transform="rotate(45 ${U(0.5)} ${V(0.28) + U(0.22)})"/>
        <rect x="${U(0.33)}" y="${V(0.28) + U(0.05)}" width="${U(0.34)}" height="${U(0.34)}" stroke="#E9DFC8" stroke-width="${w * 0.006}" fill="none" transform="rotate(45 ${U(0.5)} ${V(0.28) + U(0.22)})"/>
        ${[0, 1, 2, 3].map((i) => `<polygon points="${U(0.42 + i * 0.05)},${V(0.4)} ${U(0.45 + i * 0.05)},${V(0.46)} ${U(0.42 + i * 0.05)},${V(0.46)}" fill="${i % 2 ? "#E9DFC8" : "#B5904F"}"/>`).join("")}`;
      }
      break;
    }
  }
  return body;
}

function productSvg(p: Product, color: ProductColor, view: number, w: number, h: number) {
  const c = color.hex;
  const light = lum(c) > 190;
  const backdrop = light ? "#CDBFA6" : "#E6DCCB";
  const label = ["PLACEHOLDER", `products/${p.slug}/${color.id}-${view}.jpg`, `${["FRENTE", "ESPALDA", "DETALLE"][view - 1]} · 4:5 · 1600×2000`];
  if (view === 3) {
    // Macro de tela: trama + botón o costura
    const seam = shade(c, lum(c) < 90 ? 0.14 : -0.14);
    let weave = "";
    const step = w * 0.018;
    for (let x = 0; x < w; x += step) weave += `<rect x="${x}" y="0" width="${step * 0.45}" height="${h}" fill="${seam}" opacity="0.18"/>`;
    for (let y = 0; y < h; y += step) weave += `<rect x="0" y="${y}" width="${w}" height="${step * 0.4}" fill="${shade(c, 0.1)}" opacity="0.14"/>`;
    const accessory = p.category === "accessories";
    return film(w, h, `<rect width="${w}" height="${h}" fill="${c}"/>${weave}
      <path d="M 0 ${h * 0.62} Q ${w * 0.5} ${h * 0.56} ${w} ${h * 0.64}" stroke="${shade(c, -0.25)}" stroke-width="${w * 0.006}" stroke-dasharray="${w * 0.02} ${w * 0.012}" fill="none"/>
      ${accessory ? `<rect x="${w * 0.36}" y="${h * 0.28}" width="${w * 0.28}" height="${h * 0.16}" stroke="#B5904F" stroke-width="${w * 0.03}" fill="none"/>` : `<circle cx="${w * 0.5}" cy="${h * 0.38}" r="${w * 0.07}" fill="${p.category === "outerwear" ? "#B08A4E" : "#EFE8DA"}"/><circle cx="${w * 0.48}" cy="${h * 0.37}" r="${w * 0.008}" fill="${shade(c, -0.3)}"/><circle cx="${w * 0.52}" cy="${h * 0.39}" r="${w * 0.008}" fill="${shade(c, -0.3)}"/>`}`, { warm: 0.06, vignette: 0.35, grain: 0.08, label, labelOnDark: lum(c) < 140 });
  }
  return film(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${backdrop}"/>
    <rect y="${h * 0.9}" width="${w}" height="${h * 0.1}" fill="${shade(backdrop, -0.05)}"/>
    <g filter="url(#soft)" opacity="0.35" transform="translate(${w * 0.015} ${h * 0.015})"><g fill="#2b2118">${garment(p, { ...color, hex: "#2b2118" }, view, w, h)}</g></g>
    ${garment(p, color, view, w, h)}`,
    { warm: 0.05, vignette: 0.22, grain: 0.06, label },
  );
}

/* Macros editoriales específicos */
function clothMacro(w: number, h: number, label: string[]) {
  let weave = "";
  const step = w * 0.03;
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step) {
      const odd = (Math.round(x / step) + Math.round(y / step)) % 2;
      weave += `<rect x="${x}" y="${y}" width="${step * 0.95}" height="${step * 0.95}" fill="${odd ? "#2A3550" : "#1E2B44"}"/>`;
    }
  return film(w, h, `<rect width="${w}" height="${h}" fill="#1E2B44"/>${weave}<path d="M ${w * 0.1} ${h * 0.7} Q ${w * 0.5} ${h * 0.6} ${w * 0.9} ${h * 0.72}" stroke="#C9B48A" stroke-width="${w * 0.006}" stroke-dasharray="${w * 0.02} ${w * 0.014}" fill="none"/>`, { label, labelOnDark: true });
}
function labelMacro(w: number, h: number, label: string[]) {
  return film(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="#E9E0CD"/>
    ${Array.from({ length: 60 }, (_, i) => `<rect x="${(w / 60) * i}" y="0" width="${w * 0.004}" height="${h}" fill="#CFC3AA" opacity="0.6"/>`).join("")}
    <rect x="${w * 0.2}" y="${h * 0.38}" width="${w * 0.6}" height="${h * 0.2}" fill="#1E2B44"/>
    <rect x="${w * 0.22}" y="${h * 0.395}" width="${w * 0.56}" height="${h * 0.17}" stroke="#A3854F" stroke-width="${w * 0.003}" fill="none"/>
    <text x="${w * 0.5}" y="${h * 0.495}" text-anchor="middle" font-family="Georgia, serif" font-size="${w * 0.055}" letter-spacing="${w * 0.012}" fill="#D9C49A">HARTWELL</text>
    <text x="${w * 0.5}" y="${h * 0.54}" text-anchor="middle" font-family="Georgia, serif" font-size="${w * 0.02}" letter-spacing="${w * 0.006}" fill="#B9A27A">EST. 1931</text>
    <path d="M ${w * 0.2} ${h * 0.38} v ${h * 0.2} M ${w * 0.8} ${h * 0.38} v ${h * 0.2}" stroke="#E9E0CD" stroke-width="${w * 0.004}" stroke-dasharray="${w * 0.01} ${w * 0.008}"/>`,
    { label },
  );
}

const ratio = (w: number, h: number) => {
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  const d = g(w, h);
  return `${w / d}:${h / d}`;
};

async function slotImage(s: media.MediaSlot, seed: number, withLabel = true) {
  const label = withLabel ? ["PLACEHOLDER", s.src.replace("/assets/hartwell/", ""), `${ratio(s.w, s.h)} · ${s.w}×${s.h}`] : undefined;
  const dark = ["stables", "library", "atelier", "stilllife"].includes(s.scene);
  await writeSvg(s.src, film(s.w, s.h, SCENES[s.scene](s.w, s.h, seed), { label, labelOnDark: dark }), s.w, s.h);
}

/* ---------- texturas ---------- */
async function textures() {
  const paper = path.join(ROOT, media.textures.paper);
  if (!existsSync(paper) || FORCE) {
    mkdirSync(path.dirname(paper), { recursive: true });
    const size = 256;
    const r = rand(42);
    const buf = Buffer.alloc(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const v = r();
      const tone = v > 0.5 ? 255 : 40;
      buf[i * 4] = tone;
      buf[i * 4 + 1] = tone - 10;
      buf[i * 4 + 2] = tone - 25;
      buf[i * 4 + 3] = Math.round(Math.abs(v - 0.5) * 2 * 34);
    }
    await sharp(buf, { raw: { width: size, height: size, channels: 4 } }).png().toFile(paper);
    written++;
  } else skipped++;

  const W = 480;
  const r = rand(9);
  let lines = "";
  for (let i = 0; i < W; i += 3) {
    lines += `<rect x="${i}" y="0" width="1.2" height="${W}" fill="#8f7d5e" opacity="${(0.05 + r() * 0.12).toFixed(3)}"/>`;
    lines += `<rect x="0" y="${i}" width="${W}" height="1.2" fill="#8f7d5e" opacity="${(0.04 + r() * 0.1).toFixed(3)}"/>`;
  }
  await writeSvg(media.textures.linen, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}"><rect width="${W}" height="${W}" fill="#E9E0CE"/>${lines}</svg>`, W, W);
}

async function main() {
  for (const p of products)
    for (const color of p.colors)
      for (let n = 1; n <= IMAGES_PER_COLOR; n++) await writeSvg(productImage(p.slug, color.id, n), productSvg(p, color, n, 1600, 2000), 1600, 2000);

  const slots: media.MediaSlot[] = [
    media.collection.lead,
    media.collection.hero,
    media.collection.mood,
    media.clubhouse.lead,
    ...Object.values(media.categoryMedia),
    ...media.lookbookFrames,
    media.heritage.archive,
    media.editorial.portrait,
    media.editorial.landscape,
    media.details.cut,
    media.finalCta.desktop,
    media.finalCta.mobile,
    media.about.lead,
    media.about.atelier,
    media.about.archive,
  ];
  let seed = 1;
  for (const s of slots) await slotImage(s, seed++);

  const d = media.details;
  await writeSvg(d.cloth.src, clothMacro(d.cloth.w, d.cloth.h, ["PLACEHOLDER", d.cloth.src.replace("/assets/hartwell/", ""), "1:1 · 1400×1400"]), d.cloth.w, d.cloth.h);
  await writeSvg(d.label.src, labelMacro(d.label.w, d.label.h, ["PLACEHOLDER", d.label.src.replace("/assets/hartwell/", ""), "1:1 · 1400×1400"]), d.label.w, d.label.h);

  // Posters del hero sin etiqueta: el componente muestra el aviso en desarrollo
  await slotImage(media.hero.poster, 3, false);
  await slotImage(media.hero.posterMobile, 3, false);

  await textures();
  console.log(`Placeholders: ${written} generados, ${skipped} existentes preservados.`);
}

main();
