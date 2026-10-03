"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatPrice } from "@/lib/site";
import { Seal } from "@/components/brand/logo";
import { EASE } from "@/components/ui/motion";

type Order = { order: string; email: string; total: number; name: string };

const noop = () => () => {};
function readLastOrder() {
  try {
    return sessionStorage.getItem("hartwell-last-order");
  } catch {
    return null;
  }
}

export function OrderSuccess({ order }: { order?: string }) {
  const reduce = useReducedMotion();
  const raw = useSyncExternalStore(noop, readLastOrder, () => null);
  let data: Order | null = null;
  try {
    data = raw ? (JSON.parse(raw) as Order) : null;
  } catch {}
  const id = data?.order ?? order;
  return (
    <section className="mx-auto grid min-h-[80dvh] max-w-[1440px] items-center gap-14 px-4 pb-28 pt-[calc(var(--header-h)+4rem)] md:px-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <motion.h1 initial={reduce ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.2, ease: EASE }} className="display max-w-[14ch] pb-2 text-[clamp(3.2rem,9vw,8rem)] leading-[0.98]">
          {data?.name ? (
            <>
              Gracias, <em>{data.name}.</em>
            </>
          ) : (
            <>
              Pedido <em>confirmado.</em>
            </>
          )}
        </motion.h1>
        <div className="mt-10 max-w-[48ch] text-lg leading-relaxed" role="status">
          {id ? (
            <p>
              El número de pedido es <strong className="numeral font-medium">{id}</strong>.
              {data && (
                <>
                  {" "}
                  Total: <span className="numeral">{formatPrice(data.total)}</span>. El detalle llega a <span className="break-all">{data.email}</span>.
                </>
              )}
            </p>
          ) : (
            <p>El pedido fue recibido.</p>
          )}
          <p className="mt-3 text-base text-ink-soft">Compra de demostración: no se realizó ningún cobro.</p>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/shop" className="btn">
            Seguir comprando
          </Link>
          <Link href="/lookbook" className="btn btn-line">
            Lookbook
          </Link>
        </div>
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.4, ease: EASE }}
        className="flex justify-center lg:col-span-4"
        aria-hidden
      >
        <Seal className="h-48 w-48 text-oxblood md:h-64 md:w-64" />
      </motion.div>
    </section>
  );
}
