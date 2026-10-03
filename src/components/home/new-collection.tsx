"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { getProduct, productImage } from "@/content/products";
import { collection } from "@/content/media";
import { formatPrice } from "@/lib/site";
import { FrameReveal, LineReveal, Reveal } from "@/components/ui/motion";

const pieces = [
  { slug: "regatta-linen-shirt", color: "riviera", speed: 70, pos: "lg:left-[2%] lg:top-[50%] lg:w-[19%]" },
  { slug: "hartwell-wool-blazer", color: "navy", speed: 130, pos: "lg:left-[79%] lg:top-[34%] lg:w-[19%]" },
  { slug: "riviera-linen-trouser", color: "sand", speed: 40, pos: "lg:left-[46%] lg:top-[66%] lg:w-[16%]" },
];

function Piece({ i, p }: { i: number; p: MotionValue<number> }) {
  const piece = pieces[i];
  const product = getProduct(piece.slug)!;
  const color = product.colors.find((c) => c.id === piece.color)!;
  const reduce = useReducedMotion();
  const y = useTransform(p, [0, 1], [piece.speed, -piece.speed]);
  return (
    <motion.figure style={reduce ? undefined : { y }} className={`relative z-10 ${i === 1 ? "mt-14 lg:mt-0" : ""} ${i === 2 ? "hidden lg:block" : ""} lg:absolute ${piece.pos}`}>
      <Link href={`/product/${product.slug}?color=${color.id}`} className="group block">
        <div className="frame">
          <FrameReveal className="relative aspect-[4/5] overflow-hidden bg-cream" delay={0.15 + i * 0.15}>
            <Image
              src={productImage(product.slug, color.id, 1)}
              alt={`${product.name} en ${color.name}`}
              fill
              sizes="(min-width: 1024px) 20vw, 45vw"
              className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-quiet)] group-hover:scale-[1.04]"
            />
          </FrameReveal>
        </div>
        <figcaption className="mt-3">
          <span className="smallcaps block text-xs text-ink-soft">Nº {product.ref}</span>
          <span className="flex items-baseline justify-between gap-2">
            <span className="font-serif text-lg leading-tight decoration-1 underline-offset-4 group-hover:underline">{product.name}</span>
            <span className="numeral shrink-0 text-sm">{formatPrice(product.price)}</span>
          </span>
        </figcaption>
      </Link>
    </motion.figure>
  );
}

/** La colección nueva presentada como una doble página: titular, lámina principal y tres piezas a distintas profundidades. */
export function NewCollection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const leadY = useTransform(p, [0, 1], [40, -40]);

  return (
    <section ref={ref} aria-labelledby="collection-title" className="relative overflow-hidden bg-paper px-4 pb-24 pt-24 md:px-10 lg:pb-16 lg:pt-32">
      <div className="relative mx-auto max-w-[1440px] lg:aspect-[1440/1100]">
        <div className="relative z-20 lg:absolute lg:left-0 lg:top-0 lg:w-[42%]">
          <LineReveal
            id="collection-title"
            lang="en"
            lines={["The Estate", <em key="s">Summer</em>]}
            className="display text-[clamp(3.4rem,8.4vw,8.6rem)] leading-[0.96]"
          />
          <Reveal delay={0.3} className="mt-6">
            <span className="tag smallcaps text-sm">{collection.season}</span>
          </Reveal>
        </div>

        <motion.div style={reduce ? undefined : { y: leadY }} className="relative mt-10 lg:absolute lg:left-[43%] lg:top-[3%] lg:mt-0 lg:w-[33%]">
          <div className="frame">
            <FrameReveal className="relative aspect-[4/5] overflow-hidden bg-cream">
              <Image src={collection.lead.src} alt={collection.lead.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </FrameReveal>
          </div>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-x-4 lg:mt-0 lg:block">
          {pieces.map((_, i) => (
            <Piece key={i} i={i} p={p} />
          ))}
        </div>

        <Reveal className="relative z-10 mt-14 max-w-sm lg:absolute lg:bottom-[2%] lg:right-0 lg:mt-0 lg:max-w-[22rem]">
          <p className="text-[1.05rem] leading-relaxed text-ink-soft">
            Lino irlandés, sarga de Biella y algodón lavado al sol. Una temporada entera en la finca, de la alameda al embarcadero.
          </p>
          <Link href="/collection/estate-summer" className="btn mt-7">
            Discover the collection
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
