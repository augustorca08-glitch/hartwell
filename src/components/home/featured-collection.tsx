import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/content/products";
import { clubhouse } from "@/content/media";
import { ProductCard } from "@/components/product/product-card";
import { FrameReveal, LineReveal, Parallax, Reveal } from "@/components/ui/motion";

const SLUGS = ["hartwell-classic-polo", "cricket-cable-vest", "clubhouse-knitted-polo"];

/** Capítulo verde: la cápsula de club (tenis, cricket, terraza). La única superficie forest del home. */
export function FeaturedCollection() {
  const items = SLUGS.map((s) => getProduct(s)!);
  return (
    <section aria-labelledby="clubhouse-title" data-surface="dark" className="bg-forest px-4 py-24 text-paper md:px-10 lg:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Parallax distance={30}>
            <div className="frame frame-dark">
              <FrameReveal className="relative aspect-[4/5] overflow-hidden bg-forest-deep">
                <Image src={clubhouse.lead.src} alt={clubhouse.lead.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </FrameReveal>
            </div>
          </Parallax>
        </div>
        <div className="flex flex-col lg:col-span-7 lg:pl-8">
          <LineReveal id="clubhouse-title" lang="en" lines={[<>The <em>Clubhouse</em></>]} className="display text-[clamp(3rem,6.6vw,6.4rem)]" />
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-[44ch] text-[1.05rem] leading-relaxed text-paper/80">
              Piqué blanco, chalecos de cricket y gorras con el monograma. Lo que se usa entre un set y otro, y en la terraza cuando cae la tarde.
            </p>
          </Reveal>
          <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-6">
            {items.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 0.1} className={`${i === 1 ? "sm:mt-16" : ""} ${i === 2 ? "col-span-2 w-1/2 sm:col-span-1 sm:w-auto sm:mt-6" : ""}`}>
                <ProductCard product={p} tone="dark" sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 50vw" />
              </Reveal>
            ))}
          </ul>
          <Link href="/shop/polo" className="label link-rule mt-14 self-start text-paper">
            Shop Polo
          </Link>
        </div>
      </div>
    </section>
  );
}
