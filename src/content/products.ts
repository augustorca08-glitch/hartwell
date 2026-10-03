/**
 * Catálogo de HARTWELL (mock).
 *
 * Imágenes de producto:
 *   /public/assets/hartwell/products/{slug}/{colorId}-{n}.jpg   (4:5, 1600×2000)
 *   n = 1 frente · 2 espalda · 3 detalle de tela
 * Para reemplazar un placeholder, sobrescribí el archivo con el mismo nombre.
 * El stock es mock: tacha talles agotados y muestra "Quedan N".
 */

export type CategoryId = "shirts" | "polo" | "knitwear" | "trousers" | "outerwear" | "accessories";

export type Category = {
  id: CategoryId;
  label: string;
  /** Línea editorial de la categoría (voz de marca, en inglés) */
  tagline: string;
};

export const categories: Category[] = [
  { id: "shirts", label: "Shirts", tagline: "Oxford cloth, poplin and washed linen" },
  { id: "polo", label: "Polo", tagline: "Piqué knitted for the club lawn" },
  { id: "knitwear", label: "Knitwear", tagline: "Merino, lambswool and cashmere" },
  { id: "trousers", label: "Trousers", tagline: "Pleated, pressed, never stiff" },
  { id: "outerwear", label: "Outerwear", tagline: "Blazers and coats cut to last" },
  { id: "accessories", label: "Accessories", tagline: "Leather, silk and the finishing touch" },
];

export type ProductColor = { id: string; name: string; hex: string };

/** Define la tabla de la guía de talles */
export type SizeKind = "tops" | "tailoring" | "trousers" | "belt" | "one";

export type Product = {
  slug: string;
  /** Número de archivo de la pieza */
  ref: string;
  name: string;
  category: CategoryId;
  price: number;
  summary: string;
  description: string;
  /** Composición de la tela */
  cloth: string;
  /** Dónde se teje o se confecciona */
  origin: string;
  fit: string;
  /** Para qué ocasión fue pensada */
  occasion: string;
  care: string;
  colors: ProductColor[];
  sizes: string[];
  sizeKind: SizeKind;
  /** stock[colorId][size] */
  stock: Record<string, Record<string, number>>;
  tags: ("new" | "collection" | "featured" | "clubhouse")[];
};

const TOPS = ["XS", "S", "M", "L", "XL"];
const TAILORING = ["46", "48", "50", "52", "54"];
const TROUSERS = ["44", "46", "48", "50", "52"];
const BELT = ["80", "85", "90", "95", "100"];
export const ONE_SIZE = "Única";

const C = {
  chalk: { id: "chalk", name: "Chalk", hex: "#F1EEE6" },
  ecru: { id: "ecru", name: "Ecru", hex: "#E6DCC6" },
  cream: { id: "cream", name: "Cream", hex: "#EADFC8" },
  oxford: { id: "oxford", name: "Oxford Blue", hex: "#A8BBCF" },
  riviera: { id: "riviera", name: "Riviera Blue", hex: "#7C9BB4" },
  navy: { id: "navy", name: "Navy", hex: "#1E2B44" },
  forest: { id: "forest", name: "Forest", hex: "#2A4334" },
  oxblood: { id: "oxblood", name: "Oxblood", hex: "#5C2128" },
  camel: { id: "camel", name: "Camel", hex: "#B48F5E" },
  stone: { id: "stone", name: "Stone", hex: "#B9AF9B" },
  sand: { id: "sand", name: "Sand", hex: "#D6C6A6" },
  charcoal: { id: "charcoal", name: "Charcoal", hex: "#3C3E42" },
  loden: { id: "loden", name: "Loden", hex: "#59614A" },
  chestnut: { id: "chestnut", name: "Chestnut", hex: "#6E4631" },
  espresso: { id: "espresso", name: "Espresso", hex: "#3A2A21" },
} satisfies Record<string, ProductColor>;

/** Stock mock determinístico, con algunos talles agotados o bajos. */
function stockFor(colors: ProductColor[], sizes: string[], soldOut: string[] = [], low: string[] = []) {
  const out: Record<string, Record<string, number>> = {};
  colors.forEach((c, ci) => {
    out[c.id] = {};
    sizes.forEach((s, si) => {
      const key = `${c.id}:${s}`;
      out[c.id][s] = soldOut.includes(key) ? 0 : low.includes(key) ? 2 : 5 + ((ci * 3 + si * 5) % 8);
    });
  });
  return out;
}

function piece(p: Omit<Product, "stock"> & { soldOut?: string[]; low?: string[] }): Product {
  const { soldOut, low, ...rest } = p;
  return { ...rest, stock: stockFor(p.colors, p.sizes, soldOut, low) };
}

export const products: Product[] = [
  piece({
    slug: "hartwell-signature-oxford",
    ref: "001",
    name: "Hartwell Signature Oxford",
    category: "shirts",
    price: 145,
    summary: "La camisa sobre la que se construye el guardarropa. Oxford de algodón y cuello button-down.",
    description:
      "Tejido oxford de hilo doble que se suaviza con cada lavado. Cuello button-down con la curva justa, canesú partido en la espalda y botones de nácar cosidos a mano.",
    cloth: "100% algodón oxford, hilado doble.",
    origin: "Tejida en Biella, confeccionada en Portugal.",
    fit: "Clásico, con holgura en el pecho y largo para llevar dentro.",
    occasion: "La oficina, el almuerzo del domingo, el viaje en tren.",
    care: "Lavar a 30 °C. Planchar húmeda, del revés.",
    colors: [C.oxford, C.chalk, C.ecru],
    sizes: TOPS,
    sizeKind: "tops",
    soldOut: ["chalk:XS"],
    low: ["oxford:M"],
    tags: ["new", "featured", "collection"],
  }),
  piece({
    slug: "regatta-linen-shirt",
    ref: "002",
    name: "Regatta Linen Shirt",
    category: "shirts",
    price: 165,
    summary: "Lino irlandés lavado, cuello abierto y una caída que se mueve con la brisa.",
    description:
      "Lino de fibra larga, lavado en piedra para que llegue suave desde el primer día. Cuello de solapa abierta, bolsillo de parche y mangas pensadas para arremangarse.",
    cloth: "100% lino irlandés, 160 g/m².",
    origin: "Lino de Irlanda del Norte, confeccionada en Italia.",
    fit: "Relajado, apenas amplio en el cuerpo.",
    occasion: "La regata del sábado y la cena frente al puerto.",
    care: "Lavar a 30 °C. Secar a la sombra; el lino se plancha húmedo.",
    colors: [C.chalk, C.riviera],
    sizes: TOPS,
    sizeKind: "tops",
    soldOut: ["riviera:XL"],
    low: ["chalk:L"],
    tags: ["new", "collection", "featured"],
  }),
  piece({
    slug: "belvedere-poplin-shirt",
    ref: "003",
    name: "Belvedere Poplin Shirt",
    category: "shirts",
    price: 135,
    summary: "Popelina de algodón egipcio, cuello semi-abierto y puños redondeados.",
    description: "Una camisa de vestir que no se siente de vestir. Popelina compacta con brillo apenas perceptible y cuello que mantiene la forma sin corbata.",
    cloth: "100% algodón egipcio de fibra extra larga.",
    origin: "Confeccionada en Portugal.",
    fit: "Entallado, sin pinzas en la espalda.",
    occasion: "Bajo un blazer o sola, con el cuello abierto.",
    care: "Lavar a 40 °C. Planchar a temperatura media.",
    colors: [C.chalk, C.oxford],
    sizes: TOPS,
    sizeKind: "tops",
    tags: [],
  }),
  piece({
    slug: "hartwell-classic-polo",
    ref: "004",
    name: "Hartwell Classic Polo",
    category: "polo",
    price: 110,
    summary: "Piqué de algodón con el monograma bordado en tono sobre tono.",
    description:
      "El polo de la Casa. Piqué de algodón de doble hilo, cuello de punto que no se enrolla y aberturas laterales con el largo de atrás apenas mayor.",
    cloth: "100% algodón piqué, 220 g/m².",
    origin: "Tejido y confeccionado en Portugal.",
    fit: "Clásico, manga a mitad del brazo.",
    occasion: "El club, la cancha y la sobremesa larga.",
    care: "Lavar a 30 °C del revés. No usar secadora.",
    colors: [C.navy, C.chalk, C.forest],
    sizes: TOPS,
    sizeKind: "tops",
    soldOut: ["forest:XS"],
    low: ["navy:L"],
    tags: ["featured", "collection", "clubhouse"],
  }),
  piece({
    slug: "clubhouse-knitted-polo",
    ref: "005",
    name: "Clubhouse Knitted Polo",
    category: "polo",
    price: 155,
    summary: "Polo de punto de algodón con cuello abierto, tejido en galga fina.",
    description: "Un punto liviano con textura de canalé en cuello y puños. Funciona solo en verano y bajo un blazer cuando baja el sol.",
    cloth: "100% algodón de Egipto, punto galga 14.",
    origin: "Tejido en Escocia.",
    fit: "Recto, levemente corto para llevar fuera.",
    occasion: "Tenis por la mañana, terraza por la tarde.",
    care: "Lavar a mano en frío. Secar en plano.",
    colors: [C.cream, C.navy],
    sizes: TOPS,
    sizeKind: "tops",
    low: ["cream:S"],
    tags: ["new", "clubhouse"],
  }),
  piece({
    slug: "heritage-cable-sweater",
    ref: "006",
    name: "Heritage Cable Sweater",
    category: "knitwear",
    price: 245,
    summary: "Ochos tradicionales en lana merino, tejidos con la densidad de antes.",
    description:
      "Un sweater de trenzas que conserva la forma durante décadas. Merino extrafino, cuello redondo con canalé doble y bajo que no se abre.",
    cloth: "100% lana merino extrafina, 19,5 micras.",
    origin: "Tejido en los Scottish Borders.",
    fit: "Regular, hombro natural.",
    occasion: "Las mañanas frescas en el campo y las noches en la costa.",
    care: "Lavar a mano en frío. Secar en plano, lejos del sol.",
    colors: [C.cream, C.forest],
    sizes: TOPS,
    sizeKind: "tops",
    soldOut: ["forest:XL"],
    tags: ["new", "featured", "collection", "clubhouse"],
  }),
  piece({
    slug: "cashmere-crewneck",
    ref: "007",
    name: "Cashmere Crewneck",
    category: "knitwear",
    price: 395,
    summary: "Cashmere mongol de dos cabos. La pieza que se hereda.",
    description: "Hilado de dos cabos para que el cashmere no haga bolitas ni pierda cuerpo. Cuello redondo bajo, ideal sobre una camisa abierta.",
    cloth: "100% cashmere, dos cabos.",
    origin: "Hilado en Italia, tejido en Escocia.",
    fit: "Regular, largo a la cadera.",
    occasion: "Viajes largos, cenas tranquilas, todo el invierno.",
    care: "Lavar a mano con jabón neutro. Guardar doblado.",
    colors: [C.camel, C.navy, C.oxblood],
    sizes: TOPS,
    sizeKind: "tops",
    low: ["camel:M", "oxblood:S"],
    tags: ["featured"],
  }),
  piece({
    slug: "cricket-cable-vest",
    ref: "008",
    name: "Cricket Cable Vest",
    category: "knitwear",
    price: 185,
    summary: "Chaleco de punto con escote en V y ribete en contraste.",
    description: "El chaleco de los clubes de cricket, reinterpretado en algodón y lana. Escote en V profundo con doble línea en contraste.",
    cloth: "70% algodón, 30% lana merino.",
    origin: "Tejido en Escocia.",
    fit: "Recto, para usar sobre camisa.",
    occasion: "Sobre una oxford en los días de entretiempo.",
    care: "Lavar a mano en frío. Secar en plano.",
    colors: [C.cream, C.navy],
    sizes: TOPS,
    sizeKind: "tops",
    tags: ["collection", "clubhouse"],
  }),
  piece({
    slug: "country-chino-trouser",
    ref: "009",
    name: "Country Chino Trouser",
    category: "trousers",
    price: 165,
    summary: "Gabardina de algodón con una pinza y bajo con vuelta.",
    description:
      "Un chino con la construcción de un pantalón de sastre: cintura con extensión, una pinza adelante y bajo con vuelta de cuatro centímetros.",
    cloth: "98% algodón gabardina, 2% elastano.",
    origin: "Confeccionado en Italia.",
    fit: "Recto, tiro medio-alto.",
    occasion: "Del campo a la ciudad sin cambiarse.",
    care: "Lavar a 30 °C del revés. Planchar con raya.",
    colors: [C.stone, C.navy, C.loden],
    sizes: TROUSERS,
    sizeKind: "trousers",
    soldOut: ["navy:44"],
    low: ["stone:48"],
    tags: ["featured", "collection"],
  }),
  piece({
    slug: "riviera-linen-trouser",
    ref: "010",
    name: "Riviera Linen Trouser",
    category: "trousers",
    price: 175,
    summary: "Lino con cintura de cordón y dos pinzas para que caiga amplio.",
    description: "Pensado para el calor del sur de Europa. Cintura con cordón interno y presillas, dos pinzas y pierna amplia que no marca.",
    cloth: "100% lino, 220 g/m².",
    origin: "Confeccionado en Italia.",
    fit: "Amplio, tiro alto.",
    occasion: "Almuerzos largos frente al mar.",
    care: "Lavar a 30 °C. Planchar húmedo.",
    colors: [C.sand, C.chalk],
    sizes: TROUSERS,
    sizeKind: "trousers",
    soldOut: ["chalk:52"],
    tags: ["new", "collection", "featured"],
  }),
  piece({
    slug: "pleated-flannel-trouser",
    ref: "011",
    name: "Pleated Flannel Trouser",
    category: "trousers",
    price: 225,
    summary: "Franela de lana peinada con doble pinza y ajustadores laterales.",
    description: "La franela gris de siempre. Ajustadores laterales en lugar de presillas, doble pinza invertida y bajo con vuelta.",
    cloth: "100% lana peinada, franela 320 g/m².",
    origin: "Tejida en Yorkshire, confeccionada en Italia.",
    fit: "Recto, tiro alto.",
    occasion: "Con blazer o con un sweater de cuello alto.",
    care: "Limpieza en seco. Cepillar después de usar.",
    colors: [C.charcoal, C.stone],
    sizes: TROUSERS,
    sizeKind: "trousers",
    tags: [],
  }),
  piece({
    slug: "hartwell-wool-blazer",
    ref: "012",
    name: "Hartwell Wool Blazer",
    category: "outerwear",
    price: 595,
    summary: "Blazer cruzado de sarga de lana, con botones de bronce grabados.",
    description:
      "Medio entretelado, hombro natural y solapa de pico. Los botones de bronce llevan el monograma grabado y se cosen a mano con pie de hilo.",
    cloth: "100% lana, sarga 280 g/m². Forro de cupro.",
    origin: "Tejido en Biella, confeccionado a medio entretelado en Italia.",
    fit: "Entallado sin rigidez, largo clásico.",
    occasion: "Del almuerzo en el club a la cena de gala.",
    care: "Limpieza en seco. Colgar en percha ancha.",
    colors: [C.navy, C.forest],
    sizes: TAILORING,
    sizeKind: "tailoring",
    soldOut: ["forest:46"],
    low: ["navy:50"],
    tags: ["featured", "collection"],
  }),
  piece({
    slug: "estate-field-jacket",
    ref: "013",
    name: "Estate Field Jacket",
    category: "outerwear",
    price: 445,
    summary: "Chaqueta de campo en algodón encerado, cuello de pana.",
    description: "Algodón encerado que repele la llovizna, cuello de pana y cuatro bolsillos de fuelle. Envejece mejor que cualquier otra pieza del guardarropa.",
    cloth: "100% algodón encerado. Cuello de pana.",
    origin: "Confeccionada en Inglaterra.",
    fit: "Regular, con lugar para un sweater debajo.",
    occasion: "Caminatas por la finca y mañanas de caza fotográfica.",
    care: "No lavar. Limpiar con un paño húmedo y reencerar cada temporada.",
    colors: [C.loden, C.chestnut],
    sizes: TOPS,
    sizeKind: "tops",
    low: ["loden:M"],
    tags: ["new"],
  }),
  piece({
    slug: "thornbury-camel-coat",
    ref: "014",
    name: "Thornbury Camel Coat",
    category: "outerwear",
    price: 695,
    summary: "Polo coat de pelo de camello, cruzado y con cinturón trasero.",
    description: "El abrigo clásico de los partidos de invierno. Pelo de camello con lana, cruzado de seis botones, bolsillos de parche y medio cinturón en la espalda.",
    cloth: "70% lana, 30% pelo de camello.",
    origin: "Tejido en Italia, confeccionado en Inglaterra.",
    fit: "Amplio, largo bajo la rodilla.",
    occasion: "Los domingos de invierno, de la cancha a la ciudad.",
    care: "Limpieza en seco. Cepillar en el sentido del pelo.",
    colors: [C.camel, C.charcoal],
    sizes: TAILORING,
    sizeKind: "tailoring",
    soldOut: ["charcoal:54"],
    tags: [],
  }),
  piece({
    slug: "classic-leather-belt",
    ref: "015",
    name: "Classic Leather Belt",
    category: "accessories",
    price: 125,
    summary: "Cuero de curtido vegetal con hebilla de bronce macizo.",
    description: "Un cinturón que toma la forma de quien lo usa. Cuero de curtido vegetal cortado de una sola pieza y hebilla de bronce que se oscurece con el tiempo.",
    cloth: "Cuero vacuno de curtido vegetal, 3,5 mm. Hebilla de bronce.",
    origin: "Hecho a mano en Inglaterra.",
    fit: "3 cm de ancho. Elegir el talle de pantalón + 5.",
    occasion: "Con chinos, franela o lino.",
    care: "Nutrir con crema de cuero dos veces al año.",
    colors: [C.chestnut, C.espresso],
    sizes: BELT,
    sizeKind: "belt",
    soldOut: ["espresso:80"],
    tags: ["featured"],
  }),
  piece({
    slug: "hartwell-cap",
    ref: "016",
    name: "Hartwell Cap",
    category: "accessories",
    price: 75,
    summary: "Gorra de seis paneles en sarga lavada con el monograma bordado.",
    description: "Visera curva, cierre de cuero con hebilla de bronce y el monograma HW bordado al frente, en tono sobre tono.",
    cloth: "100% algodón sarga lavada. Cierre de cuero.",
    origin: "Confeccionada en Portugal.",
    fit: "Talle único, ajustable.",
    occasion: "El club, el barco y el camino de vuelta.",
    care: "Limpiar a mano con agua fría.",
    colors: [C.navy, C.cream, C.forest],
    sizes: [ONE_SIZE],
    sizeKind: "one",
    tags: ["new", "clubhouse"],
  }),
  piece({
    slug: "riviera-silk-scarf",
    ref: "017",
    name: "Riviera Silk Scarf",
    category: "accessories",
    price: 145,
    summary: "Seda estampada con un motivo de banderines náuticos.",
    description: "Un pañuelo de seda twill con bordes enrollados a mano. Se anuda al cuello, se lleva en el bolsillo o en la correa de un bolso.",
    cloth: "100% seda twill, 90 × 90 cm.",
    origin: "Estampado y terminado a mano en Como.",
    fit: "Talle único.",
    occasion: "Una tarde de viento en la costa.",
    care: "Limpieza en seco.",
    colors: [C.oxblood, C.navy],
    sizes: [ONE_SIZE],
    sizeKind: "one",
    tags: ["collection"],
  }),
];

export const IMAGES_PER_COLOR = 3;

export function productImage(slug: string, colorId: string, n: number) {
  return `/assets/hartwell/products/${slug}/${colorId}-${n}.jpg`;
}

export function productImages(p: Product, colorId: string) {
  return Array.from({ length: IMAGES_PER_COLOR }, (_, i) => productImage(p.slug, colorId, i + 1));
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(id: string) {
  return categories.find((c) => c.id === id);
}

export function productsByCategory(id: CategoryId) {
  return products.filter((p) => p.category === id);
}

export function stockOf(p: Product, colorId: string, size: string) {
  return p.stock[colorId]?.[size] ?? 0;
}

export function isSoldOut(p: Product) {
  return Object.values(p.stock).every((sizes) => Object.values(sizes).every((n) => n === 0));
}

export const isOneSize = (p: Product) => p.sizes.length === 1 && p.sizes[0] === ONE_SIZE;

export function relatedProducts(p: Product, n = 4) {
  const same = products.filter((x) => x.slug !== p.slug && x.category === p.category);
  const rest = products.filter((x) => x.slug !== p.slug && x.category !== p.category && x.tags.includes("featured"));
  return [...same, ...rest].slice(0, n);
}

/** "Completar el conjunto": arriba con abajo, más un accesorio. */
export function completeTheLook(p: Product, n = 2) {
  const tops: CategoryId[] = ["shirts", "polo", "knitwear", "outerwear"];
  const isTop = tops.includes(p.category);
  const pool = products.filter(
    (x) => x.slug !== p.slug && (isTop ? ["trousers", "accessories"] : ["shirts", "polo", "knitwear", "outerwear"]).includes(x.category),
  );
  return pool
    .filter((x) => x.tags.includes("featured"))
    .concat(pool)
    .filter((x, i, a) => a.indexOf(x) === i)
    .slice(0, n);
}
