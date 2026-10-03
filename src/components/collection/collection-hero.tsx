"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { collection } from "@/content/media";
import { EASE } from "@/components/ui/motion";

export function CollectionHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(p, [0, 1], ["0%", "16%"]);
  const copyOpacity = useTransform(p, [0, 0.6], [1, 0]);
  return (
    <section ref={ref} className="relative h-[100dvh] min-h-[600px] overflow-hidden bg-navy-deep text-paper" data-surface="dark">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y }} initial={reduce ? false : { scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.6, ease: EASE }}>
        <Image src={collection.hero.src} alt={collection.hero.alt} fill preload fetchPriority="high" sizes="100vw" className="object-cover" style={{ objectPosition: collection.hero.focus }} />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(17_27_44_/_0.62),rgb(17_27_44_/_0.18)_26%,transparent_40%,rgb(17_27_44_/_0.62))]" />
      <motion.div style={reduce ? undefined : { opacity: copyOpacity }} className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-14 md:px-10 md:pb-20">
        <motion.span initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1.2 }} className="tag smallcaps self-start text-sm">
          {collection.season}
        </motion.span>
        <h1 className="display mt-6 pb-2 text-[clamp(3.6rem,11vw,11rem)] leading-[0.92]" lang="en">
          <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
            <motion.span className="block" initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ delay: 0.15, duration: 1.5, ease: EASE }}>
              The Estate
            </motion.span>
          </span>
          <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
            <motion.span className="block" initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ delay: 0.3, duration: 1.5, ease: EASE }}>
              <em>Summer</em>
            </motion.span>
          </span>
        </h1>
        <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 1.2, ease: EASE }} className="mt-6 max-w-[42ch] text-[1.05rem] leading-relaxed text-paper/90 md:text-lg">
          Una temporada en la finca: lino para el embarcadero, sarga para el almuerzo en el club y punto para cuando baja el sol.
        </motion.p>
      </motion.div>
    </section>
  );
}
