import { useState, useRef } from "react";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  zoomScale?: number;
}

const ImageZoom = ({
  src,
  alt,
  className = "",
  zoomScale = 2.5,
}: ImageZoomProps) => {
  const [isZooming, setIsZooming] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onMouseEnter={() => setIsZooming(true)}
      onMouseLeave={() => setIsZooming(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200"
        style={{
          transform: isZooming ? `scale(${zoomScale})` : "scale(1)",
          transformOrigin: `${position.x}% ${position.y}%`,
        }}
      />
      {isZooming && (
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
          {Math.round(zoomScale * 100)}% zoom
        </div>
      )}
    </div>
  );
};

export default ImageZoom;
