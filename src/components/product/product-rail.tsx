import type { Product } from "@/content/products";
import { ProductCard } from "./product-card";
import { LineReveal } from "@/components/ui/motion";

/**
 * Rail con snap. "Completar el conjunto" usa superficie de lino para separarse de las recomendaciones.
 * Con dos piezas, se presenta como un díptico desplazado a la derecha.
 */
export function ProductRail({ title, emphasis, items, linen = false }: { title: string; emphasis?: string; items: Product[]; linen?: boolean }) {
  if (!items.length) return null;
  const pair = items.length <= 2;
  return (
    <section aria-label={`${title}${emphasis ? ` ${emphasis}` : ""}`} className={`py-20 lg:py-28 ${linen ? "surface-linen" : ""}`}>
      <div className="mx-auto max-w-[1440px] px-4 md:px-10">
        <LineReveal lines={[<>{title} {emphasis && <em>{emphasis}</em>}</>]} className="display text-[clamp(2.2rem,4.6vw,4rem)]" />
      </div>
      <ul
        className={
          pair
            ? "mx-auto mt-12 grid max-w-[1440px] grid-cols-2 gap-4 px-4 md:px-10 lg:w-[62%] lg:mr-0 lg:ml-auto lg:gap-10"
            : "scrollbar-none mx-auto mt-12 flex max-w-[1440px] snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 md:scroll-px-10 md:px-10 lg:gap-8"
        }
      >
        {items.map((p) => (
          <li key={p.slug} className={pair ? "" : "w-[72vw] shrink-0 snap-start sm:w-[42vw] lg:w-[calc((100%-6rem)/4)]"}>
            <ProductCard product={p} sizes={pair ? "(min-width: 1024px) 30vw, 50vw" : "(min-width: 1024px) 24vw, 72vw"} />
          </li>
        ))}
      </ul>
    </section>
  );
}
