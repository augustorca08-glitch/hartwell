import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

/** Formulario GET: funciona sin JavaScript y se puede compartir la URL. */
export function SearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form role="search" action="/search" className="mt-8 max-w-xl">
      <label htmlFor="search-page-q" className="label block text-ink-soft">
        Nueva búsqueda
      </label>
      <div className="mt-2 flex items-center gap-3 border-b border-ink">
        <input
          id="search-page-q"
          name="q"
          type="search"
          defaultValue={defaultValue}
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 min-w-0 flex-1 bg-transparent font-serif text-2xl outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" aria-label="Buscar" className="grid h-11 w-11 place-items-center hover:text-navy">
          <MagnifyingGlass size={20} weight="light" aria-hidden />
        </button>
      </div>
    </form>
  );
}
