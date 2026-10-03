# HARTWELL

Sitio de marca y ecommerce (demo) para HARTWELL, una casa ficticia de ropa Old Money / Heritage / Quiet Luxury.
Construido sobre el esqueleto de experiencia de WAVEFORM, con identidad propia.
Next.js 16 · Tailwind v4 · Motion · Zustand · Lenis · Playwright.

## Comandos

```bash
npm run dev            # desarrollo en http://localhost:3000
npm run build          # build de producción
npm run typecheck      # genera tipos de rutas y corre TypeScript
npm run lint           # ESLint
npm run test:e2e       # Playwright: 1440×900, 1280×720, 390×844 y 375×812 (requiere build previo)
npm run audit          # auditoría técnica completa (requiere `npx next start -p 3200`)
npm run placeholders   # regenera placeholders faltantes (nunca pisa tus archivos)
```

Las capturas de Playwright quedan en `shots/{proyecto}` y las de la auditoría en `shots/playwright`.

## Identidad

| | |
|---|---|
| Tipografía | Cormorant Garamond (display, itálica de énfasis), Cormorant SC (versalitas), Libre Franklin (interfaz) |
| Paleta | Paper `#F6F2EA`, Ivory, Cream, Sand, Stone · Navy `#1B2940`, Forest `#22392C`, Oxblood `#5A1F25` · Gold, Brown, Leather solo en detalles |
| Formas | Todo rectangular, filetes de 1px, láminas en passe-partout |
| Logo | Wordmark en versales espaciadas y monograma HW: `public/assets/hartwell/logo/` (favicon en `src/app/icon.svg`) |
| Tokens | `src/app/globals.css` (`@theme`) |

## Reemplazar assets

Todo vive en `public/assets/hartwell/`. **Para reemplazar una imagen, sobrescribí el archivo con el mismo nombre
y respetá su ratio.** No hace falta tocar código; en producción, volvé a correr `npm run build`.
Cada placeholder lleva impresa su ruta y su ratio.

| Carpeta | Contenido | Ratio |
|---|---|---|
| `hero/` | `hero-poster.jpg` (desktop) y `hero-poster-mobile.jpg` (recorte vertical) | 16:9 y 4:5 |
| `campaign/` | Colección (`estate-summer-*`), cápsula Clubhouse, cierre (`final.jpg` 21:9, `final-mobile.jpg` 4:5) | indicado en `media.ts` |
| `campaign/categories/` | Una lámina por categoría | 4:5 |
| `lookbook/` | 11 fotos ordenadas por capítulo (`01-the-estate.jpg` …) | 4:5 o 3:2 |
| `products/{slug}/{color}-{1,2,3}.jpg` | Frente, espalda, detalle de tela | 4:5 (1600×2000) |
| `editorial/` | Carta de la Casa, doble página, About, macros de detalle (`details/`) | indicado en `media.ts` |
| `textures/` | `paper-grain.png` (grano global) y `linen.jpg` (superficie de lino) | tile |

El manifiesto completo, con textos alternativos, está en `src/content/media.ts`.
El catálogo (nombres, precios, colores, talles, stock mock) está en `src/content/products.ts`.

### Video del hero
Colocá tu archivo en **`public/videos/hero.mp4`** (opcional `hero-mobile.mp4`, vertical).
Recomendado: H.264, sin audio, 8 a 15 s en loop, menos de 4 MB, primer frame igual al poster.
El video tiene autoplay, muted, loop y playsInline; se carga en idle, no se reproduce con
`prefers-reduced-motion`, Save-Data o 2G, se pausa fuera de pantalla y tiene botón de pausa accesible.
Sin video, el hero usa el poster (en desarrollo aparece la etiqueta `VIDEO PLACEHOLDER`).

### Dirección fotográfica
Luz natural, hora dorada, grano de película sutil, colores apagados, piel natural, encuadres de 35/50 mm.
Escenas: la finca y su alameda, caballerizas, tenis sobre césped, regata en el lago, Riviera, colegio, biblioteca, camino de cipreses.
Evitar renders, fondos blancos de ecommerce, poses forzadas y logos de terceros.

## Pendientes para producción
- Número real de WhatsApp y email del concierge en `src/lib/site.ts`.
- Pasarela de pago real en `src/components/checkout/checkout-flow.tsx` (hoy el checkout es simulado).
- Dominio real en `metadataBase` (`src/app/layout.tsx`).
