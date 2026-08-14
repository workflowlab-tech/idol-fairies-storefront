"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-fairy-pink-50">
        <Image src={images[active]} alt={alt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" priority />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                active === index ? "border-fairy-pink-500" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={image} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
