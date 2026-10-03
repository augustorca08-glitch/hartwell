import Link from "next/link";
import { Monogram } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80dvh] max-w-[1440px] flex-col px-4 pb-24 pt-[calc(var(--header-h)+5rem)] md:px-10">
      <Monogram className="h-12 w-12 text-gold" />
      <p className="smallcaps mt-8 text-sm text-ink-soft">Error 404</p>
      <h1 className="display mt-3 max-w-[14ch] text-[clamp(3.2rem,9vw,8rem)] leading-[0.98]">
        Esta página no está <em>en el archivo.</em>
      </h1>
      <p className="mt-6 max-w-[42ch] text-lg text-ink-soft">La dirección no existe o la pieza ya no forma parte de la colección.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn">
          Volver al inicio
        </Link>
        <Link href="/shop" className="btn btn-line">
          Ver el shop
        </Link>
      </div>
    </section>
  );
}
