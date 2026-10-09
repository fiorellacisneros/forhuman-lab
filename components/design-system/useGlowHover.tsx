import { useEffect, useRef } from "react";

// Glow / orbit effect, ported from a Webflow+GSAP snippet into this project's
// own dynamic-gsap-import convention (see GsapCardsReveal in
// MacDesktopExperience.tsx) instead of loading GSAP from a CDN. Shared by any
// element that wants the same border-glow treatment (buttons, code blocks…):
// - Halo: a soft blurred glow behind the element.
// - Ring: a bright beam traced along the element's border (a radial-gradient
//   clipped to a thin ring via mask-composite, not a filled circle).
// - On hover (mouse): the beam follows the cursor and the halo fades in.
// - Without hover (touch, or below `loopAnimation`'s breakpoint): the beam
//   orbits the border in an infinite loop instead.
export const GLOW_CFG = {
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

export type GlowLoopAnimation = "off" | "mobile" | "tablet" | "desktop";

function loopScopeActive(mode: GlowLoopAnimation) {
  if (mode === "desktop") return true;
  if (mode === "tablet") return window.innerWidth <= GLOW_BP.tablet;
  if (mode === "mobile") return window.innerWidth <= GLOW_BP.mobile;
  return false;
}

export function useGlowHover(
  ref: React.RefObject<HTMLElement | null>,
  haloColor: string,
  loopAnimation: GlowLoopAnimation = "off",
  // Bigger elements (e.g. the terminal card) need a wider ring radius and a
  // stronger halo, or the same button-tuned values read as barely visible.
  sizeScale = 1
) {
  const haloRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const ringRadius = GLOW_CFG.ringRadius * sizeScale;
  const haloAlpha = Math.min(1, GLOW_CFG.haloAlpha * sizeScale);

  useEffect(() => {
    const el = ref.current;
    const halo = haloRef.current;
    const ring = ringRef.current;
    if (!el || !halo || !ring) return;
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
          `radial-gradient(${ringRadius}px circle at ${mx}% ${my}%,` +
          `rgba(${haloColor},${GLOW_CFG.ringAlpha}),` +
          `rgba(${haloColor},${(GLOW_CFG.ringAlpha * 0.28).toFixed(3)}) 32%,transparent 62%)`;
      };
      paintRing();

      let qx: ((v: number) => void) | undefined;
      let qy: ((v: number) => void) | undefined;
      let qrx: ((v: number) => void) | undefined;
      let qry: ((v: number) => void) | undefined;

      const onPointerMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        qx?.((nx - 0.5) * 2 * (el as HTMLElement).offsetWidth * GLOW_CFG.followX);
        qy?.((ny - 0.5) * 2 * (el as HTMLElement).offsetHeight * GLOW_CFG.followY);
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
        el.addEventListener("pointermove", onPointerMove);
      }

      // Idle orbit: the beam travels around the border in a loop when the
      // element isn't hovered, active only at/below the configured breakpoint.
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
        gsap.to(halo, { opacity: haloAlpha, duration: reduce ? 0.15 : GLOW_CFG.inDur, ease: "power2.out", overwrite: "auto" });
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

      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("focusin", onEnter);
      el.addEventListener("focusout", onLeave);
      window.addEventListener("resize", syncOrbit);

      syncOrbit();

      cleanup = () => {
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("focusin", onEnter);
        el.removeEventListener("focusout", onLeave);
        window.removeEventListener("resize", syncOrbit);
        orbit?.kill();
        gsap.killTweensOf([halo, ring]);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [ref, haloColor, loopAnimation, ringRadius, haloAlpha]);

  return { haloRef, ringRef };
}

/** The halo + ring pair markup, absolutely filling the glowing element (which must be `position:relative` with a border-radius). */
export function GlowLayer({
  haloRef,
  ringRef,
  haloColor,
  blendMode = "screen",
  borderRadius = "inherit",
}: {
  haloRef: React.RefObject<HTMLSpanElement | null>;
  ringRef: React.RefObject<HTMLSpanElement | null>;
  haloColor: string;
  blendMode?: "screen" | "multiply";
  borderRadius?: number | string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        mixBlendMode: blendMode,
        borderRadius,
        overflow: "hidden",
      }}
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
          borderRadius,
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
  );
}
