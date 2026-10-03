"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { finalCta } from "@/content/media";
import { FREE_SHIPPING_FROM, formatPrice } from "@/lib/site";
import { Seal } from "@/components/brand/logo";
import { ArtImage } from "@/components/ui/art-image";
import { LineReveal, Reveal } from "@/components/ui/motion";

/** Cierre en oxblood: la casa al final de la alameda, enmarcada, y el sello de la Casa. */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(p, [0, 1], ["-7%", "7%"]);
  const frameScale = useTransform(p, [0, 0.45], [0.94, 1]);

  return (
    <section ref={ref} aria-labelledby="final-title" data-surface="dark" className="bg-oxblood px-4 py-20 text-paper md:px-10 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <motion.div style={reduce ? undefined : { scale: frameScale }} className="frame frame-dark">
          <div className="relative aspect-[4/5] overflow-hidden bg-navy-deep md:aspect-[21/9]">
            <motion.div className="absolute inset-[-8%_0]" style={reduce ? undefined : { y: imgY }}>
              <ArtImage desktop={finalCta.desktop} mobile={finalCta.mobile} alt={finalCta.desktop.alt} className="absolute inset-0 h-full w-full" />
            </motion.div>
          </div>
        </motion.div>
        <div className="mx-auto mt-16 flex max-w-3xl flex-col items-center text-center lg:mt-20">
          <Reveal>
            <Seal className="h-24 w-24 text-gold-soft" />
          </Reveal>
          <LineReveal id="final-title" lang="en" lines={["Made for", <em key="g">generations.</em>]} className="display mt-8 text-[clamp(3rem,7vw,6.6rem)] leading-[1]" />
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-[42ch] text-[1.05rem] leading-relaxed text-paper/80">
              Envío sin cargo desde {formatPrice(FREE_SHIPPING_FROM)}, cambios durante 30 días y cada pieza en su caja de la Casa.
            </p>
            <Link href="/shop" className="btn btn-paper mt-9">
              Ver el shop
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
