import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { SearchForm } from "@/components/shop/search-form";
import { pickFilters } from "@/lib/filters";
import Link from "next/link";
import { categories } from "@/content/products";
import { SEARCH_SUGGESTIONS, searchProducts } from "@/lib/search";

export const metadata: Metadata = { title: "Buscar", robots: { index: false } };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 80) ?? "";
  const results = q ? searchProducts(q) : [];
  return (
    <ShopView
      key={q}
      items={results}
      query={q || undefined}
      initial={pickFilters(sp)}
      heading={
        <>
          <h1 className="display text-[clamp(2.8rem,6.5vw,6rem)] leading-[1]">
            {q ? (
              <>
                Resultados para <em>«{q}»</em>
              </>
            ) : (
              <>
                Buscar en <em>la Casa</em>
              </>
            )}
          </h1>
          <SearchForm defaultValue={q} />
        </>
      }
      emptyState={
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="smallcaps text-sm text-ink-soft">Búsquedas frecuentes</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SEARCH_SUGGESTIONS.map((s) => (
                <li key={s}>
                  <Link href={`/search?q=${encodeURIComponent(s)}`} className="flex h-11 items-center px-4 text-sm shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors hover:bg-ink hover:text-paper">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="smallcaps text-sm text-ink-soft">Categorías</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-8">
              {categories.map((c) => (
                <li key={c.id} className="border-b border-line">
                  <Link href={`/shop/${c.id}`} className="flex min-h-12 items-center py-2 font-serif text-2xl hover:text-navy">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
      intro={q ? (results.length ? `${results.length} ${results.length === 1 ? "pieza coincide" : "piezas coinciden"} con la búsqueda.` : "Ninguna pieza coincide. Probar con otra prenda, tela o color.") : "Prenda, tela o color: lino, cashmere, navy, blazer."}
    />
  );
}
