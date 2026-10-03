"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { useCart } from "@/lib/cart";
import { setLenis, useFinePointer, useMediaQuery } from "@/lib/dom";

/** Smooth scroll solo con puntero fino y sin reduced motion. Un poco más pesado que lo habitual. */
function SmoothScroll() {
  const fine = useFinePointer();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    if (!fine || reduce) return;
    const l = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, autoRaf: true, anchors: true });
    setLenis(l);
    return () => {
      l.destroy();
      setLenis(null);
    };
  }, [fine, reduce]);
  return null;
}

/** Al navegar, vuelve arriba de forma inmediata (Lenis incluido). */
function RouteScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function CartHydration() {
  useEffect(() => {
    useCart.persist.rehydrate();
    // Señal para tests end-to-end: la app ya es interactiva
    document.documentElement.dataset.hydrated = "1";
  }, []);
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartHydration />
      <SmoothScroll />
      <RouteScrollReset />
      {children}
    </MotionConfig>
  );
}
