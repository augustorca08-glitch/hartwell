export const BRAND = "HARTWELL";
export const FOUNDED = 1931;

export const FREE_SHIPPING_FROM = 300;
export const SHIPPING_OPTIONS = [
  { id: "standard", label: "Estándar", detail: "3 a 5 días hábiles", price: 12 },
  { id: "express", label: "Express", detail: "24 a 48 horas", price: 25 },
  { id: "pickup", label: "Retiro en la Casa", detail: "Recoleta, Buenos Aires", price: 0 },
] as const;

/** Número ficticio. Reemplazar por el real (formato internacional, sin + ni espacios). */
export const WHATSAPP_NUMBER = "5491100000000";
export const CONCIERGE_EMAIL = "concierge@hartwell.example";

const usd = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", currencyDisplay: "symbol", maximumFractionDigits: 0 });

/** Precios en dólares con formato local (es-AR muestra "US$ 1.200"). */
export function formatPrice(n: number) {
  return usd.format(n).replace(/\s/g, " ");
}

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/collection/estate-summer", label: "New Collection" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/about", label: "About" },
] as const;

/** Rutas cuyo primer bloque es fotografía a pantalla completa: el header empieza transparente. */
export const OVER_MEDIA_ROUTES = ["/", "/collection/estate-summer"];

export function whatsappLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Números romanos para capítulos y fichas */
export function roman(n: number) {
  const map: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) {
    out += s;
    n -= v;
  }
  return out;
}
