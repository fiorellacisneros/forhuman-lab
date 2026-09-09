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

// Glow / orbit button effect, ported from a Webflow+GSAP snippet into this
// project's own dynamic-gsap-import convention (see GsapCardsReveal) instead
// of loading GSAP from a CDN:
// - Halo: a soft blurred glow behind the button.
// - Ring: a bright beam traced along the button's border (a radial-gradient
//   clipped to a thin ring via mask-composite, not a filled circle).
// - On hover (mouse): the beam follows the cursor and the halo fades in.
// - Without hover (touch, or below `loopBelow`): the beam orbits the border
//   in an infinite loop instead.
const GLOW_CFG = {
  haloAlpha: 0.18,
  ringAlpha: 0.9,
  ringRadius: 70,
  followX: 0.28,
  followY: 0.1,
  follow: 0.35,
  inDur: 0.4,
  outDur: 0.4,
  orbitDur: 6,
};

const GLOW_BP = { tablet: 991, mobile: 767 };

type LoopAnimation = "off" | "mobile" | "tablet" | "desktop";

function loopScopeActive(mode: LoopAnimation) {
  if (mode === "desktop") return true;
  if (mode === "tablet") return window.innerWidth <= GLOW_BP.tablet;
  if (mode === "mobile") return window.innerWidth <= GLOW_BP.mobile;
  return false;
}

function useGlowHover(ref: React.RefObject<HTMLButtonElement | null>, haloColor: string, loopAnimation: LoopAnimation) {
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
      let qrx: ((v: number) => void) | undefined;
      let qry: ((v: number) => void) | undefined;

      const onPointerMove = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        qx?.((nx - 0.5) * 2 * btn.offsetWidth * GLOW_CFG.followX);
        qy?.((ny - 0.5) * 2 * btn.offsetHeight * GLOW_CFG.followY);
        qrx?.(nx * 100);
        qry?.(ny * 100);
      };

      if (!reduce) {
        qx = gsap.quickTo(halo, "x", { duration: GLOW_CFG.follow, ease: "power3" });
        qy = gsap.quickTo(halo, "y", { duration: GLOW_CFG.follow, ease: "power3" });
        const rp = { x: 50, y: 50 };
        qrx = gsap.quickTo(rp, "x", {
          duration: 0.18,
          ease: "power2",
          onUpdate: () => {
            mx = rp.x;
            paintRing();
          },
        });
        qry = gsap.quickTo(rp, "y", {
          duration: 0.18,
          ease: "power2",
          onUpdate: () => {
            my = rp.y;
            paintRing();
          },
        });
        btn.addEventListener("pointermove", onPointerMove);
      }

      // Idle orbit: the beam travels around the border in a loop when the
      // button isn't hovered, active only at/below the configured breakpoint.
      let orbit: ReturnType<typeof gsap.fromTo> | null = null;
      let hovering = false;
      const op = { t: 0 };
      const applyOrbit = () => {
        const seg = (op.t % 1) * 4;
        if (seg < 1) {
          mx = seg * 100;
          my = 0;
        } else if (seg < 2) {
          mx = 100;
          my = (seg - 1) * 100;
        } else if (seg < 3) {
          mx = 100 - (seg - 2) * 100;
          my = 100;
        } else {
          mx = 0;
          my = 100 - (seg - 3) * 100;
        }
        paintRing();
      };
      const startOrbit = () => {
        if (orbit || hovering || reduce) return;
        gsap.to(ring, { opacity: 1, duration: GLOW_CFG.inDur, ease: "power2.out", overwrite: "auto" });
        orbit = gsap.fromTo(op, { t: 0 }, { t: 1, duration: GLOW_CFG.orbitDur, ease: "none", repeat: -1, onUpdate: applyOrbit });
      };
      const stopOrbit = (fade: boolean) => {
        if (!orbit) return;
        orbit.kill();
        orbit = null;
        if (fade && !hovering) gsap.to(ring, { opacity: 0, duration: GLOW_CFG.outDur, ease: "power2.out", overwrite: "auto" });
      };
      const syncOrbit = () => {
        if (loopScopeActive(loopAnimation)) startOrbit();
        else stopOrbit(true);
      };

      const onEnter = () => {
        hovering = true;
        stopOrbit(false);
        gsap.to(ring, { opacity: 1, duration: reduce ? 0.15 : GLOW_CFG.inDur, ease: "power2.out", overwrite: "auto" });
        gsap.to(halo, { opacity: GLOW_CFG.haloAlpha, duration: reduce ? 0.15 : GLOW_CFG.inDur, ease: "power2.out", overwrite: "auto" });
        if (!reduce) gsap.to(halo, { scale: 1, duration: GLOW_CFG.inDur, ease: "power2.out", overwrite: "auto" });
      };
      const onLeave = () => {
        hovering = false;
        gsap.to([ring, halo], { opacity: 0, duration: reduce ? 0.15 : GLOW_CFG.outDur, ease: "power2.out", overwrite: "auto" });
        if (!reduce) {
          gsap.to(halo, { scale: 0.5, duration: GLOW_CFG.outDur, ease: "power2.out", overwrite: "auto" });
          qx?.(0);
          qy?.(0);
        }
        syncOrbit();
      };

      btn.addEventListener("pointerenter", onEnter);
      btn.addEventListener("pointerleave", onLeave);
      btn.addEventListener("focusin", onEnter);
      btn.addEventListener("focusout", onLeave);
      window.addEventListener("resize", syncOrbit);

      syncOrbit();

      cleanup = () => {
        btn.removeEventListener("pointermove", onPointerMove);
        btn.removeEventListener("pointerenter", onEnter);
        btn.removeEventListener("pointerleave", onLeave);
        btn.removeEventListener("focusin", onEnter);
        btn.removeEventListener("focusout", onLeave);
        window.removeEventListener("resize", syncOrbit);
        orbit?.kill();
        gsap.killTweensOf([halo, ring]);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [ref, haloColor, loopAnimation]);

  return { haloRef, ringRef };
}

export function PrincipalButton({
  variant = "dark",
  loopAnimation = "off",
  children,
  style,
  withArrow = true,
  ...rest
}: {
  variant?: "primary" | "dark" | "light" | "outline";
  /** Below which breakpoint the light beam orbits the border on its own when not hovered ("off" = hover-only, the classic behavior). */
  loopAnimation?: LoopAnimation;
  children?: React.ReactNode;
  style?: CSSProperties;
  withArrow?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const haloColor = variant === "light" ? "0,0,0" : "255,255,255";
  // Screen blend only ever lightens, so a black glow (on the light/white
  // variant) needs multiply instead, or it would be invisible.
  const blendMode = variant === "light" ? "multiply" : "screen";
  const { haloRef, ringRef } = useGlowHover(ref, haloColor, loopAnimation);
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
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", mixBlendMode: blendMode, borderRadius: "inherit", overflow: "hidden" }}
      >
        <span
          ref={haloRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "130%",
            height: "260%",
            borderRadius: 1000,
            backgroundImage: `radial-gradient(circle, rgba(${haloColor},1), rgba(${haloColor},0) 70%)`,
            filter: "blur(18px)",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
        <span
          ref={ringRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            padding: 1.5,
            opacity: 0,
            pointerEvents: "none",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </span>
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
