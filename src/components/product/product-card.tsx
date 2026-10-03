"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type Product, productImage, isSoldOut } from "@/content/products";
import { formatPrice } from "@/lib/site";
import { QuickAddInline, QuickAddSheet } from "./quick-add";

/**
 * Tarjeta sin caja: la lámina es la tarjeta.
 * Hover: la vista de espalda aparece por fundido, la imagen se acerca muy despacio
 * y sube la barra de talles para agregar sin salir del catálogo.
 */
export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 30vw, 50vw",
  ratio = "aspect-[4/5]",
  className = "",
  headingLevel = 3,
  tone = "light",
  preload = false,
}: {
  product: Product;
  sizes?: string;
  ratio?: string;
  className?: string;
  headingLevel?: 2 | 3;
  tone?: "light" | "dark";
  preload?: boolean;
}) {
  const [color, setColor] = useState(product.colors[0].id);
  const href = `/product/${product.slug}?color=${color}`;
  const soldOut = isSoldOut(product);
  const H = `h${headingLevel}` as "h2" | "h3";
  const isNew = product.tags.includes("new");
  const dark = tone === "dark";

  return (
    <article className={`group relative ${className}`}>
      <div className={`relative overflow-hidden ${dark ? "bg-forest-deep" : "bg-ivory"} ${ratio}`}>
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0 block">
          <Image
            src={productImage(product.slug, color, 1)}
            alt=""
            fill
            preload={preload}
            sizes={sizes}
            className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-quiet)] group-hover:scale-[1.04]"
          />
          <Image
            src={productImage(product.slug, color, 2)}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-[0.9s] ease-[var(--ease-quiet)] [@media(hover:hover)]:group-hover:opacity-100"
          />
        </Link>
        {!soldOut && (
          <>
            <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-quiet)] group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
              <QuickAddInline product={product} colorId={color} />
            </div>
            <div className="absolute bottom-3 right-3 [@media(hover:hover)]:hidden">
              <QuickAddSheet product={product} initialColor={color} />
            </div>
          </>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {isNew && <p className={`smallcaps mb-0.5 text-[0.8rem] ${dark ? "text-gold-soft" : "text-oxblood"}`}>Nuevo</p>}
          <H className="font-serif text-[1.22rem] font-medium leading-snug">
            <Link href={href} className="decoration-1 underline-offset-4 hover:underline">
              {product.name}
            </Link>
          </H>
          <div className="mt-2.5 flex gap-1" role="group" aria-label={`Colores de ${product.name}`}>
            {product.colors.map((c) => (
              <button key={c.id} type="button" onClick={() => setColor(c.id)} aria-pressed={color === c.id} aria-label={c.name} className="grid h-7 w-7 place-items-center">
                <span
                  className={`block h-3.5 w-3.5 outline outline-1 outline-offset-2 transition-[outline-color] duration-500 ${
                    dark ? "shadow-[inset_0_0_0_1px_rgb(246_242_234_/_0.3)]" : "shadow-[inset_0_0_0_1px_rgb(28_29_33_/_0.2)]"
                  } ${color === c.id ? (dark ? "outline-paper" : "outline-ink") : "outline-transparent"}`}
                  style={{ background: c.hex }}
                />
              </button>
            ))}
          </div>
        </div>
        <p className={`numeral shrink-0 pt-[1.15rem] text-sm ${dark ? "text-paper/85" : ""}`}>{soldOut ? "Agotado" : formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
