import { CSSProperties } from "react";

export function Skeleton({ height, style }: { height: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 12,
        background: "rgba(255,255,255,0.06)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          animation: "shs-shimmer 1.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}
