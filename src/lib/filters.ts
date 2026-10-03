export type ShopFilters = { color?: string; talle?: string; orden?: string };

export function pickFilters(sp: Record<string, string | string[] | undefined>): ShopFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return { color: one(sp.color), talle: one(sp.talle), orden: one(sp.orden) };
}
