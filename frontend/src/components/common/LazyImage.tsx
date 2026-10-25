import { useState } from "react";

interface LazyImageProps {
  /** Image URL */
  src: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Fallback shown while loading and on error */
  fallback?: string;
  /** Extra classes applied to the <img> element */
  className?: string;
  /** Extra classes applied to the wrapper <div> */
  wrapperClassName?: string;
  /** Explicit pixel width — helps the browser reserve layout space */
  width?: number;
  /** Explicit pixel height — helps the browser reserve layout space */
  height?: number;
  /** Tailwind aspect-ratio class, e.g. "aspect-square" or "aspect-video".
   *  When provided a sized wrapper is rendered so the layout never shifts. */
  aspect?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * Drop-in replacement for <img> that:
 *  • sets loading="lazy" and decoding="async" automatically
 *  • shows a grey skeleton while the image loads
 *  • falls back to a placeholder on error
 *  • optionally reserves layout space with an aspect-ratio wrapper
 */
const LazyImage = ({
  src,
  alt,
  fallback = "/placeholder.png",
  className = "",
  wrapperClassName = "",
  width,
  height,
  aspect,
  onClick,
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const imgSrc = errored ? fallback : src;

  const img = (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (!errored) setErrored(true); // prevent infinite loop if fallback also fails
      }}
      className={[
        "transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );

  if (!aspect) return img;

  return (
    <div
      className={[
        "relative overflow-hidden",
        aspect,
        // skeleton background visible until the image loads
        !loaded && !errored ? "bg-gray-200 dark:bg-gray-700 animate-pulse" : "",
        wrapperClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {img}
      </div>
    </div>
  );
};

export default LazyImage;
