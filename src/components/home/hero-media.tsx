"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion, motion } from "motion/react";
import { Pause, Play } from "@phosphor-icons/react";
import { hero } from "@/content/media";
import { ArtImage } from "@/components/ui/art-image";

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

const noopSubscribe = () => () => {};
/** Save-Data o 2G: no se reproduce automáticamente. */
function readConstrained() {
  const net = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  return !!net?.saveData || /(^|-)2g$/.test(net?.effectiveType ?? "");
}

/**
 * Media del hero.
 * - El poster es una imagen real (candidato LCP), con recorte propio para mobile.
 * - El video aparece con fundido recién cuando empieza a reproducirse.
 * - preload="none" y src asignado en idle: no compite con la carga inicial.
 * - Sin autoplay con reduced motion, Save-Data o 2G. Si play() falla o el archivo falta, queda el poster.
 * - Se pausa fuera de viewport o con la pestaña oculta. Botón pausa/reproducción siempre accesible (WCAG 2.2.2).
 *
 * Para usar el video: colocar /public/videos/hero.mp4 (y opcionalmente hero-mobile.mp4).
 */
export function HeroMedia({ hasVideo, hasMobileVideo }: { hasVideo: boolean; hasMobileVideo: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  // null: sin elección del usuario; el autoplay decide según preferencias y red
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const constrained = useSyncExternalStore(noopSubscribe, readConstrained, () => false);
  const blocked = !!reduce || constrained;
  const userPaused = userChoice ?? blocked;
  const [loaded, setLoaded] = useState(false);
  const inView = useRef(true);

  const pickSrc = () => (window.matchMedia("(max-width: 767px)").matches && hasMobileVideo ? hero.videoMobile : hero.video);

  useEffect(() => {
    const v = ref.current;
    if (!hasVideo || !v) return;
    if (blocked) return;
    const load = () => {
      v.src = pickSrc();
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      setLoaded(true);
      v.play().catch(() => setFailed(true));
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const id = w.requestIdleCallback ? w.requestIdleCallback(load, { timeout: 1500 }) : window.setTimeout(load, 900);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideo, hasMobileVideo, blocked]);

  useEffect(() => {
    const v = ref.current;
    if (!hasVideo || !v) return;
    const sync = () => {
      if (!v.src) return;
      const shouldPlay = inView.current && !document.hidden && !userPaused;
      if (shouldPlay && v.paused) v.play().catch(() => setFailed(true));
      else if (!shouldPlay && !v.paused) v.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.isIntersecting;
      sync();
    });
    io.observe(v);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [hasVideo, userPaused]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (userPaused) {
      if (!v.src) {
        v.src = pickSrc();
        v.muted = true;
        setLoaded(true);
      }
      setUserChoice(false);
      setFailed(false);
      v.play().catch(() => setFailed(true));
    } else {
      setUserChoice(true);
      v.pause();
    }
  };

  const showDevLabel = process.env.NODE_ENV !== "production" && (!hasVideo || failed);

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-deep">
      <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2.8, ease: [0.22, 0.61, 0.36, 1] }}>
        <ArtImage desktop={hero.poster} mobile={hero.posterMobile} alt="" priority className="absolute inset-0 h-full w-full" />
      </motion.div>
      {hasVideo && (
        <video
          ref={ref}
          aria-hidden
          muted
          loop
          playsInline
          preload="none"
          poster={hero.poster.src}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => loaded && setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1.4s] ${playing && !failed ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition: hero.poster.focus }}
        />
      )}
      {/* Velo para la legibilidad del texto sobre cualquier toma */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(17_27_44_/_0.55)_0%,rgb(17_27_44_/_0.25)_38%,rgb(17_27_44_/_0)_62%)] max-md:bg-[linear-gradient(0deg,rgb(17_27_44_/_0.6)_0%,rgb(17_27_44_/_0.2)_55%,rgb(17_27_44_/_0)_75%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(17_27_44_/_0.4)_0%,rgb(17_27_44_/_0)_26%,rgb(17_27_44_/_0.05)_52%,rgb(17_27_44_/_0.62)_100%)]" />

      {hasVideo && (
        <button
          type="button"
          onClick={toggle}
          className="label absolute bottom-6 right-4 z-20 flex h-11 items-center gap-2 bg-navy-deep/45 px-4 text-paper backdrop-blur-md transition-colors duration-500 hover:bg-navy-deep md:right-10"
          data-surface="dark"
        >
          {userPaused || (!playing && !failed && reduce) ? (
            <>
              <Play size={13} weight="fill" aria-hidden /> Reproducir video
            </>
          ) : (
            <>
              <Pause size={13} weight="fill" aria-hidden /> Pausar video
            </>
          )}
        </button>
      )}

      {showDevLabel && (
        <p className="label absolute left-1/2 top-24 z-20 -translate-x-1/2 whitespace-nowrap bg-paper/90 px-4 py-2 text-ink">Video placeholder · /public/videos/hero.mp4</p>
      )}
    </div>
  );
}
