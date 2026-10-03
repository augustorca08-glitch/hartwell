import { existsSync } from "node:fs";
import path from "node:path";
import { Hero } from "@/components/home/hero";
import { NewCollection } from "@/components/home/new-collection";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { CategoryIndex } from "@/components/home/category-index";
import { HeritageLetter } from "@/components/home/heritage-letter";
import { EditorialSpread } from "@/components/home/editorial-spread";
import { LookbookRail } from "@/components/home/lookbook-rail";
import { Essentials } from "@/components/home/essentials";
import { FinalCta } from "@/components/home/final-cta";

/**
 * El hero detecta si existe /public/videos/hero.mp4.
 * En desarrollo se evalúa en cada request: alcanza con copiar el archivo y recargar.
 * En producción se evalúa en el build.
 */
function publicFileExists(p: string) {
  return existsSync(path.join(process.cwd(), "public", p));
}

export default function Home() {
  const hasVideo = publicFileExists("videos/hero.mp4");
  const hasMobileVideo = publicFileExists("videos/hero-mobile.mp4");
  return (
    <>
      <Hero hasVideo={hasVideo} hasMobileVideo={hasMobileVideo} />
      <NewCollection />
      <FeaturedCollection />
      <CategoryIndex />
      <HeritageLetter />
      <EditorialSpread />
      <LookbookRail />
      <Essentials />
      <FinalCta />
    </>
  );
}
