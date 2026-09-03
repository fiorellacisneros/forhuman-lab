import { CSSProperties } from "react";

export function Loader({ size = 28, style }: { size?: number; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/superhuman/beachball.svg"
      width={size}
      height={size}
      alt="Cargando"
      style={{ animation: "shs-spin 0.85s linear infinite", ...style }}
    />
  );
}
