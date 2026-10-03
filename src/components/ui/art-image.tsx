import { getImageProps } from "next/image";
import type { MediaSlot } from "@/content/media";

/**
 * Dirección de arte: un recorte para desktop y otro para mobile (no un desktop achicado).
 * Rellena su contenedor (position: relative) como un <Image fill>.
 */
export function ArtImage({
  desktop,
  mobile,
  alt,
  priority = false,
  breakpoint = 768,
  className = "",
}: {
  desktop: MediaSlot;
  mobile: MediaSlot;
  alt: string;
  priority?: boolean;
  breakpoint?: number;
  className?: string;
}) {
  const common = { alt, sizes: "100vw", fill: true, quality: 75 } as const;
  const {
    props: { srcSet: desktopSet },
  } = getImageProps({ ...common, src: desktop.src });
  const {
    props: { srcSet: mobileSet, ...rest },
  } = getImageProps({ ...common, src: mobile.src, loading: priority ? "eager" : "lazy", fetchPriority: priority ? "high" : "auto" });
  return (
    <picture>
      <source media={`(min-width: ${breakpoint}px)`} srcSet={desktopSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...rest} srcSet={mobileSet} className={`object-cover ${className}`} />
    </picture>
  );
}
