import { categories, products, type Product } from "@/content/products";

/** Normaliza para comparar sin mayúsculas ni tildes. */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/** Sinónimos en español para términos de la colección (la ropa se nombra en inglés). */
const SYNONYMS: Record<string, string[]> = {
  camisa: ["shirts", "oxford", "linen", "poplin"],
  camisas: ["shirts"],
  sweater: ["knitwear"],
  sueter: ["knitwear"],
  pullover: ["knitwear"],
  punto: ["knitwear"],
  pantalon: ["trousers", "chino", "flannel"],
  pantalones: ["trousers"],
  saco: ["blazer"],
  abrigo: ["coat", "outerwear"],
  chaqueta: ["jacket", "outerwear"],
  campera: ["jacket", "outerwear"],
  cinturon: ["belt"],
  gorra: ["cap"],
  panuelo: ["scarf"],
  lino: ["linen"],
  lana: ["wool", "merino", "flannel"],
  seda: ["silk"],
  cuero: ["leather"],
  azul: ["navy", "oxford", "riviera"],
  verde: ["forest", "loden"],
  bordo: ["oxblood"],
  blanco: ["chalk", "ecru", "cream"],
  beige: ["sand", "stone", "camel", "cream"],
  marron: ["chestnut", "espresso", "camel"],
  gris: ["charcoal", "stone"],
};

function haystack(p: Product) {
  const cat = categories.find((c) => c.id === p.category);
  return normalize([p.name, p.category, cat?.label, p.summary, p.cloth, ...p.colors.map((c) => c.name), ...p.tags].join(" "));
}

const index = products.map((p) => ({ p, text: haystack(p) }));

/** Todas las palabras de la búsqueda deben aparecer (o un sinónimo de cada una). */
export function searchProducts(query: string): Product[] {
  const words = normalize(query).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  const scored = index
    .map(({ p, text }) => {
      let score = 0;
      for (const w of words) {
        const options = [w, ...(SYNONYMS[w] ?? [])];
        const hit = options.find((o) => text.includes(o));
        if (!hit) return null;
        score += normalize(p.name).includes(hit) ? 3 : 1;
      }
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => !!x);
  return scored.sort((a, b) => b.score - a.score).map((x) => x.p);
}

export const SEARCH_SUGGESTIONS = ["Lino", "Cashmere", "Navy", "Polo", "Blazer", "Cuero"];
