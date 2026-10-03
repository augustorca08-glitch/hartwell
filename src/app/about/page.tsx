import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { about } from "@/content/media";
import { CONCIERGE_EMAIL, FREE_SHIPPING_FROM, SHIPPING_OPTIONS, formatPrice, roman, whatsappLink } from "@/lib/site";
import { FrameReveal, LineReveal, Parallax, Reveal } from "@/components/ui/motion";
import { Monogram } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "About",
  description: "HARTWELL: sastrería, punto y prendas de club desde 1931.",
};

const milestones = [
  { year: "1931", text: "Edmund Hartwell abre una sastrería de dos mesas frente al campo de polo." },
  { year: "1954", text: "El club encarga sus primeros polos de piqué con el monograma bordado." },
  { year: "1978", text: "La Casa empieza a trabajar con un taller de punto en los Scottish Borders." },
  { year: "2027", text: "The Estate Summer: lino, sarga y punto para una temporada en la finca." },
];

const principles = [
  { title: "Telas nobles", body: "Lino irlandés, lana de Biella, cashmere de dos cabos y cuero de curtido vegetal. Telas que mejoran con el uso." },
  { title: "Talleres conocidos", body: "Trabajamos con talleres pequeños de Italia, Portugal, Escocia e Inglaterra. Los visitamos antes de cada temporada." },
  { title: "Hecho para durar", body: "Cada pieza se puede ajustar y reparar. El servicio de la Casa hace arreglos sin cargo durante el primer año." },
];

function InfoBlock({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28 border-t border-line-strong pt-6">
      <h2 className="display text-[2rem]">{title}</h2>
      <div className="mt-3 max-w-[52ch] leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-[calc(var(--header-h)+3rem)] md:px-10 lg:pt-[calc(var(--header-h)+4.5rem)]">
        <LineReveal as="h1" lang="en" lines={["The House of", <em key="h">Hartwell</em>]} className="display text-[clamp(3.4rem,9vw,9rem)] leading-[0.95]" />
        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-10">
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="max-w-[40ch] text-[1.08rem] leading-relaxed">
              Desde 1931 la Casa hace la ropa que se usa en los clubes, en el campo y en la costa: sastrería, punto y prendas de club pensadas para durar varias generaciones.
            </p>
            <p className="mt-5 max-w-[40ch] leading-relaxed text-ink-soft">Seguimos siendo una casa pequeña. Hacemos pocas piezas por temporada y casi nunca cambiamos las que funcionan.</p>
          </Reveal>
          <div className="lg:col-span-8">
            <div className="frame">
              <FrameReveal className="relative aspect-[16/9] overflow-hidden bg-cream">
                <Image src={about.lead.src} alt={about.lead.alt} fill preload sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover" />
              </FrameReveal>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="timeline-title" className="bg-navy px-4 py-24 text-paper md:px-10 lg:py-32" data-surface="dark">
        <div className="mx-auto max-w-[1440px]">
          <LineReveal id="timeline-title" lines={[<>Desde <em>1931</em></>]} className="display text-[clamp(2.6rem,5vw,4.6rem)]" />
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {milestones.map((m, i) => (
              <Reveal as="li" key={m.year} delay={i * 0.1} className="border-t border-line-light pt-6">
                <p className="display numeral text-[3.6rem] leading-none text-gold-soft">{m.year}</p>
                <p className="mt-4 max-w-[30ch] leading-relaxed text-paper/80">{m.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="mx-auto max-w-[1440px] px-4 py-24 md:px-10 lg:py-36">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <Parallax distance={24}>
                <div className="frame">
                  <FrameReveal className="relative aspect-[4/5] overflow-hidden bg-cream">
                    <Image src={about.atelier.src} alt={about.atelier.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                  </FrameReveal>
                </div>
              </Parallax>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <LineReveal id="principles-title" lines={[<>Cómo se hace <em>una pieza</em></>]} className="display text-[clamp(2.6rem,5vw,4.6rem)] leading-[1.02]" />
            <ol className="mt-14 flex flex-col gap-14">
              {principles.map((p, i) => (
                <Reveal as="li" key={p.title} delay={0.05}>
                  <p className="smallcaps text-sm text-gold">{roman(i + 1)}</p>
                  <h3 className="display mt-1 text-[clamp(2rem,3.4vw,3rem)]">{p.title}</h3>
                  <p className="mt-3 max-w-[46ch] leading-relaxed text-ink-soft">{p.body}</p>
                </Reveal>
              ))}
            </ol>
            <div className="frame mt-16 hidden w-2/3 lg:block">
              <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                <Image src={about.archive.src} alt={about.archive.alt} fill sizes="28vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="service-title" className="surface-linen px-4 py-24 md:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Monogram className="h-14 w-14 text-navy" />
            <h2 id="service-title" className="display mt-6 text-[clamp(2.4rem,4.4vw,4rem)] leading-[1.02]">
              El servicio <em>de la Casa</em>
            </h2>
            <p className="mt-4 max-w-[34ch] text-ink-soft">Envíos, cambios, talles y cuidado de las prendas. Para todo lo demás, el concierge.</p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:col-span-8 lg:gap-x-12">
            <InfoBlock id="envios" title="Envíos">
              <p>Despacho en 24 horas hábiles. Envío sin cargo en compras desde {formatPrice(FREE_SHIPPING_FROM)}.</p>
              <ul className="mt-4 grid gap-2">
                {SHIPPING_OPTIONS.map((o) => (
                  <li key={o.id} className="flex flex-wrap justify-between gap-2 border-b border-line pb-2">
                    <span>
                      <span className="text-ink">{o.label}</span> · {o.detail}
                    </span>
                    <span className="numeral text-ink">{o.price ? formatPrice(o.price) : "Sin cargo"}</span>
                  </li>
                ))}
              </ul>
            </InfoBlock>
            <InfoBlock id="cambios" title="Cambios y devoluciones">
              <p>Treinta días para cambiar talle o color sin cargo. La prenda tiene que estar sin uso y con su etiqueta.</p>
            </InfoBlock>
            <InfoBlock id="talles" title="Guía de talles">
              <p>Cada pieza tiene su tabla de medidas en la página del producto. Ante la duda entre dos talles, el concierge ayuda a elegir.</p>
            </InfoBlock>
            <InfoBlock id="cuidado" title="Cuidado de las prendas">
              <p>Lavar el punto a mano y secarlo en plano. Cepillar la lana después de usarla. Guardar el cashmere doblado, nunca colgado.</p>
            </InfoBlock>
            <InfoBlock id="contacto" title="Contacto">
              <p>Concierge de lunes a sábado, de 10 a 19 h.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={whatsappLink("Hola HARTWELL, tengo una consulta.")} target="_blank" rel="noopener noreferrer" className="btn">
                  WhatsApp
                </a>
                <a href={`mailto:${CONCIERGE_EMAIL}`} className="btn btn-line max-w-full whitespace-normal break-all normal-case tracking-normal">
                  {CONCIERGE_EMAIL}
                </a>
              </div>
            </InfoBlock>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1440px] flex-col items-center px-4 py-24 text-center md:px-10 lg:py-32">
        <LineReveal lang="en" lines={["Classic never", <em key="l">leaves.</em>]} className="display text-[clamp(2.8rem,6vw,5.4rem)] leading-[1]" />
        <Link href="/collection/estate-summer" className="btn mt-10">
          Discover the collection
        </Link>
      </section>
    </>
  );
}
