/**
 * Manifiesto de media de HARTWELL.
 *
 * Cada imagen editorial del sitio vive acá. Para usar fotografía real:
 *   1. Sobrescribí el archivo en /public con el mismo nombre (recomendado), o
 *   2. Cambiá `src` apuntando a tu archivo.
 * Respetá el ratio (w/h) indicado: las composiciones están pensadas para ese recorte.
 * Los archivos actuales son placeholders generados por scripts/make-placeholders.ts.
 * `scene` solo lo usa el generador de placeholders para elegir la ilustración.
 */

export type Scene =
  | "estate"
  | "stables"
  | "lawn"
  | "regatta"
  | "riviera"
  | "college"
  | "library"
  | "drive"
  | "garden"
  | "atelier"
  | "stilllife";

export type MediaSlot = {
  src: string;
  alt: string;
  w: number;
  h: number;
  /** object-position para recortes responsivos */
  focus?: string;
  scene: Scene;
};

const A = "/assets/hartwell";
const slot = (src: string, w: number, h: number, scene: Scene, alt: string, focus?: string): MediaSlot => ({ src: `${A}${src}`, w, h, scene, alt, focus });

export const hero = {
  /** Colocá tu video en /public/videos/hero.mp4. Si no existe, el hero usa el poster. */
  video: "/videos/hero.mp4",
  /** Opcional: corte vertical para mobile (4:5 o 9:16). Si no existe, se usa hero.mp4 */
  videoMobile: "/videos/hero-mobile.mp4",
  poster: slot("/hero/hero-poster.jpg", 1920, 1080, "estate", "", "50% 55%"),
  posterMobile: slot("/hero/hero-poster-mobile.jpg", 1200, 1500, "estate", "", "50% 50%"),
};

export const collection = {
  name: "The Estate Summer",
  season: "Summer 2027",
  slug: "estate-summer",
  lead: slot("/campaign/estate-summer-lead.jpg", 1600, 2000, "estate", "Jinete con blazer navy guiando un caballo por la alameda de la finca al atardecer"),
  hero: slot("/campaign/estate-summer-hero.jpg", 1920, 1080, "garden", "Jardín formal de la casa de campo con setos recortados y una escalinata de piedra", "50% 60%"),
  mood: slot("/campaign/estate-summer-mood.jpg", 1920, 1080, "drive", "Convertible clásico estacionado bajo una hilera de cipreses"),
};

export const clubhouse = {
  lead: slot("/campaign/clubhouse-lawn.jpg", 1600, 2000, "lawn", "Jugador con polo blanco caminando junto a una cancha de césped"),
};

export const categoryMedia: Record<string, MediaSlot> = {
  shirts: slot("/campaign/categories/shirts.jpg", 1200, 1500, "regatta", "Camisa de lino al viento en la cubierta de un velero"),
  polo: slot("/campaign/categories/polo.jpg", 1200, 1500, "lawn", "Polo navy sobre el respaldo de una silla de jardín junto a la cancha"),
  knitwear: slot("/campaign/categories/knitwear.jpg", 1200, 1500, "library", "Sweater de ochos sobre un sillón de cuero en la biblioteca"),
  trousers: slot("/campaign/categories/trousers.jpg", 1200, 1500, "college", "Pantalón chino caminando bajo los arcos de piedra de un colegio"),
  outerwear: slot("/campaign/categories/outerwear.jpg", 1200, 1500, "stables", "Chaqueta de campo encerada en la puerta de las caballerizas"),
  accessories: slot("/campaign/categories/accessories.jpg", 1200, 1500, "stilllife", "Cinturón de cuero, gorra y pañuelo de seda sobre una mesa de roble"),
};

export type LookbookChapter = {
  id: string;
  title: string;
  intro: string;
  frames: (MediaSlot & { caption: string; products: string[] })[];
};

export const lookbook: LookbookChapter[] = [
  {
    id: "the-estate",
    title: "The Estate",
    intro: "La casa amanece antes que nadie. El día empieza en la alameda.",
    frames: [
      { ...slot("/lookbook/01-the-estate.jpg", 1600, 2000, "estate", "Hombre con blazer navy caminando por la alameda de la finca"), caption: "Hartwell Wool Blazer en Navy, Country Chino en Stone.", products: ["hartwell-wool-blazer", "country-chino-trouser"] },
      { ...slot("/lookbook/02-the-garden.jpg", 1920, 1280, "garden", "Escalinata de piedra entre setos recortados"), caption: "Signature Oxford en Oxford Blue.", products: ["hartwell-signature-oxford"] },
    ],
  },
  {
    id: "the-stables",
    title: "The Stables",
    intro: "Botas embarradas, cuero que se oscurece, caballos que no esperan.",
    frames: [
      { ...slot("/lookbook/03-the-stables.jpg", 1600, 2000, "stables", "Jinete ajustando la montura en la puerta de las caballerizas"), caption: "Estate Field Jacket en Loden, Classic Leather Belt en Chestnut.", products: ["estate-field-jacket", "classic-leather-belt"] },
    ],
  },
  {
    id: "the-lawn",
    title: "The Lawn",
    intro: "Césped recién cortado y el sonido seco de la pelota contra la red.",
    frames: [
      { ...slot("/lookbook/04-the-lawn.jpg", 1920, 1280, "lawn", "Cancha de tenis de césped con la red tendida y un banco de madera"), caption: "Hartwell Classic Polo en Chalk.", products: ["hartwell-classic-polo"] },
      { ...slot("/lookbook/05-the-clubhouse.jpg", 1600, 2000, "lawn", "Jugadora con sweater de cricket sentada frente al club"), caption: "Cricket Cable Vest en Cream, Riviera Linen Trouser en Chalk.", products: ["cricket-cable-vest", "riviera-linen-trouser"] },
    ],
  },
  {
    id: "the-regatta",
    title: "The Regatta",
    intro: "Velas blancas sobre el lago y una camisa de lino que nunca se plancha.",
    frames: [
      { ...slot("/lookbook/06-the-regatta.jpg", 1600, 2000, "regatta", "Velero clásico de madera con las velas desplegadas sobre el lago"), caption: "Regatta Linen Shirt en Riviera Blue.", products: ["regatta-linen-shirt"] },
    ],
  },
  {
    id: "the-riviera",
    title: "The Riviera",
    intro: "Persianas verdes, sombrillas a rayas y almuerzos que terminan a las cinco.",
    frames: [
      { ...slot("/lookbook/07-the-riviera.jpg", 1920, 1280, "riviera", "Terraza sobre el Mediterráneo con sombrillas a rayas"), caption: "Riviera Linen Trouser en Sand, Riviera Silk Scarf en Oxblood.", products: ["riviera-linen-trouser", "riviera-silk-scarf"] },
      { ...slot("/lookbook/08-the-harbour.jpg", 1600, 2000, "riviera", "Muelle de piedra con lanchas de madera al atardecer"), caption: "Clubhouse Knitted Polo en Cream.", products: ["clubhouse-knitted-polo"] },
    ],
  },
  {
    id: "the-college",
    title: "The College",
    intro: "Piedra gastada, bicicletas apoyadas en la reja, el último día del semestre.",
    frames: [
      { ...slot("/lookbook/09-the-college.jpg", 1600, 2000, "college", "Estudiante con sweater de ochos bajo los arcos de un patio de piedra"), caption: "Heritage Cable Sweater en Forest, Pleated Flannel en Charcoal.", products: ["heritage-cable-sweater", "pleated-flannel-trouser"] },
      { ...slot("/lookbook/10-the-library.jpg", 1920, 1280, "library", "Biblioteca con estanterías de roble y luz de ventana"), caption: "Cashmere Crewneck en Camel.", products: ["cashmere-crewneck"] },
    ],
  },
  {
    id: "the-drive",
    title: "The Drive",
    intro: "Capota baja, camino de cipreses y ninguna prisa por llegar.",
    frames: [
      { ...slot("/lookbook/11-the-drive.jpg", 1920, 1280, "drive", "Convertible clásico en un camino bordeado de cipreses"), caption: "Thornbury Camel Coat en Camel, Hartwell Cap en Navy.", products: ["thornbury-camel-coat", "hartwell-cap"] },
    ],
  },
];

export const lookbookFrames = lookbook.flatMap((c) => c.frames.map((f) => ({ ...f, chapter: c.title })));

export const heritage = {
  archive: slot("/editorial/heritage-archive.jpg", 1200, 1500, "atelier", "Mesa de corte de la sastrería original con tijeras, tiza y un rollo de franela"),
};

export const editorial = {
  portrait: slot("/editorial/spread-portrait.jpg", 1600, 2000, "college", "Retrato bajo un arco de piedra con un blazer cruzado"),
  landscape: slot("/editorial/spread-landscape.jpg", 1920, 1280, "regatta", "Dos veleros cruzándose frente al muelle del club"),
};

export const details = {
  cloth: slot("/editorial/details/the-cloth.jpg", 1400, 1400, "stilllife", "Primer plano de la trama de la tela"),
  cut: slot("/editorial/details/the-cut.jpg", 1400, 1400, "atelier", "Patrón de papel y tiza de sastre sobre la mesa de corte"),
  label: slot("/editorial/details/the-label.jpg", 1400, 1400, "stilllife", "Etiqueta tejida HARTWELL cosida en el cuello"),
};

export const finalCta = {
  desktop: slot("/campaign/final.jpg", 2100, 900, "estate", "La fachada de la casa de campo al final de la alameda, con la última luz del día", "50% 55%"),
  mobile: slot("/campaign/final-mobile.jpg", 1200, 1500, "estate", "La fachada de la casa de campo al final de la alameda, con la última luz del día"),
};

export const about = {
  lead: slot("/editorial/about-house.jpg", 1920, 1080, "estate", "La casa de campo donde nació HARTWELL, vista desde el jardín"),
  atelier: slot("/editorial/about-atelier.jpg", 1600, 2000, "atelier", "Sastre marcando con tiza una pieza de lana sobre la mesa de corte"),
  archive: slot("/editorial/about-archive.jpg", 1600, 2000, "library", "Archivo de la Casa con cajas de patrones y libros de muestras"),
};

export const textures = {
  paper: `${A}/textures/paper-grain.png`,
  linen: `${A}/textures/linen.jpg`,
};
