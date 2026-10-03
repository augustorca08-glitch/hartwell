"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Check, Truck, ArrowsClockwise, Package } from "@phosphor-icons/react";
import { type Product, ONE_SIZE, getCategory, isOneSize, productImages, stockOf } from "@/content/products";
import { details } from "@/content/media";
import { useCart } from "@/lib/cart";
import { FREE_SHIPPING_FROM, formatPrice, roman } from "@/lib/site";
import { EASE } from "@/components/ui/motion";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { Gallery } from "./gallery";
import { SizeChips, Swatches } from "./variant-pickers";
import { SizeGuide } from "./size-guide";

const VIEWS = ["frente", "espalda", "detalle de la tela"];

/** Nombre con la última palabra en itálica: la firma tipográfica de la Casa. */
function ItalicLast({ text }: { text: string }) {
  const words = text.split(" ");
  const last = words.pop();
  return (
    <>
      {words.join(" ")} <em>{last}</em>
    </>
  );
}

/** Una nota sobre la pieza: la lámina crece con el scroll y el texto la acompaña. */
function Note({ n, title, body, img }: { n: number; title: string; body: string; img: { src: string; alt: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(p, [0, 1], [0.86, 1]);
  const imgScale = useTransform(p, [0, 1], [1.12, 1]);
  return (
    <div ref={ref} className="grid gap-6 sm:grid-cols-[1fr_1fr] sm:items-end sm:gap-10">
      <motion.div style={reduce ? undefined : { scale }} className={`frame ${n % 2 ? "sm:order-last" : ""}`}>
        <div className="relative aspect-square overflow-hidden bg-cream">
          <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: imgScale }}>
            <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
          </motion.div>
        </div>
      </motion.div>
      <div className="pb-2">
        <p className="smallcaps text-sm text-gold">{roman(n + 1)}</p>
        <h3 className="display mt-2 text-[clamp(2.2rem,3.6vw,3.2rem)]" lang="en">
          The <em>{title}</em>
        </h3>
        <p className="mt-4 max-w-[38ch] leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}

export function ProductView({ product, initialColor }: { product: Product; initialColor: string }) {
  const one = isOneSize(product);
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState<string | null>(one ? ONE_SIZE : null);
  const [qtyRaw, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(true);
  const add = useCart((s) => s.add);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const sizesRef = useRef<HTMLFieldSetElement>(null);
  const attention = useAnimationControls();
  const reduce = useReducedMotion();

  const colorObj = product.colors.find((c) => c.id === color) ?? product.colors[0];
  const images = productImages(product, colorObj.id).map((src, i) => ({ src, alt: `${product.name} en ${colorObj.name}, ${VIEWS[i] ?? `vista ${i + 1}`}` }));
  const stock = size ? stockOf(product, colorObj.id, size) : null;
  const category = getCategory(product.category);
  const maxQty = Math.max(1, Math.min(10, stock ?? 10));
  const qty = Math.min(qtyRaw, maxQty);

  // Color en la URL: se puede compartir y respeta el botón atrás
  const changeColor = (id: string) => {
    setColor(id);
    if (size && stockOf(product, id, size) === 0) setSize(one ? ONE_SIZE : null);
    const url = new URL(window.location.href);
    url.searchParams.set("color", id);
    window.history.replaceState(null, "", url);
  };

  // La barra fija aparece cuando el botón principal quedó arriba del viewport
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", () => {
    const r = ctaRef.current?.getBoundingClientRect();
    if (!r) return;
    const visible = r.bottom > 0;
    if (visible !== ctaVisible) setCtaVisible(visible);
  });

  const handleAdd = () => {
    if (!size || stockOf(product, colorObj.id, size) === 0) {
      setError(true);
      sizesRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      // Señal visual serena: el filete del talle se marca, sin sacudidas
      if (!reduce) attention.start({ backgroundColor: ["rgb(90 31 37 / 0.08)", "rgb(90 31 37 / 0)"], transition: { duration: 1.6, ease: EASE } });
      window.setTimeout(() => sizesRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus({ preventScroll: true }), reduce ? 0 : 450);
      return;
    }
    add(product.slug, colorObj.id, size, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2600);
  };

  const lowStock = stock !== null && stock > 0 && stock <= 2;

  return (
    <article className="relative">
      <div className="mx-auto max-w-[1440px] pt-[var(--header-h)] lg:px-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-10">
          {/* Portada: referencia, nombre y ruta */}
          <header className="order-2 px-4 pt-7 md:px-10 lg:order-none lg:col-span-12 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10 lg:px-0 lg:pb-14 lg:pt-12">
            <div className="lg:col-span-9">
              <nav aria-label="Ruta" className="smallcaps text-sm text-ink-soft">
                <Link href="/shop" className="-my-1 inline-block py-1 hover:text-ink">Shop</Link>
                <span aria-hidden className="mx-2">/</span>
                {category && (
                  <Link href={`/shop/${category.id}`} className="-my-1 inline-block py-1 hover:text-ink">
                    {category.label}
                  </Link>
                )}
              </nav>
              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: EASE }}
                className="display mt-3 pb-1 text-[clamp(2.6rem,6vw,6.2rem)] leading-[1.02]"
                lang="en"
              >
                <ItalicLast text={product.name} />
              </motion.h1>
            </div>
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
              className="hidden max-w-[34ch] font-serif text-xl italic leading-snug text-ink-soft lg:col-span-3 lg:block lg:pb-3"
            >
              {product.occasion}
            </motion.p>
          </header>

          {/* Índice de láminas */}
          <nav aria-label="Fotos" className="hidden lg:col-span-1 lg:block">
            <ul className="sticky top-[calc(var(--header-h)+2rem)] flex flex-col gap-3">
              {images.map((img, i) => (
                <li key={img.src}>
                  <a href={`#photo-${i}`} className="group block">
                    <span className="relative block aspect-[4/5] w-full overflow-hidden bg-cream opacity-70 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Image src={img.src} alt={`Ir a la vista ${VIEWS[i]}`} fill sizes="80px" className="object-cover" />
                    </span>
                    <span className="smallcaps mt-1 block text-center text-xs text-ink-soft">{roman(i + 1)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="order-1 lg:order-none lg:col-span-6">
            <Gallery images={images} colorKey={colorObj.id} name={product.name} />
          </div>

          {/* Panel de compra */}
          <div className="order-3 px-4 pt-6 md:px-10 lg:order-none lg:col-span-5 lg:px-0 lg:pt-0">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:pl-4">
              <div className="flex items-center justify-between gap-4">
                <span className="smallcaps inline-flex items-center gap-3 bg-navy px-3 py-1.5 text-sm text-gold-soft">
                  Hartwell <span aria-hidden className="h-3 w-px bg-gold-soft/50" /> Nº {product.ref}
                </span>
                {product.tags.includes("new") && <span className="smallcaps text-sm text-oxblood">Nuevo</span>}
              </div>
              <p className="numeral mt-6 text-2xl">{formatPrice(product.price)}</p>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-ink-soft">{product.summary}</p>

              <fieldset className="mt-8">
                <legend className="text-sm">
                  Color: <span className="text-ink-soft">{colorObj.name}</span>
                </legend>
                <Swatches product={product} value={colorObj.id} onChange={changeColor} name="color" className="mt-3" />
              </fieldset>

              <motion.fieldset ref={sizesRef} animate={attention} className="-mx-3 mt-6 px-3 py-2" aria-describedby={error ? "size-error" : "size-status"}>
                <div className="flex items-center justify-between gap-4">
                  <legend className="float-left text-sm">{one ? "Talle único" : "Talle"}</legend>
                  <SizeGuide product={product} />
                </div>
                <SizeChips
                  product={product}
                  colorId={colorObj.id}
                  value={size}
                  onChange={(s) => {
                    setSize(s);
                    setError(false);
                  }}
                  name="size"
                  className="clear-both mt-3"
                />
                <p id="size-status" className="mt-3 min-h-6 text-sm" aria-live="polite">
                  {error ? null : stock === null ? (
                    <span className="text-ink-soft">Elegir un talle.</span>
                  ) : stock === 0 ? (
                    <span className="text-oxblood">Agotado en este color.</span>
                  ) : lowStock ? (
                    <span className="text-oxblood">Quedan {stock} en {one ? "este color" : `talle ${size}`}.</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-forest">
                      <Check size={14} weight="light" aria-hidden /> Disponible{one ? "" : ` en talle ${size}`}.
                    </span>
                  )}
                </p>
                {error && (
                  <p id="size-error" role="alert" className="-mt-6 text-sm text-oxblood">
                    Elegir un talle para agregar a la bolsa.
                  </p>
                )}
              </motion.fieldset>

              <div className="mt-4 flex gap-3">
                <QtyStepper value={qty} max={maxQty} onChange={setQty} label="Cantidad" />
                <button ref={ctaRef} type="button" onClick={handleAdd} className={`btn min-w-0 flex-1 px-4 ${added ? "btn-oxblood" : ""}`} aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={added ? "added" : "add"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="inline-flex items-center gap-2">
                      {added ? (
                        <>
                          <Check size={15} weight="light" aria-hidden /> Añadido
                        </>
                      ) : (
                        <>
                          <span className="sm:hidden">Agregar</span>
                          <span className="hidden sm:inline">Agregar a la bolsa</span>
                          <span className="numeral normal-case tracking-normal">· {formatPrice(product.price * qty)}</span>
                        </>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>

              <ul className="mt-8 grid gap-3 text-sm text-ink-soft">
                <li className="flex items-start gap-3">
                  <Truck size={19} weight="light" aria-hidden className="shrink-0 text-ink" />
                  <span>Envío sin cargo desde {formatPrice(FREE_SHIPPING_FROM)}. Despacho en 24 horas hábiles.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowsClockwise size={19} weight="light" aria-hidden className="shrink-0 text-ink" />
                  <span>Cambios sin cargo durante 30 días.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Package size={19} weight="light" aria-hidden className="shrink-0 text-ink" />
                  <span>Cada pieza viaja en su caja, envuelta en papel de seda.</span>
                </li>
              </ul>

              <div className="mt-8 border-t border-line">
                {[
                  { t: "Descripción", b: product.description },
                  { t: "Tela y origen", b: `${product.cloth} ${product.origin}` },
                  { t: "Cuidado", b: product.care },
                ].map((d, i) => (
                  <details key={d.t} className="group border-b border-line" open={i === 0}>
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
                      <span className="smallcaps text-base">{d.t}</span>
                      <span aria-hidden className="relative h-3 w-3">
                        <span className="absolute inset-x-0 top-1/2 h-px bg-ink" />
                        <span className="absolute inset-y-0 left-1/2 w-px bg-ink transition-transform duration-500 group-open:scale-y-0" />
                      </span>
                    </summary>
                    <p className="pb-6 leading-relaxed text-ink-soft">{d.b}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notas sobre la pieza */}
      <section aria-labelledby="notes-title" className="mx-auto mt-28 max-w-[1440px] px-4 md:px-10 lg:mt-40">
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
              <h2 id="notes-title" className="display text-[clamp(2.6rem,4.6vw,4.2rem)]">
                Notas sobre <em>la pieza</em>
              </h2>
              <dl className="ticket mt-10 max-w-sm px-8 py-7 text-sm">
                <div className="flex items-baseline justify-between gap-6 border-b border-dashed border-line-strong pb-3">
                  <dt className="smallcaps text-ink-soft">Referencia</dt>
                  <dd className="numeral">Nº {product.ref}</dd>
                </div>
                <div className="border-b border-dashed border-line-strong py-3">
                  <dt className="smallcaps text-ink-soft">Composición</dt>
                  <dd className="mt-1">{product.cloth}</dd>
                </div>
                <div className="border-b border-dashed border-line-strong py-3">
                  <dt className="smallcaps text-ink-soft">Origen</dt>
                  <dd className="mt-1">{product.origin}</dd>
                </div>
                <div className="pt-3">
                  <dt className="smallcaps text-ink-soft">Colores</dt>
                  <dd className="mt-1">{product.colors.map((c) => c.name).join(", ")}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="flex flex-col gap-20 lg:gap-28">
            <Note n={0} title="Cloth" body={product.cloth + " " + product.origin} img={details.cloth} />
            <Note n={1} title="Cut" body={product.fit} img={details.cut} />
            <Note n={2} title="Occasion" body={product.occasion} img={details.label} />
          </div>
        </div>
      </section>

      {/* Barra de compra fija (mobile) */}
      <AnimatePresence>
        {!ctaVisible && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.6, ease: EASE }}
            data-sticky-buy
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="relative aspect-[4/5] w-11 shrink-0 overflow-hidden bg-ivory">
                <Image src={images[0].src} alt="" fill sizes="44px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-lg leading-tight">{product.name}</p>
                <p className="numeral text-xs text-ink-soft">
                  {colorObj.name}
                  {size && !one ? ` · Talle ${size}` : ""} · {formatPrice(product.price)}
                </p>
              </div>
              <button type="button" onClick={handleAdd} className="btn h-12 min-h-12 shrink-0 px-5">
                {added ? "Añadido" : size ? "Agregar" : "Elegir talle"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
