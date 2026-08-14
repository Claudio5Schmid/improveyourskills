import type { ImgHTMLAttributes } from "react";

export interface PositionedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  src: string;
  alt: string;
  /** 0–100, percent from the left. Defaults to 50 (center) if unset. */
  focalX?: number | null;
  /** 0–100, percent from the top. Defaults to 50 (center) if unset. */
  focalY?: number | null;
  /** 1.0–3.0. Defaults to 1 (no zoom) if unset. */
  zoom?: number | null;
}

/**
 * Drop-in replacement for a plain <img> wherever the parent already provides
 * a sized, overflow-hidden container (every existing image wrap on this site
 * already does — .photo, .imgWrap, .sliderWrap, .item, etc.). Renders the
 * stored focal point and zoom via object-position + a matching-origin
 * transform: scale() — no re-cropping, the source file never changes. Any
 * other <img> prop (width, height, loading, draggable, …) passes straight
 * through.
 */
export default function PositionedImage({ src, alt, focalX, focalY, zoom, style, ...rest }: PositionedImageProps) {
  const fx = focalX ?? 50;
  const fy = focalY ?? 50;
  const z = zoom ?? 1;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      {...rest}
      style={{
        ...style,
        objectPosition: `${fx}% ${fy}%`,
        transform: z !== 1 ? `scale(${z})` : undefined,
        transformOrigin: `${fx}% ${fy}%`,
      }}
    />
  );
}
