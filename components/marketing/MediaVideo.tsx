"use client";

import { useEffect, useRef } from "react";

type Props = { src: string; label: string };

/**
 * Looping background footage for a media card.
 *
 * The autoplay attributes are always rendered, so the server and the first
 * client render match; the reduced-motion preference is applied afterwards by
 * pausing the element rather than by rendering different markup.
 */
export default function MediaVideo({ src, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      const video = ref.current;
      if (!video) return;
      if (query.matches) {
        video.pause();
        video.controls = true;
      } else {
        video.controls = false;
        // A rejected play() just means the browser blocked autoplay.
        void video.play().catch(() => {});
      }
    };

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      aria-label={label}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
