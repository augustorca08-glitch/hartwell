"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type HTMLMotionProps } from "motion/react";

/** Curvas de la Casa: lenta al salir, nunca rebota. */
export const EASE = [0.22, 0.61, 0.36, 1] as const;
export const EASE_UNVEIL = [0.65, 0, 0.35, 1] as const;

/** Entrada en viewport: aparece en el orden en que se lee, con un desplazamiento corto. */
export function Reveal({
  delay = 0,
  y = 18,
  className,
  children,
  as = "div",
  ...rest
}: { delay?: number; y?: number; as?: "div" | "li" | "p" | "h2" | "span" | "figure" } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * La lámina se descubre como una fotografía que se apoya en su marco:
 * la máscara se abre y la imagen interior se asienta de 1.08 a 1.
 * Se observa el contenedor sin recorte (el clip-path propio confunde a IntersectionObserver).
 */
export function FrameReveal({
  className,
  children,
  delay = 0,
  from = "bottom",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  delay?: number;
  from?: "bottom" | "left" | "right" | "top";
}) {
  const reduce = useReducedMotion();
  const hidden = {
    bottom: "inset(100% 0% 0% 0%)",
    top: "inset(0% 0% 100% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[from];
  return (
    <motion.div className={className} style={style} initial={reduce ? false : "hidden"} whileInView="shown" viewport={{ once: true, amount: 0.12 }}>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        variants={{ hidden: { clipPath: hidden }, shown: { clipPath: "inset(0% 0% 0% 0%)" } }}
        transition={{ duration: 1.5, delay, ease: EASE_UNVEIL }}
      >
        <motion.div
          className="absolute inset-0"
          variants={{ hidden: { scale: 1.08 }, shown: { scale: 1 } }}
          transition={{ duration: 2.2, delay, ease: EASE }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Titular que sube línea por línea desde detrás de un filete invisible.
 * Cada línea reserva espacio para descendentes e itálicas.
 */
export function LineReveal({
  lines,
  className = "",
  as = "h2",
  id,
  delay = 0,
  lang,
}: {
  lines: React.ReactNode[];
  className?: string;
  as?: "h1" | "h2" | "p";
  id?: string;
  delay?: number;
  lang?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.h2;
  return (
    <Tag id={id} lang={lang} className={className} initial={reduce ? false : "hidden"} whileInView="shown" viewport={{ once: true, amount: 0.4 }}>
      {lines.map((line, i) => (
        <span key={i} className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
          <motion.span
            className="block"
            variants={{ hidden: { y: "108%", opacity: 0 }, shown: { y: "0%", opacity: 1 } }}
            transition={{ duration: 1.2, delay: delay + i * 0.12, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Desplazamiento vertical sutil ligado al scroll. Sin efecto con reduced motion. */
export function Parallax({ children, distance = 40, className = "" }: { children: React.ReactNode; distance?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}
