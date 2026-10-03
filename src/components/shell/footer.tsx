"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { InstagramLogo, PinterestLogo, YoutubeLogo, ArrowRight } from "@phosphor-icons/react";
import { categories } from "@/content/products";
import { collection } from "@/content/media";
import { CONCIERGE_EMAIL } from "@/lib/site";
import { Monogram, Wordmark } from "@/components/brand/logo";

function Newsletter() {
  const id = useId();
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setState("error");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div role="status" className="max-w-md">
        <p className="display text-4xl">
          Gracias. <em>Hasta pronto.</em>
        </p>
        <p className="mt-3 text-paper/75">La próxima carta llega con el cambio de temporada.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-md">
      <h2 className="display text-[clamp(2.2rem,4vw,3.1rem)]" lang="en">
        The Hartwell <em>Letter</em>
      </h2>
      <p id={`${id}-help`} className="mt-3 max-w-[38ch] text-paper/75">
        Nuevas colecciones, notas de la Casa y el lookbook de cada temporada. Cuatro cartas al año.
      </p>
      <label htmlFor={`${id}-email`} className="label mt-7 block text-paper/75">
        Email
      </label>
      <div className="mt-2 flex gap-3">
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="nombre@mail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          aria-invalid={state === "error"}
          aria-describedby={`${id}-help${state === "error" ? ` ${id}-error` : ""}`}
          className="h-12 min-w-0 flex-1 border-b border-paper/50 bg-transparent text-base text-paper placeholder:text-paper/50 focus-visible:border-paper aria-[invalid=true]:border-gold-soft"
        />
        <button type="submit" className="btn btn-paper shrink-0 px-5">
          Suscribirse <ArrowRight size={14} weight="light" aria-hidden className="hidden xs:block" />
        </button>
      </div>
      {state === "error" && (
        <p id={`${id}-error`} role="alert" className="mt-3 text-sm text-gold-soft">
          El email no parece válido. Ejemplo: nombre@mail.com.
        </p>
      )}
    </form>
  );
}

const help = [
  { href: "/about#envios", label: "Envíos" },
  { href: "/about#cambios", label: "Cambios y devoluciones" },
  { href: "/about#talles", label: "Guía de talles" },
  { href: "/about#cuidado", label: "Cuidado de las prendas" },
  { href: "/about#contacto", label: "Contacto" },
];
const house = [
  { href: "/about", label: "Nuestra historia" },
  { href: "/collection/estate-summer", label: collection.name },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/search", label: "Buscar" },
];
const social = [
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramLogo },
  { href: "https://pinterest.com", label: "Pinterest", Icon: PinterestLogo },
  { href: "https://youtube.com", label: "YouTube", Icon: YoutubeLogo },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="smallcaps text-sm text-gold-soft">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-[0.95rem]">{children}</ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-navy-deep text-paper" data-surface="dark">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-14 px-4 pb-14 pt-20 md:px-10 lg:grid-cols-[1.1fr_2fr] lg:gap-20 lg:pt-28">
        <Newsletter />
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4">
          <Column title="Shop">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop/${c.id}`} className="link-line">
                  {c.label}
                </Link>
              </li>
            ))}
          </Column>
          <Column title="Ayuda">
            {help.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-line">
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>
          <Column title="La Casa">
            {house.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-line">
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>
          <div>
            <h2 className="smallcaps text-sm text-gold-soft">Concierge</h2>
            <a href={`mailto:${CONCIERGE_EMAIL}`} className="link-line mt-4 inline-block text-[0.95rem]">
              {CONCIERGE_EMAIL.split("@")[0]}@<wbr />{CONCIERGE_EMAIL.split("@")[1]}
            </a>
            <ul className="mt-5 flex gap-1">
              {social.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center shadow-[inset_0_0_0_1px_var(--color-line-light)] transition-colors duration-500 hover:bg-paper hover:text-navy-deep"
                  >
                    <Icon size={18} weight="light" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 md:px-10">
        <div className="ornament text-gold-soft/80" aria-hidden>
          <i />
        </div>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Monogram className="h-16 w-16 text-gold-soft" />
          <Wordmark className="text-2xl" />
          <p className="smallcaps text-sm text-paper/70">Est. 1931</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-light py-6 text-sm text-paper/70">
          <p>© 2026 HARTWELL. Marca ficticia, sitio de demostración.</p>
          <p>Precios en dólares estadounidenses.</p>
        </div>
      </div>
    </footer>
  );
}
