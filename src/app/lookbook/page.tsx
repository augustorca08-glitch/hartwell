import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/content/products";
import { collection, lookbook, type LookbookChapter } from "@/content/media";
import { roman } from "@/lib/site";
import { FrameReveal, LineReveal, Parallax, Reveal } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "The Estate Summer: siete escenas de un verano en la finca.",
};

type Frame = LookbookChapter["frames"][number];

/** Ubicación de cada lámina según cuántas tiene el capítulo, su orientación y el lado del capítulo. */
function placeFor(frames: Frame[], i: number, flip: boolean) {
  const f = frames[i];
  const landscape = f.w > f.h;
  if (frames.length === 1) return landscape ? "lg:col-span-10 lg:col-start-2" : flip ? "lg:col-span-5 lg:col-start-7" : "lg:col-span-5 lg:col-start-3";
  if (i === 0) return landscape ? (flip ? "lg:col-span-7 lg:col-start-6" : "lg:col-span-7") : flip ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-5";
  return landscape ? (flip ? "lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:mt-48" : "lg:col-span-7 lg:col-start-6 lg:mt-40") : flip ? "lg:col-span-4 lg:col-start-2 lg:row-start-1 lg:mt-56" : "lg:col-span-4 lg:col-start-8 lg:mt-56";
}

function Caption({ frame }: { frame: Frame }) {
  const items = frame.products.map((s) => getProduct(s)).filter((p) => !!p);
  return (
    <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
      <span className="text-ink-soft">{frame.caption}</span>
      <span className="flex gap-4">
        {items.map((p) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="link-rule">
            {p.name.replace("Hartwell ", "")}
          </Link>
        ))}
      </span>
    </figcaption>
  );
}

export default function LookbookPage() {
  return (
    <div className="pb-28 pt-[calc(var(--header-h)+3rem)] lg:pt-[calc(var(--header-h)+4.5rem)]">
      <header className="mx-auto grid max-w-[1440px] gap-8 px-4 md:px-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Reveal>
            <p className="smallcaps text-sm text-ink-soft">
              {collection.name} · {collection.season}
            </p>
          </Reveal>
          <LineReveal as="h1" lines={[<>Look<em>book</em></>]} className="display mt-3 text-[clamp(4rem,13vw,12rem)] leading-[0.9]" />
        </div>
        <Reveal delay={0.2} className="lg:col-span-4 lg:pb-6">
          <p className="max-w-[36ch] font-serif text-xl italic leading-snug text-ink-soft">
            Siete escenas de un verano en la finca. Sin estudio: la luz que había, la ropa que se usa.
          </p>
        </Reveal>
      </header>

      <nav aria-label="Capítulos" className="scrollbar-none mx-auto mt-14 max-w-[1440px] overflow-x-auto px-4 md:px-10">
        <ul className="flex w-max gap-6 border-y border-line py-4">
          {lookbook.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="group inline-flex min-h-11 items-baseline gap-2">
                <span className="smallcaps text-sm text-gold">{roman(i + 1)}</span>
                <span className="font-serif text-lg italic link-line" lang="en">
                  {c.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto mt-20 flex max-w-[1440px] flex-col gap-32 px-4 md:px-10 lg:mt-28 lg:gap-48">
        {lookbook.map((chapter, ci) => {
          const flip = ci % 2 === 1;
          return (
            <section key={chapter.id} id={chapter.id} aria-labelledby={`${chapter.id}-title`} className="scroll-mt-28">
              <div className={`grid gap-4 lg:grid-cols-12 ${flip ? "lg:text-right" : ""}`}>
                <div className={flip ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-6"}>
                  <p className="smallcaps text-sm text-gold">Capítulo {roman(ci + 1)}</p>
                  <LineReveal id={`${chapter.id}-title`} lang="en" lines={[<em key="t">{chapter.title}</em>]} className="display mt-1 text-[clamp(2.8rem,6vw,5.6rem)] leading-[1]" />
                  <Reveal delay={0.1}>
                    <p className={`mt-4 max-w-[40ch] text-[1.05rem] leading-relaxed text-ink-soft ${flip ? "lg:ml-auto" : ""}`}>{chapter.intro}</p>
                  </Reveal>
                </div>
              </div>
              <ul className="mt-12 flex flex-col gap-14 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0">
                {chapter.frames.map((f, i) => (
                  <li key={f.src} className={`${placeFor(chapter.frames, i, flip)} ${i === 1 ? "w-[86%] self-end lg:w-auto" : ""}`}>
                    <Parallax distance={i === 0 ? 20 : 50}>
                      <figure>
                        <div className="frame">
                          <FrameReveal className="relative overflow-hidden bg-cream" style={{ aspectRatio: `${f.w} / ${f.h}` }} from={i % 2 ? "right" : "bottom"}>
                            <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-cover" />
                          </FrameReveal>
                        </div>
                        <Caption frame={f} />
                      </figure>
                    </Parallax>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mx-auto mt-36 max-w-[1440px] px-4 md:px-10">
        <div className="ornament" aria-hidden>
          <i />
        </div>
        <div className="mt-16 flex flex-col items-center text-center">
          <LineReveal lang="en" lines={["The art of", <em key="d">dressing well.</em>]} className="display text-[clamp(2.8rem,6vw,5.4rem)] leading-[1]" />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/collection/estate-summer" className="btn">
              Discover the collection
            </Link>
            <Link href="/shop" className="btn btn-line">
              Ver el shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
