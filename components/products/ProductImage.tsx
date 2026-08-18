"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackSrc: string;
};

/** Uses a verified product URL first, then an honest category placeholder if it fails. */
export default function ProductImage({ src, fallbackSrc, alt, ...props }: ProductImageProps) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const [loadedSources, setLoadedSources] = useState<string[]>([]);
  const displaySrc = failedSources.includes(src) ? fallbackSrc : src;
  const loaded = loadedSources.includes(displaySrc);

  return (
    <Image
      {...props}
      src={displaySrc}
      alt={alt}
      className={`${props.className ?? ""} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      onLoad={() => {
        setLoadedSources((current) =>
          current.includes(displaySrc) ? current : [...current, displaySrc]
        );
      }}
      onError={() => {
        if (displaySrc === fallbackSrc) return;
        setFailedSources((current) =>
          current.includes(src) ? current : [...current, src]
        );
      }}
    />
  );
}
