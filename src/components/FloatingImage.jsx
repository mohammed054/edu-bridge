import { useMemo, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function FloatingImage({ backgroundSrc, floatingSrc }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const backgroundStyle = useMemo(
    () => ({
      transform: `translate3d(${offset.x * -8}px, ${offset.y * -8}px, 0) scale(1.02)`,
      transition: 'transform 180ms ease-out',
    }),
    [offset.x, offset.y]
  );

  const floatingStyle = useMemo(
    () => ({
      transform: `translate3d(${offset.x * 12}px, ${offset.y * 12}px, 0) scale(1.03)`,
      transition: 'transform 160ms ease-out',
    }),
    [offset.x, offset.y]
  );

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const nextY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    setOffset({
      x: clamp(nextX, -0.8, 0.8),
      y: clamp(nextY, -0.8, 0.8),
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      className="absolute inset-0 overflow-hidden"
    >
      <img
        src={backgroundSrc}
        alt=""
        aria-hidden="true"
        style={backgroundStyle}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={floatingSrc}
        alt=""
        aria-hidden="true"
        style={floatingStyle}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

