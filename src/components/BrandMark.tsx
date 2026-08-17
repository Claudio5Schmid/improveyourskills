/**
 * The three-bar mark from public/Bilder/favicon.svg (Phase-0 decision #2),
 * reproduced as divs instead of raw `<svg>` so it can be rendered by
 * `next/og`'s `ImageResponse` (Satori), which the favicon/apple-icon/OG-image
 * route files need — Satori renders a limited HTML/CSS subset, not arbitrary
 * SVG. Same shape, same two brand colours, nothing invented: scaled off the
 * original 64×64 viewBox so every consumer stays proportionally identical.
 */
export function BrandMark({ box }: { box: number }) {
  const s = box / 64;
  return (
    <div
      style={{
        width: box,
        height: box,
        background: "#102C26",
        borderRadius: 14 * s,
        display: "flex",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 16 * s,
          top: 15 * s,
          width: 32 * s,
          height: 9 * s,
          borderRadius: 4.5 * s,
          background: "#F7E7CE",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 17.5 * s,
          top: 29 * s,
          width: 21 * s,
          height: 6 * s,
          borderRadius: 3 * s,
          // Half the original stroke-width: SVG centers a stroke on the path
          // (half in, half out), so the visible hollow band inside a
          // border-box div only needs half that width to match — using the
          // full 3 as the CSS border swallowed the whole box (looked solid).
          border: `${1.5 * s}px solid #F7E7CE`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 16 * s,
          top: 40 * s,
          width: 28 * s,
          height: 9 * s,
          borderRadius: 4.5 * s,
          background: "#F7E7CE",
        }}
      />
    </div>
  );
}
