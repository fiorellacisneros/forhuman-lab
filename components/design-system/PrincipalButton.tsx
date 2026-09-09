import { ButtonHTMLAttributes, CSSProperties, useEffect, useRef, useState } from "react";

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

// Cursor-following glow: a soft halo plus a bright ring that traces the
// button's border, both centered on the pointer. Ported from a Webflow/GSAP
// snippet into this project's own dynamic-gsap-import convention (see
// GsapCardsReveal) instead of loading GSAP from a CDN.
const GLOW_CFG = {
  haloAlpha: 0.18,
  ringAlpha: 0.9,
  ringRadius: 70,
  followX: 0.28,
  followY: 0.1,
  follow: 0.35,
  inDur: 0.4,
  outDur: 0.4,
};

function useGlowHover(ref: React.RefObject<HTMLButtonElement | null>, haloColor: string) {
  const haloRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = ref.current;
    const halo = haloRef.current;
    const ring = ringRef.current;
    if (!btn || !halo || !ring) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let cleanup = () => {};

    import("gsap").then(({ gsap }) => {
      if (cancelled) return;

      gsap.set(halo, { xPercent: -50, yPercent: -50, scale: reduce ? 1 : 0.5, opacity: 0 });
      gsap.set(ring, { opacity: 0 });

      let mx = 50;
      let my = 50;
      const paintRing = () => {
        ring.style.backgroundImage =
          `radial-gradient(${GLOW_CFG.ringRadius}px circle at ${mx}% ${my}%,` +
          `rgba(${haloColor},${GLOW_CFG.ringAlpha}),` +
          `rgba(${haloColor},${(GLOW_CFG.ringAlpha * 0.28).toFixed(3)}) 32%,transparent 62%)`;
      };
      paintRing();

      let qx: ((v: number) => void) | undefined;
      let qy: ((v: number) => void) | undefined;

      const onPointerMove = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        qx?.((nx - 0.5) * 2 * btn.offsetWidth * GLOW_CFG.followX);
        qy?.((ny - 0.5) * 2 * btn.offsetHeight * GLOW_CFG.followY);
        mx = nx * 100;
        my = ny * 100;
        paintRing();
      };

      if (!reduce) {
        qx = gsap.quickTo(halo, "x", { duration: GLOW_CFG.follow, ease: "power3" });
        qy = gsap.quickTo(halo, "y", { duration: GLOW_CFG.follow, ease: "power3" });
        btn.addEventListener("pointermove", onPointerMove);
      }

      const onEnter = () => {
        gsap.to(ring, { opacity: 1, duration: reduce ? 0.15 : GLOW_CFG.inDur, ease: "power2.out", overwrite: "auto" });
        gsap.to(halo, { opacity: GLOW_CFG.haloAlpha, duration: reduce ? 0.15 : GLOW_CFG.inDur, ease: "power2.out", overwrite: "auto" });
        if (!reduce) gsap.to(halo, { scale: 1, duration: GLOW_CFG.inDur, ease: "power2.out", overwrite: "auto" });
      };
      const onLeave = () => {
        gsap.to([ring, halo], { opacity: 0, duration: reduce ? 0.15 : GLOW_CFG.outDur, ease: "power2.out", overwrite: "auto" });
        if (!reduce) {
          gsap.to(halo, { scale: 0.5, duration: GLOW_CFG.outDur, ease: "power2.out", overwrite: "auto" });
          qx?.(0);
          qy?.(0);
        }
      };

      btn.addEventListener("pointerenter", onEnter);
      btn.addEventListener("pointerleave", onLeave);

      cleanup = () => {
        btn.removeEventListener("pointermove", onPointerMove);
        btn.removeEventListener("pointerenter", onEnter);
        btn.removeEventListener("pointerleave", onLeave);
        gsap.killTweensOf([halo, ring]);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [ref, haloColor]);

  return { haloRef, ringRef };
}

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
  const haloColor = variant === "light" ? "0,0,0" : "255,255,255";
  const { haloRef, ringRef } = useGlowHover(ref, haloColor);
  const base: CSSProperties = {
    position: "relative",
    overflow: "hidden",
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
      <span
        ref={haloRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "140%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: `radial-gradient(closest-side, rgba(${haloColor},0.9), transparent 70%)`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <span
        ref={ringRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
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
              position: "relative",
            }}
          />
          <span style={{ position: "relative" }}>{children}</span>
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
              position: "relative",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
              <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
            </svg>
          </span>
        </>
      ) : (
        <span style={{ position: "relative" }}>{children}</span>
      )}
    </button>
  );
}
