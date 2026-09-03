import { CSSProperties, ReactNode } from "react";

export function Tag({
  children = "Disponible",
  variant = "primary",
  style,
}: {
  children?: ReactNode;
  variant?: "primary" | "inverse";
  style?: CSSProperties;
}) {
  const bg = variant === "primary" ? "var(--blue-light)" : "rgba(255,255,255,0.15)";
  const color = variant === "primary" ? "var(--blue)" : "var(--white)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "6px 16px",
        borderRadius: "var(--radius-sm)",
        background: bg,
        color,
        font: "500 12px/1.3 'Work Sans',sans-serif",
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
