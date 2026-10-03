import Link from "next/link";
import { getProduct } from "@/content/products";
import { ProductCard } from "@/components/product/product-card";
import { LineReveal, Reveal } from "@/components/ui/motion";

/** Una pieza mayor y cuatro que la acompañan a distintas alturas: la vitrina de la Casa. */
const placement = [
  { slug: "hartwell-signature-oxford", cls: "col-span-2 lg:col-span-6 lg:row-span-2", sizes: "(min-width: 1024px) 46vw, 100vw", ratio: "aspect-[4/5]" },
  { slug: "cashmere-crewneck", cls: "lg:col-span-3", sizes: "(min-width: 1024px) 22vw, 50vw", ratio: "aspect-[4/5]" },
  { slug: "country-chino-trouser", cls: "mt-14 lg:col-span-3 lg:mt-24", sizes: "(min-width: 1024px) 22vw, 50vw", ratio: "aspect-[3/4]" },
  { slug: "classic-leather-belt", cls: "lg:col-span-3 lg:mt-0", sizes: "(min-width: 1024px) 22vw, 50vw", ratio: "aspect-[3/4]" },
  { slug: "hartwell-wool-blazer", cls: "mt-14 lg:col-span-3 lg:mt-16", sizes: "(min-width: 1024px) 22vw, 50vw", ratio: "aspect-[4/5]" },
];

export function Essentials() {
  return (
    <section aria-labelledby="essentials-title" className="bg-paper px-4 py-24 md:px-10 lg:py-36">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <LineReveal id="essentials-title" lang="en" lines={[<>The <em>Essentials</em></>]} className="display text-[clamp(2.8rem,6vw,5.8rem)]" />
          <Link href="/shop" className="label link-rule mb-3">
            Ver el shop
          </Link>
        </div>
        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-8 lg:mt-20 lg:grid-cols-12 lg:gap-x-10">
          {placement.map((pl, i) => {
            const p = getProduct(pl.slug)!;
            return (
              <Reveal as="li" key={p.slug} delay={(i % 3) * 0.1} className={pl.cls}>
                <ProductCard product={p} sizes={pl.sizes} ratio={pl.ratio} />
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
