"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Monogram } from "@/components/brand/logo";

// Solo en navegaciones del cliente: la primera carga no espera a ninguna animación.
// En el servidor nunca se renderiza (la variable de módulo persistiría entre requests).
let hydrated = false;

/** Velo de papel con el monograma: la página siguiente aparece como una lámina nueva. */
export function PageVeil({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [animate] = useState(() => typeof window !== "undefined" && hydrated);
  useEffect(() => {
    hydrated = true;
  }, []);
  return (
    <>
      {animate && !reduce && (
        <motion.div
          aria-hidden
          data-veil
          className="pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-paper text-navy"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <motion.span initial={{ opacity: 0.9, scale: 1 }} animate={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}>
            <Monogram className="h-14 w-14" />
          </motion.span>
        </motion.div>
      )}
      {children}
    </>
  );
}
