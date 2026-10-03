"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { heritage } from "@/content/media";
import { Seal } from "@/components/brand/logo";

const LETTER =
  "En 1931, Edmund Hartwell abrió una pequeña sastrería frente a un campo de polo. Cortaba pocas prendas y las cortaba bien. Casi un siglo después seguimos con la misma idea: telas nobles, talleres que conocemos por su nombre y un corte que no persigue modas.";

function Word({ word, i, total, p }: { word: string; i: number; total: number; p: MotionValue<number> }) {
  const a = (i / total) * 0.82;
  const opacity = useTransform(p, (v) => 0.22 + 0.78 * Math.min(1, Math.max(0, (v - a) / 0.14)));
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  );
}

/** Capítulo navy: la carta de la Casa se lee al ritmo del scroll, junto a una lámina de archivo. */
export function HeritageLetter() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 75%", "end 70%"] });
  const imgY = useTransform(p, [0, 1], [60, -40]);
  const words = LETTER.split(" ");

  return (
    <section ref={ref} aria-labelledby="heritage-title" data-surface="dark" className="relative overflow-hidden bg-navy px-4 py-24 text-paper md:px-10 lg:py-40">
      <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-5">
            <Seal className="h-20 w-20 text-gold-soft md:h-24 md:w-24" />
            <h2 id="heritage-title" className="display text-[clamp(2rem,3.4vw,3rem)]" lang="en">
              Heritage, <em>refined.</em>
            </h2>
          </div>
          <p className="mt-12 font-serif text-[clamp(1.75rem,3.1vw,3rem)] font-normal leading-[1.22] tracking-[-0.005em]">
            {reduce ? LETTER : words.map((w, i) => <Word key={i} word={w} i={i} total={words.length} p={p} />)}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
            <p className="font-serif text-xl italic text-gold-soft">Edmund Hartwell, fundador</p>
            <Link href="/about" className="label link-rule text-paper">
              Nuestra historia
            </Link>
          </div>
        </div>
        <motion.div style={reduce ? undefined : { y: imgY }} className="mx-auto w-[80%] max-w-[420px] lg:col-span-4 lg:col-start-9 lg:w-full">
          <div className="bg-paper p-3 pb-12 shadow-[0_40px_70px_-35px_rgb(0_0_0_/_0.6)] md:p-4 md:pb-14">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream">
              <Image src={heritage.archive.src} alt={heritage.archive.alt} fill sizes="(min-width: 1024px) 30vw, 80vw" className="object-cover sepia-[0.25]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
