"use client";

import { useRef } from "react";

export interface FocalPoint {
  focalX: number;
  focalY: number;
  zoom: number;
}

export const DEFAULT_FOCAL: FocalPoint = { focalX: 50, focalY: 50, zoom: 1 };

interface FocalPointEditorProps {
  src: string;
  alt?: string;
  /** CSS aspect-ratio of the target usage, e.g. "1/1", "3/4", "16/9". */
  aspectRatio?: string;
  value: FocalPoint;
  onChange: (next: FocalPoint) => void;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const roundZoom = (n: number) => Math.round(clamp(n, 1, 3) * 20) / 20;

/**
 * Reusable focal-point + zoom picker (Block F). Drag or arrow-nudge to move
 * the focal point, slider or mouse wheel to zoom — all local state, nothing
 * is persisted until the parent form's own Save button is used. No
 * re-cropping: this only ever produces { focalX, focalY, zoom }, rendered the
 * same way the public PositionedImage component does, so the preview here
 * matches the live site exactly.
 */
export default function FocalPointEditor({
  src,
  alt = "",
  aspectRatio = "4 / 3",
  value,
  onChange,
}: FocalPointEditorProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pointFromEvent = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box) return null;
    const rect = box.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  const setFocal = (x: number, y: number) => {
    onChange({ ...value, focalX: clamp(x, 0, 100), focalY: clamp(y, 0, 100) });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    const p = pointFromEvent(e.clientX, e.clientY);
    if (p) setFocal(p.x, p.y);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const p = pointFromEvent(e.clientX, e.clientY);
    if (p) setFocal(p.x, p.y);
  };
  const stopDragging = () => {
    dragging.current = false;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    onChange({ ...value, zoom: roundZoom(value.zoom + (e.deltaY > 0 ? -0.1 : 0.1)) });
  };

  const nudge = (dx: number, dy: number) => setFocal(value.focalX + dx, value.focalY + dy);
  const reset = () => onChange({ ...DEFAULT_FOCAL });

  return (
    <div className="a-focal">
      <div
        ref={boxRef}
        className="a-focal-box"
        style={{ aspectRatio }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
        onWheel={onWheel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="a-focal-img"
          style={{
            objectPosition: `${value.focalX}% ${value.focalY}%`,
            transform: `scale(${value.zoom})`,
            transformOrigin: `${value.focalX}% ${value.focalY}%`,
          }}
        />
        <div
          className="a-focal-crosshair"
          style={{ left: `${value.focalX}%`, top: `${value.focalY}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="a-focal-controls">
        <div className="a-focal-arrows" role="group" aria-label="Bildausschnitt verschieben">
          <span />
          <button type="button" className="a-focal-arrow" onClick={() => nudge(0, -3)} aria-label="Nach oben verschieben">
            ↑
          </button>
          <span />
          <button type="button" className="a-focal-arrow" onClick={() => nudge(-3, 0)} aria-label="Nach links verschieben">
            ←
          </button>
          <button type="button" className="a-focal-arrow a-focal-arrow-center" onClick={reset} aria-label="Zentrieren, Zoom zurücksetzen">
            ⊙
          </button>
          <button type="button" className="a-focal-arrow" onClick={() => nudge(3, 0)} aria-label="Nach rechts verschieben">
            →
          </button>
          <span />
          <button type="button" className="a-focal-arrow" onClick={() => nudge(0, 3)} aria-label="Nach unten verschieben">
            ↓
          </button>
          <span />
        </div>

        <label className="a-focal-zoom">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={value.zoom}
            onChange={(e) => onChange({ ...value, zoom: Number(e.target.value) })}
          />
          <span className="a-focal-zoom-value">{value.zoom.toFixed(2)}×</span>
        </label>
      </div>
    </div>
  );
}
