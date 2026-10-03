"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { lookbook } from "@/content/media";
import { useMediaQuery } from "@/lib/dom";
import { roman } from "@/lib/site";

const INTRO = "Siete escenas de un verano en la finca: caballerizas, cancha, regata, Riviera, colegio y camino.";

/** Alturas alternadas con calma: ritmo de revista, no de rollo fotográfico. */
const heights = ["h-[64vh]", "h-[50vh] self-end", "h-[58vh] self-center"];

function Frames({ pan }: { pan: boolean }) {
  let n = 0;
  return (
    <>
      {lookbook.map((chapter, ci) => (
        <Fragment key={chapter.id}>
          <div className={`flex shrink-0 flex-col justify-end ${pan ? "w-[15vw] self-stretch pb-[10vh]" : "w-[52vw] snap-start self-end pb-8 sm:w-[30vw]"}`}>
            <p className="smallcaps text-sm text-gold">{roman(ci + 1)}</p>
            <p className="display mt-1 text-[clamp(1.9rem,2.6vw,2.6rem)] leading-[1.05]" lang="en">
              <em>{chapter.title}</em>
            </p>
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-ink-soft">{chapter.intro}</p>
          </div>
          {chapter.frames.map((m) => {
            const h = heights[n++ % heights.length];
            return (
              <figure key={m.src} className={`shrink-0 ${pan ? h : "h-[52vh] max-h-[500px] snap-start"}`}>
                <div className="frame" style={{ height: "calc(100% - 3.25rem)", aspectRatio: `${m.w} / ${m.h}` }}>
                  <div className="relative h-full overflow-hidden bg-cream">
                    <Image src={m.src} alt={m.alt} fill sizes={pan ? "45vw" : "80vw"} className="object-cover" />
                  </div>
                </div>
                <figcaption className="mt-3 max-w-[40ch] text-sm text-ink-soft">{m.caption}</figcaption>
              </figure>
            );
          })}
        </Fragment>
      ))}
    </>
  );
}

/** Desktop: la sección se fija y el scroll vertical se traduce en un recorrido horizontal. */
function PinnedPan() {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={wrap} aria-labelledby="lookbook-title" className="relative bg-paper" style={{ height: `calc(100dvh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100dvh] flex-col overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex min-h-0 flex-1 items-start gap-[4vw] pl-10 pr-[8vw] pt-[calc(var(--header-h)+4vh)] pb-[6vh]">
          <div className="flex h-full w-[30vw] shrink-0 flex-col justify-between pb-[4vh]">
            <h2 id="lookbook-title" className="display text-[clamp(3.6rem,7.4vw,8rem)] leading-[0.95]">
              Look<em>book</em>
            </h2>
            <div>
              <p className="max-w-[32ch] text-[1.05rem] leading-relaxed text-ink-soft">{INTRO}</p>
              <Link href="/lookbook" className="label link-rule mt-7 inline-block">
                Ver el lookbook completo
              </Link>
            </div>
          </div>
          <Frames pan />
        </motion.div>
        <div className="mx-10 mb-6 h-px bg-line" aria-hidden>
          <motion.div className="h-px origin-left bg-ink" style={{ scaleX: progress }} />
        </div>
      </div>
    </section>
  );
}

/** Mobile / reduced motion: scroll-snap horizontal nativo, sin secuestrar el scroll. */
function NativeRail() {
  return (
    <section aria-labelledby="lookbook-title" className="bg-paper py-24">
      <div className="px-4 md:px-10">
        <h2 id="lookbook-title" className="display text-[clamp(3.2rem,14vw,6rem)] leading-[0.95]">
          Look<em>book</em>
        </h2>
        <p className="mt-5 max-w-[34ch] text-[1.05rem] leading-relaxed text-ink-soft">{INTRO}</p>
      </div>
      <div
        className="scrollbar-none mt-12 flex snap-x snap-mandatory items-end gap-5 overflow-x-auto scroll-px-4 px-4 pb-2 md:scroll-px-10 md:px-10"
        tabIndex={0}
        role="region"
        aria-label="Fotos del lookbook, desplazar horizontalmente"
        data-lenis-prevent-wheel
      >
        <Frames pan={false} />
      </div>
      <div className="px-4 md:px-10">
        <Link href="/lookbook" className="label link-rule mt-10 inline-block">
          Ver el lookbook completo
        </Link>
      </div>
    </section>
  );
}

export function LookbookRail() {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  return desktop && !reduce ? <PinnedPan /> : <NativeRail />;
}
