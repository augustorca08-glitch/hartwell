import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProduct, productImage, products } from "@/content/products";
import { collection } from "@/content/media";
import { formatPrice } from "@/lib/site";
import { CollectionHero } from "@/components/collection/collection-hero";
import { FrameReveal, LineReveal, Parallax, Reveal } from "@/components/ui/motion";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "The Estate Summer",
  description: "La nueva colección HARTWELL: una temporada en la finca, del embarcadero al club.",
};

/** Cada pieza principal tiene su propia composición: la colección se presenta como editorial, no como grilla. */
const features = [
  { slug: "hartwell-wool-blazer", color: "navy", layout: "lg:grid-cols-[1.25fr_1fr] lg:items-end", ratio: "aspect-[4/5]" },
  { slug: "regatta-linen-shirt", color: "chalk", layout: "lg:grid-cols-[1fr_1.1fr] lg:items-center lg:[&>*:first-child]:order-last", ratio: "aspect-[3/4]" },
  { slug: "heritage-cable-sweater", color: "cream", layout: "lg:grid-cols-[0.85fr_1.15fr] lg:items-start", ratio: "aspect-[4/5]" },
];

export default function CollectionPage() {
  const shown = new Set(features.map((f) => f.slug));
  const rest = products.filter((p) => p.tags.includes("collection") && !shown.has(p.slug));
  return (
    <>
      <CollectionHero />

      <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-10 lg:py-36">
        <div className="flex flex-col gap-28 lg:gap-44">
          {features.map((f) => {
            const p = getProduct(f.slug)!;
            const c = p.colors.find((x) => x.id === f.color) ?? p.colors[0];
            const words = p.name.split(" ");
            const last = words.pop();
            return (
              <article key={p.slug} className={`grid gap-10 lg:gap-20 ${f.layout}`}>
                <Parallax distance={30}>
                  <Link href={`/product/${p.slug}?color=${c.id}`} className="group frame block">
                    <FrameReveal className={`relative overflow-hidden bg-cream ${f.ratio}`}>
                      <Image src={productImage(p.slug, c.id, 1)} alt={`${p.name} en ${c.name}`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1.8s] ease-[var(--ease-quiet)] group-hover:scale-[1.03]" />
                    </FrameReveal>
                  </Link>
                </Parallax>
                <div>
                  <Reveal>
                    <p className="smallcaps text-sm text-ink-soft">Nº {p.ref}</p>
                  </Reveal>
                  <LineReveal lang="en" lines={[<>{words.join(" ")} <em>{last}</em></>]} className="display mt-2 text-[clamp(2.6rem,5vw,5rem)] leading-[1]" />
                  <Reveal delay={0.15}>
                    <p className="numeral mt-5 text-lg">{formatPrice(p.price)}</p>
                    <p className="mt-5 max-w-[44ch] text-[1.05rem] leading-relaxed text-ink-soft">{p.description}</p>
                    <div className="mt-8 flex flex-wrap items-center gap-6">
                      <Link href={`/product/${p.slug}?color=${c.id}`} className="btn">
                        Ver la pieza
                      </Link>
                      <span className="flex gap-2" aria-label={`Disponible en ${p.colors.map((x) => x.name).join(", ")}`}>
                        {p.colors.map((x) => (
                          <span key={x.id} className="h-5 w-5 shadow-[inset_0_0_0_1px_rgb(28_29_33_/_0.2)]" style={{ background: x.hex }} />
                        ))}
                      </span>
                    </div>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="mood-title" className="relative h-[85dvh] min-h-[520px] overflow-hidden bg-navy-deep" data-surface="dark">
        <Parallax distance={60} className="absolute inset-[-10%_0]">
          <div className="relative h-full w-full">
            <Image src={collection.mood.src} alt={collection.mood.alt} fill sizes="100vw" className="object-cover" />
          </div>
        </Parallax>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(17_27_44_/_0.6))]" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1440px] px-5 pb-12 md:px-10 md:pb-16">
          <LineReveal id="mood-title" lang="en" lines={["Classic never", <em key="l">leaves.</em>]} className="display text-[clamp(3rem,8vw,7.4rem)] leading-[0.98] text-paper" />
        </div>
      </section>

      <section aria-labelledby="rest-title" className="mx-auto max-w-[1440px] px-4 py-24 md:px-10 lg:py-32">
        <LineReveal id="rest-title" lines={[<>La colección <em>completa</em></>]} className="display text-[clamp(2.6rem,5vw,4.6rem)]" />
        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10">
          {rest.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={(i % 4) * 0.08} className={i % 2 ? "lg:mt-16" : ""}>
              <ProductCard product={p} sizes="(min-width: 1024px) 22vw, 50vw" />
            </Reveal>
          ))}
        </ul>
        <Link href="/shop" className="btn btn-line mt-20">
          Ver el shop
        </Link>
      </section>
    </>
  );
}
