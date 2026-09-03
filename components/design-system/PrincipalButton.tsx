import { ButtonHTMLAttributes, CSSProperties, useRef, useState } from "react";

const VARIANTS: Record<string, CSSProperties> = {
  primary: { background: "var(--blue)", color: "var(--white)" },
  dark: { background: "var(--black)", color: "var(--white)" },
  light: { background: "var(--white)", color: "var(--black)" },
  outline: {
    background: "transparent",
    color: "var(--white)",
    boxShadow: "inset 0 0 0 1px var(--white)",
  },
};

export function PrincipalButton({
  variant = "dark",
  children,
  style,
  withArrow = true,
  ...rest
}: {
  variant?: "primary" | "dark" | "light" | "outline";
  children?: React.ReactNode;
  style?: CSSProperties;
  withArrow?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    borderRadius: "var(--radius-full)",
    border: "none",
    cursor: "pointer",
    font: "500 20px/1 'Work Sans',sans-serif",
    whiteSpace: "nowrap",
    transition: "opacity 0.15s ease, transform 0.1s ease",
    ...VARIANTS[variant],
    ...style,
  };
  return (
    <button
      ref={ref}
      className="shs-principal-btn"
      style={base}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        setHover(false);
      }}
      {...rest}
    >
      {withArrow ? (
        <>
          <span
            style={{
              width: hover ? 8 : 0,
              height: hover ? 8 : 0,
              borderRadius: "50%",
              background: "var(--yellow)",
              marginRight: hover ? 10 : 0,
              opacity: hover ? 1 : 0,
              transition:
                "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1), margin 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease",
              flexShrink: 0,
            }}
          />
          <span>{children}</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              overflow: "hidden",
              width: hover ? 0 : 18,
              marginLeft: hover ? 0 : 10,
              opacity: hover ? 0 : 1,
              transition:
                "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), margin 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
              <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
            </svg>
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
