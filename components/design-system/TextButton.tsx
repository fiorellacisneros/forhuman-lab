import { AnchorHTMLAttributes, CSSProperties, ReactNode, useState } from "react";

export function TextButton({
  children,
  style,
  ...rest
}: {
  children?: ReactNode;
  style?: CSSProperties;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const [hover, setHover] = useState(false);
  return (
    <a
      className="shs-text-btn"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        font: "500 20px/1 'Work Sans',sans-serif",
        color: "var(--blue)",
        textDecoration: "none",
        cursor: "pointer",
        width: "fit-content",
        ...style,
      }}
      {...rest}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          {children}
          <span
            style={{
              position: "absolute",
              left: 0,
              bottom: -4,
              display: "block",
              height: 2,
              width: hover ? "100%" : "0%",
              background: "var(--blue)",
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{
            transform: hover ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <path d="M 8.304 0 L 16 8 L 8.304 16 L 6.836 14.474 L 12.026 9.079 L 0 9.079 L 0 6.921 L 12.026 6.921 L 6.836 1.526 L 8.304 0 Z" />
        </svg>
      </span>
    </a>
  );
}
