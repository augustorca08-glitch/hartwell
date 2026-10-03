"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, LockSimple } from "@phosphor-icons/react";
import { resolveLines, sizeLabel, subtotalOf, useCart, useCartHydrated } from "@/lib/cart";
import { FREE_SHIPPING_FROM, SHIPPING_OPTIONS, formatPrice, roman } from "@/lib/site";
import { EASE } from "@/components/ui/motion";

type Data = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  shipping: (typeof SHIPPING_OPTIONS)[number]["id"];
  payment: "card" | "transfer";
  gift: boolean;
};
type Errors = Partial<Record<keyof Data, string>>;

const STEPS = ["Contacto", "Envío", "Revisión"] as const;

function validate(step: number, d: Data): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = "El email no parece válido. Ejemplo: nombre@mail.com.";
    if (d.name.trim().length < 2) e.name = "Falta el nombre y apellido.";
    if (d.phone && d.phone.replace(/\D/g, "").length < 8) e.phone = "El teléfono parece incompleto.";
  }
  if (step === 1 && d.shipping !== "pickup") {
    if (d.address.trim().length < 4) e.address = "Falta la calle y el número.";
    if (d.city.trim().length < 2) e.city = "Falta la ciudad.";
    if (!/^[A-Za-z0-9 -]{3,10}$/.test(d.zip.trim())) e.zip = "El código postal no parece válido.";
  }
  return e;
}

const inputCls =
  "h-12 w-full bg-paper px-4 text-base text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-shadow duration-300 placeholder:text-taupe hover:shadow-[inset_0_0_0_1px_var(--color-ink-soft)] focus-visible:shadow-[inset_0_0_0_1px_var(--color-ink)] aria-[invalid=true]:shadow-[inset_0_0_0_1.5px_var(--color-oxblood)]";

function Field({ id, label, error, hint, ...input }: { id: string; label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm">
        {label}
        {!input.required && <span className="text-ink-soft"> (opcional)</span>}
      </label>
      <input id={id} aria-invalid={!!error} aria-describedby={describedBy} className={inputCls} {...input} />
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-oxblood">
          {error}
        </p>
      )}
    </div>
  );
}

function Summary({ lines, shippingCost }: { lines: ReturnType<typeof resolveLines>; shippingCost: number }) {
  const subtotal = subtotalOf(lines);
  return (
    <div>
      <ul className="flex flex-col gap-5">
        {lines.map((l) => (
          <li key={l.key} className="grid grid-cols-[64px_1fr_auto] items-center gap-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream">
              <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />
              <span className="numeral absolute right-0 top-0 grid h-6 min-w-6 place-items-center bg-navy px-1 text-[11px] text-paper">{l.qty}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate font-serif text-lg leading-tight">{l.name}</p>
              <p className="text-sm text-ink-soft">
                {l.colorName} · {sizeLabel(l.size)}
              </p>
            </div>
            <span className="numeral text-sm">{formatPrice(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-6 grid grid-cols-[1fr_auto] gap-y-2 border-t border-line pt-5 text-sm">
        <dt>Subtotal</dt>
        <dd className="numeral">{formatPrice(subtotal)}</dd>
        <dt>Envío</dt>
        <dd className="numeral">{shippingCost ? formatPrice(shippingCost) : "Sin cargo"}</dd>
        <dt className="smallcaps pt-3 text-lg">Total</dt>
        <dd className="numeral pt-3 text-lg">{formatPrice(subtotal + shippingCost)}</dd>
      </dl>
    </div>
  );
}

function Choice({ name, value, checked, onChange, children }: { name: string; value: string; checked: boolean; onChange: React.ChangeEventHandler<HTMLInputElement>; children: React.ReactNode }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center gap-4 px-5 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors duration-500 has-[:checked]:bg-navy has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

export function CheckoutFlow() {
  const hydrated = useCartHydrated();
  const raw = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const lines = resolveLines(raw);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [d, setD] = useState<Data>({ email: "", name: "", phone: "", address: "", city: "", zip: "", country: "Argentina", shipping: "standard", payment: "card", gift: false });

  // Aviso antes de salir si hay datos cargados y el pedido no se confirmó
  const dirty = !submitting && (["email", "name", "phone", "address", "city", "zip"] as const).some((k) => d[k] !== "");
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const subtotal = subtotalOf(lines);
  const option = SHIPPING_OPTIONS.find((o) => o.id === d.shipping)!;
  const costOf = (o: (typeof SHIPPING_OPTIONS)[number]) => (o.id === "standard" && subtotal >= FREE_SHIPPING_FROM ? 0 : o.price);
  const shippingCost = costOf(option);

  const set =
    <K extends keyof Data>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setD((prev) => ({ ...prev, [k]: value }));
      if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
    };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(step, d);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`#${CSS.escape(`${uid}-${first}`)}`)?.focus();
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      window.setTimeout(() => formRef.current?.querySelector<HTMLElement>("h2")?.focus(), 60);
      return;
    }
    setSubmitting(true);
    const order = `HW-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    try {
      sessionStorage.setItem("hartwell-last-order", JSON.stringify({ order, email: d.email, total: subtotal + shippingCost, name: d.name.split(" ")[0] }));
    } catch {}
    window.setTimeout(() => {
      clear();
      router.push(`/checkout/success?order=${order}`);
    }, 900);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-[calc(var(--header-h)+3rem)] md:px-10 lg:grid-cols-[1.3fr_1fr]" aria-busy="true">
        <div className="h-[420px] animate-pulse bg-ivory" />
        <div className="h-[300px] animate-pulse bg-ivory" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-[calc(var(--header-h)+4.5rem)] md:px-10">
        <h1 className="display text-[clamp(3.2rem,9vw,8rem)] leading-[0.98]">
          La bolsa está <em>vacía.</em>
        </h1>
        <p className="mt-5 max-w-[42ch] text-lg text-ink-soft">Para iniciar la compra, primero hay que agregar alguna pieza.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/collection/estate-summer" className="btn">
            New Collection
          </Link>
          <Link href="/shop" className="btn btn-line">
            Ver el shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-[calc(var(--header-h)+3rem)] md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[clamp(3rem,7vw,6rem)] leading-none">Checkout</h1>
        <p className="mb-2 inline-flex items-center gap-2 text-sm text-ink-soft">
          <LockSimple size={15} weight="light" aria-hidden /> Demostración: no se procesan pagos reales.
        </p>
      </div>

      <ol className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-b border-line" aria-label="Pasos del checkout">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className={`relative flex h-12 items-center gap-2 text-[0.95rem] transition-colors duration-500 ${i === step ? "text-ink" : i < step ? "text-ink-soft hover:text-ink" : "text-taupe"}`}
            >
              {i < step ? <Check size={14} weight="light" aria-hidden /> : <span className="smallcaps text-gold">{roman(i + 1)}</span>}
              {s}
              <span className={`absolute inset-x-0 -bottom-px h-px bg-ink transition-transform duration-700 ${i === step ? "scale-x-100" : "scale-x-0"}`} />
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <form ref={formRef} onSubmit={next} noValidate className="order-last lg:order-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.fieldset key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col gap-6">
              <legend className="sr-only">{STEPS[step]}</legend>
              <h2 tabIndex={-1} className="display text-4xl outline-none">
                {STEPS[step]}
              </h2>

              {step === 0 && (
                <>
                  <Field id={`${uid}-email`} name="email" label="Email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} placeholder="nombre@mail.com" value={d.email} onChange={set("email")} error={errors.email} hint="La confirmación del pedido llega a este email." />
                  <Field id={`${uid}-name`} name="name" label="Nombre y apellido" required autoComplete="name" value={d.name} onChange={set("name")} error={errors.name} />
                  <Field id={`${uid}-phone`} name="phone" label="Teléfono" type="tel" autoComplete="tel" inputMode="tel" value={d.phone} onChange={set("phone")} error={errors.phone} hint="Solo para coordinar la entrega." />
                </>
              )}

              {step === 1 && (
                <>
                  <fieldset>
                    <legend className="text-sm">Método de envío</legend>
                    <div className="mt-3 grid gap-2">
                      {SHIPPING_OPTIONS.map((o) => {
                        const cost = costOf(o);
                        return (
                          <Choice key={o.id} name="shipping" value={o.id} checked={d.shipping === o.id} onChange={set("shipping")}>
                            <span className="flex-1">
                              {o.label} <span className="text-sm opacity-75">{o.detail}</span>
                            </span>
                            <span className="numeral text-sm">{cost ? formatPrice(cost) : "Sin cargo"}</span>
                          </Choice>
                        );
                      })}
                    </div>
                  </fieldset>
                  {d.shipping !== "pickup" && (
                    <>
                      <Field id={`${uid}-address`} name="address" label="Dirección" required autoComplete="street-address" value={d.address} onChange={set("address")} error={errors.address} placeholder="Calle y número…" />
                      <div className="grid gap-6 sm:grid-cols-[1.4fr_1fr]">
                        <Field id={`${uid}-city`} name="city" label="Ciudad" required autoComplete="address-level2" value={d.city} onChange={set("city")} error={errors.city} />
                        <Field id={`${uid}-zip`} name="zip" label="Código postal" required autoComplete="postal-code" value={d.zip} onChange={set("zip")} error={errors.zip} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`${uid}-country`} className="text-sm">
                          País
                        </label>
                        <select id={`${uid}-country`} autoComplete="country-name" value={d.country} onChange={set("country")} name="country" className={inputCls}>
                          {["Argentina", "Uruguay", "Chile", "Brasil", "Estados Unidos", "España", "Reino Unido", "Italia"].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                    <input type="checkbox" checked={d.gift} onChange={set("gift")} className="h-5 w-5 accent-navy" />
                    Preparar como regalo: caja de la Casa, sin precios en el envío.
                  </label>
                </>
              )}

              {step === 2 && (
                <>
                  <dl className="grid gap-5 bg-ivory p-6 text-sm shadow-[inset_0_0_0_1px_var(--color-line)] sm:grid-cols-2">
                    <div>
                      <dt className="smallcaps text-ink-soft">Contacto</dt>
                      <dd className="mt-1">
                        {d.name}
                        <br />
                        <span className="break-all">{d.email}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="smallcaps text-ink-soft">Envío</dt>
                      <dd className="mt-1">
                        {option.label}
                        <br />
                        {d.shipping === "pickup" ? option.detail : `${d.address}, ${d.city} (${d.zip}), ${d.country}`}
                        {d.gift && (
                          <>
                            <br />
                            Preparado como regalo
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>
                  <fieldset>
                    <legend className="text-sm">Pago (simulado)</legend>
                    <div className="mt-3 grid gap-2">
                      {[
                        { id: "card", label: "Tarjeta de crédito o débito" },
                        { id: "transfer", label: "Transferencia bancaria" },
                      ].map((o) => (
                        <Choice key={o.id} name="payment" value={o.id} checked={d.payment === o.id} onChange={set("payment")}>
                          {o.label}
                        </Choice>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-ink-soft">En esta versión no se cobra nada. Acá se conectará la pasarela de pago (por ejemplo Mercado Pago o Stripe).</p>
                  </fieldset>
                </>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4">
                {step > 0 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="btn btn-line">
                    <ArrowLeft size={14} weight="light" aria-hidden /> Volver
                  </button>
                )}
                <button type="submit" className="btn min-w-52" disabled={submitting} aria-disabled={submitting}>
                  {submitting ? "Confirmando…" : step < 2 ? "Continuar" : `Confirmar pedido · ${formatPrice(subtotal + shippingCost)}`}
                </button>
              </div>
            </motion.fieldset>
          </AnimatePresence>
        </form>

        <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
          <details className="group bg-ivory p-5 shadow-[inset_0_0_0_1px_var(--color-line)] lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
              <span className="smallcaps text-base">Resumen ({lines.reduce((n, l) => n + l.qty, 0)})</span>
              <span className="numeral">{formatPrice(subtotal + shippingCost)}</span>
            </summary>
            <div className="mt-5">
              <Summary lines={lines} shippingCost={shippingCost} />
            </div>
          </details>
          <div className="hidden bg-ivory p-8 shadow-[inset_0_0_0_1px_var(--color-line)] lg:block">
            <h2 className="display text-3xl">
              El <em>pedido</em>
            </h2>
            <div className="mt-6">
              <Summary lines={lines} shippingCost={shippingCost} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
