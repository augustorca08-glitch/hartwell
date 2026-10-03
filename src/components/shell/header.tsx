"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { List, MagnifyingGlass, X, ArrowRight } from "@phosphor-icons/react";
import { categories, getProduct, productImage, productsByCategory } from "@/content/products";
import { categoryMedia, collection } from "@/content/media";
import { OVER_MEDIA_ROUTES, formatPrice, nav } from "@/lib/site";
import { countOf, sizeLabel, useCart } from "@/lib/cart";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { Monogram, Wordmark } from "@/components/brand/logo";
import { EASE, EASE_UNVEIL } from "@/components/ui/motion";
import { SearchPanel } from "./search-panel";

function BagButton({ onDark }: { onDark: boolean }) {
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const count = countOf(lines);
  return (
    <button
      type="button"
      id="bag-button"
      data-count={count}
      onClick={() => setOpen(true)}
      className={`flex h-11 items-center gap-2 px-2 transition-colors ${onDark ? "hover:text-cream" : "hover:text-navy"}`}
      aria-label={`Abrir la bolsa, ${count} ${count === 1 ? "pieza" : "piezas"}`}
    >
      <span className="label">Bag</span>
      <span className="relative inline-grid h-5 min-w-5 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            data-testid="bag-count"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="numeral label col-start-1 row-start-1 grid place-items-center tracking-[0.05em]"
          >
            ({count})
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

/** Confirmación discreta al agregar: baja desde el header con la pieza elegida. */
function BagNotice() {
  const lastAdded = useCart((s) => s.lastAdded);
  const pulse = useCart((s) => s.pulse);
  const dismiss = useCart((s) => s.dismissAdded);
  const openBag = useCart((s) => s.setOpen);
  const hover = useRef(false);
  const [slug, colorId, size] = lastAdded?.key.split(":") ?? [];
  const p = slug ? getProduct(slug) : undefined;
  const color = p?.colors.find((c) => c.id === colorId);

  useEffect(() => {
    if (!lastAdded) return;
    const t = window.setInterval(() => {
      if (!hover.current) dismiss();
    }, 4800);
    return () => window.clearInterval(t);
  }, [lastAdded, pulse, dismiss]);

  return (
    <div className="pointer-events-none absolute inset-x-3 top-full z-10 flex justify-end md:inset-x-auto md:right-6 lg:right-10" aria-live="polite">
      <AnimatePresence>
        {p && color && (
          <motion.div
            key={pulse}
            role="status"
            data-testid="bag-notice"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.6, ease: EASE }}
            onPointerEnter={() => (hover.current = true)}
            onPointerLeave={() => (hover.current = false)}
            className="pointer-events-auto mt-2 w-full max-w-[380px] bg-paper p-4 text-ink shadow-[0_24px_60px_-28px_rgb(17_27_44_/_0.55),inset_0_0_0_1px_var(--color-line)]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="smallcaps text-sm text-ink-soft">Añadido a la bolsa</p>
              <button type="button" onClick={dismiss} aria-label="Cerrar aviso" className="-mr-2 -mt-2 grid h-10 w-10 place-items-center hover:text-navy">
                <X size={16} weight="light" aria-hidden />
              </button>
            </div>
            <div className="mt-2 flex gap-4">
              <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-ivory">
                <Image src={productImage(p.slug, color.id, 1)} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-serif text-lg leading-tight">{p.name}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {color.name}, {sizeLabel(size).toLowerCase()}
                  {lastAdded && lastAdded.qty > 1 ? ` · ${lastAdded.qty} u.` : ""}
                </p>
                <p className="numeral mt-1 text-sm">{formatPrice(p.price * (lastAdded?.qty ?? 1))}</p>
              </div>
            </div>
            <button type="button" onClick={() => openBag(true)} className="btn mt-4 w-full">
              Ver la bolsa
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MegaPanel({ open, onClose, id }: { open: boolean; onClose: () => void; id: string }) {
  const [active, setActive] = useState(categories[0].id);
  const media = categoryMedia[active];
  const cat = categories.find((c) => c.id === active)!;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.45, ease: EASE_UNVEIL } }}
          transition={{ duration: 0.7, ease: EASE_UNVEIL }}
          className="absolute inset-x-0 top-full border-t border-line bg-paper text-ink shadow-[0_40px_70px_-40px_rgb(17_27_44_/_0.4)]"
          data-surface="light"
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-[1.25fr_0.8fr_1fr] gap-12 px-10 pb-12 pt-10">
            <div>
              <p className="smallcaps text-sm text-ink-soft">Categorías</p>
              <ul className="mt-4">
                {categories.map((c, i) => (
                  <motion.li key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04, duration: 0.6, ease: EASE }}>
                    <Link
                      href={`/shop/${c.id}`}
                      onClick={onClose}
                      onPointerEnter={() => setActive(c.id)}
                      onFocus={() => setActive(c.id)}
                      className="group flex items-baseline gap-4 py-1 transition-transform duration-500 ease-[var(--ease-quiet)] hover:translate-x-3 focus-visible:translate-x-3"
                    >
                      <span className={`display text-[2.35rem] leading-[1.1] transition-colors duration-500 ${active === c.id ? "text-navy" : ""}`}>
                        {c.label}
                      </span>
                      <span className="numeral text-xs text-ink-soft">{productsByCategory(c.id).length}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="border-l border-line pl-10">
              <p className="smallcaps text-sm text-ink-soft">Selección</p>
              <ul className="mt-5 space-y-3 text-[0.95rem]">
                <li><Link href="/collection/estate-summer" onClick={onClose} className="link-line">{collection.name}</Link></li>
                <li><Link href="/shop?orden=new" onClick={onClose} className="link-line">Novedades</Link></li>
                <li><Link href="/shop" onClick={onClose} className="link-line">The Essentials</Link></li>
                <li><Link href="/lookbook" onClick={onClose} className="link-line">Lookbook</Link></li>
              </ul>
              <Link href="/shop" onClick={onClose} className="label mt-10 inline-flex items-center gap-2 hover:text-navy">
                Ver todo el shop <ArrowRight size={14} weight="light" aria-hidden />
              </Link>
            </div>
            <figure>
              <div className="frame">
                <div className="relative aspect-[4/5] max-h-[360px] w-full overflow-hidden bg-cream">
                  <AnimatePresence initial={false}>
                    <motion.div key={active} className="absolute inset-0" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE }}>
                      <Image src={media.src} alt="" fill sizes="30vw" className="object-cover" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <figcaption className="mt-3 font-serif text-lg italic text-ink-soft" lang="en">
                {cat.tagline}
              </figcaption>
            </figure>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  useScrollLock(open);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.8, ease: EASE_UNVEIL }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-paper text-ink lg:hidden"
          data-lenis-prevent
        >
          <div className="grid h-[var(--header-h)] shrink-0 grid-cols-[1fr_auto_1fr] items-center px-4">
            <button type="button" onClick={onClose} data-autofocus className="-ml-2 flex h-11 items-center gap-2 justify-self-start px-2">
              <X size={20} weight="light" aria-hidden /> <span className="label">Cerrar</span>
            </button>
            <Link href="/" onClick={onClose} aria-label="HARTWELL, inicio">
              <Wordmark className="text-[1.05rem]" />
            </Link>
          </div>
          <nav aria-label="Categorías" className="px-4 pt-4">
            <ul className="border-t border-line">
              {categories.map((c, i) => (
                <motion.li
                  key={c.id}
                  className="border-b border-line"
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.8, ease: EASE }}
                >
                  <Link href={`/shop/${c.id}`} onClick={onClose} className="flex items-baseline justify-between gap-4 py-3">
                    <span className="display text-[2.4rem] leading-[1.1]">{c.label}</span>
                    <span className="numeral text-xs text-ink-soft">{productsByCategory(c.id).length}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
          <motion.nav
            aria-label="Principal"
            className="grid grid-cols-2 gap-x-4 px-4 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={onClose} className="flex min-h-12 items-center text-[0.95rem]">
                {n.label}
              </Link>
            ))}
          </motion.nav>
          <Link href="/collection/estate-summer" onClick={onClose} className="mx-4 mb-8 mt-8 flex items-center gap-4 bg-ivory p-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <span className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-cream">
              <Image src={collection.lead.src} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <span>
              <span className="smallcaps block text-sm text-ink-soft">{collection.season}</span>
              <span className="display block text-2xl">{collection.name}</span>
            </span>
          </Link>
          <div className="mt-auto flex items-center justify-center gap-3 pb-8 text-navy">
            <Monogram className="h-9 w-9" />
            <span className="smallcaps text-sm">Est. 1931</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const pathname = usePathname();
  const overMediaRoute = OVER_MEDIA_ROUTES.includes(pathname);
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const megaTimer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  const { scrollY } = useScroll();
  // Mientras la confirmación de la bolsa está visible, el header no se oculta
  const noticeOpen = useCart((st) => !!st.lastAdded);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const top = y < (overMediaRoute ? 80 : 24);
    if (top !== atTop) setAtTop(top);
    const shouldHide = y > 280 && y > prev + 2 && !mega && !noticeOpen;
    const shouldShow = y < prev - 2 || y < 280;
    if (shouldHide && !hidden) setHidden(true);
    else if (shouldShow && hidden) setHidden(false);
  });

  // Al agregar a la bolsa, el header vuelve para mostrar la confirmación
  const pulse = useCart((st) => st.pulse);
  const [lastPulse, setLastPulse] = useState(pulse);
  if (lastPulse !== pulse) {
    setLastPulse(pulse);
    setHidden(false);
  }

  // Cerrar paneles al cambiar de ruta (ajuste durante el render, sin efecto)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMega(false);
    setMenu(false);
    setSearch(false);
  }

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mega]);

  const onDark = overMediaRoute && atTop && !mega;
  const openMega = () => {
    window.clearTimeout(megaTimer.current);
    if (!mega) hoverOpenedAt.current = Date.now();
    setMega(true);
  };
  const toggleMega = () => setMega((m) => (m && Date.now() - hoverOpenedAt.current > 600 ? false : true));
  const closeMega = () => {
    megaTimer.current = window.setTimeout(() => setMega(false), 160);
  };

  const navLink = (href: string, label: string) => (
    <Link href={href} aria-current={pathname === href ? "page" : undefined} className="label link-line mx-3 py-2">
      {label}
    </Link>
  );

  return (
    <>
      <a href="#main" className="label fixed left-4 top-3 z-[95] -translate-y-24 bg-navy px-5 py-3 text-paper focus:translate-y-0">
        Saltar al contenido
      </a>
      <motion.header
        data-surface={onDark ? "dark" : undefined}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.7, ease: EASE }}
        onPointerLeave={closeMega}
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,color,box-shadow] duration-700 ${
          onDark ? "bg-transparent text-paper" : "bg-paper/95 text-ink backdrop-blur-md"
        } ${!onDark && !atTop ? "shadow-[0_1px_0_var(--color-line)]" : ""}`}
      >
        <div className="mx-auto grid h-[var(--header-h)] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-6 lg:px-10">
          {/* Izquierda */}
          <div className="flex items-center justify-self-start">
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label="Abrir el menú"
              className="-ml-2 flex h-11 items-center gap-2 px-2 lg:hidden"
            >
              <List size={20} weight="light" aria-hidden /> <span className="label hidden xs:inline">Menu</span>
            </button>
            <nav aria-label="Principal" className="hidden lg:block">
              <ul className="-ml-3 flex items-center">
                <li onPointerEnter={openMega}>
                  <button type="button" aria-expanded={mega} aria-controls="mega-panel" onClick={toggleMega} className="label mx-3 py-2">
                    <span className={`link-line ${pathname.startsWith("/shop") ? "[background-size:100%_1px]" : ""}`}>Shop</span>
                  </button>
                </li>
                <li onPointerEnter={closeMega}>{navLink(nav[1].href, nav[1].label)}</li>
                <li onPointerEnter={closeMega}>{navLink(nav[2].href, nav[2].label)}</li>
              </ul>
            </nav>
          </div>

          <Link href="/" aria-label="HARTWELL, inicio" className="justify-self-center" onPointerEnter={closeMega}>
            <Wordmark className="text-[1.05rem] xs:text-[1.2rem] lg:text-[1.45rem]" />
          </Link>

          {/* Derecha */}
          <div className="flex items-center justify-self-end" onPointerEnter={closeMega}>
            <span className="hidden lg:block">{navLink(nav[3].href, nav[3].label)}</span>
            <button
              type="button"
              onClick={() => setSearch(true)}
              aria-expanded={search}
              aria-controls="search-panel"
              aria-label="Buscar"
              className="flex h-11 items-center gap-2 px-2 lg:mx-1"
            >
              <MagnifyingGlass size={19} weight="light" aria-hidden />
              <span className="label hidden lg:inline">Search</span>
            </button>
            <BagButton onDark={onDark} />
          </div>
        </div>
        <div className="hidden lg:block" onPointerEnter={() => mega && openMega()}>
          <MegaPanel id="mega-panel" open={mega} onClose={() => setMega(false)} />
        </div>
        <BagNotice />
      </motion.header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
      <SearchPanel open={search} onClose={() => setSearch(false)} />
    </>
  );
}
