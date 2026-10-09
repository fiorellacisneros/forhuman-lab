import { CSSProperties } from "react";

export function CardAprendizaje({
  number = "01",
  label = "Módulo",
  title = "Comprender el valor de Webflow",
  body = "Qué es Webflow y cómo utilizarlo para crear sitios web sin código.",
  style,
}: {
  number?: string;
  label?: string;
  title?: string;
  body?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: 380,
        borderRadius: "var(--radius-md)",
        background: "var(--pure-white)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ font: "400 88px/1 'Work Sans',sans-serif", color: "var(--blue)" }}>{number}</span>
        <span style={{ font: "600 16px/1 'Work Sans',sans-serif", color: "var(--black)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ font: "400 28px/1.05 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--black)" }}>
          {title}
        </div>
        <div style={{ font: "300 16px/1.4 'Work Sans',sans-serif", color: "var(--black)" }}>{body}</div>
      </div>
    </div>
  );
}
