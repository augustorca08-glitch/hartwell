import Image from "next/image";
import { editorial } from "@/content/media";
import { FrameReveal, LineReveal, Parallax, Reveal } from "@/components/ui/motion";

/** Doble página de revista sobre lino: retrato, cita grande, texto a dos columnas y una apaisada que se cruza. */
export function EditorialSpread() {
  return (
    <section aria-labelledby="editorial-title" className="surface-linen overflow-hidden px-4 py-24 md:px-10 lg:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0">
        <div className="lg:col-span-5 lg:row-span-2">
          <Parallax distance={50}>
            <div className="frame">
              <FrameReveal className="relative aspect-[4/5] overflow-hidden bg-cream" from="top">
                <Image src={editorial.portrait.src} alt={editorial.portrait.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </FrameReveal>
            </div>
          </Parallax>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
          <LineReveal id="editorial-title" lang="en" lines={["An elegance", <>that <em>endures.</em></>]} className="display text-[clamp(2.8rem,6vw,6rem)] leading-[1]" />
          <Reveal delay={0.15} className="mt-10 gap-8 text-[1.02rem] leading-[1.75] text-ink-soft md:columns-2">
            <p className="first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-serif first-letter:text-[3.6rem] first-letter:leading-[0.8] first-letter:text-oxblood">
              Vestirse bien no tiene que ver con la ocasión, sino con la costumbre. Una camisa que se plancha la noche anterior, un sweater que se dobla en lugar de colgarse, un blazer que se lleva al sastre en vez de reemplazarse.
            </p>
            <p className="mt-4">
              Las prendas de la Casa se piensan para ese uso lento. Se ajustan, se remiendan y pasan de una mano a otra. Por eso elegimos telas que mejoran con los años y cortes que no dependen de la temporada.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:col-start-6 lg:mt-20">
          <Parallax distance={30}>
            <div className="frame">
              <FrameReveal className="relative aspect-[3/2] overflow-hidden bg-cream" from="right">
                <Image src={editorial.landscape.src} alt={editorial.landscape.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              </FrameReveal>
            </div>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
