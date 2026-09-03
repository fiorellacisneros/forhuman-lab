"use client";

import { CSSProperties, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { Tag } from "@/components/design-system/Tag";
import { PrincipalButton } from "@/components/design-system/PrincipalButton";
import { TextButton } from "@/components/design-system/TextButton";
import { Header } from "@/components/design-system/Header";
import { CardAprendizaje } from "@/components/design-system/CardAprendizaje";
import { CardPricing } from "@/components/design-system/CardPricing";
import { PromoCard } from "@/components/design-system/PromoCard";
import { Loader } from "@/components/design-system/Loader";

type AppId = "figma" | "webflow" | "flowmcp" | "finder" | "photos" | "notas" | "spotify" | null;
type HoverId = "figma" | "webflow" | "flowmcp" | "photos" | "finder" | "notas" | "spotify" | null;

type WhatsAppContact = { name: string; firstName: string; phone: string; photo: string };

const WHATSAPP_CONTACTS: WhatsAppContact[] = [
  { name: "Fio Cisneros", firstName: "Fio", phone: "51936098806", photo: "/forhuman-lab/fio-cisneros.jpg" },
  { name: "Dani Rosas", firstName: "Dani", phone: "51937845233", photo: "/forhuman-lab/mentor-1.jpg" },
];

function beginDrag(
  e: { clientX: number; clientY: number },
  origin: { x: number; y: number },
  setPos: (p: { x: number; y: number }) => void,
  onClick: () => void
) {
  const startX = e.clientX;
  const startY = e.clientY;
  const DRAG_THRESHOLD = 6;
  let moved = false;
  const onMove = (ev: MouseEvent) => {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (!moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    moved = true;
    setPos({ x: origin.x + dx, y: origin.y + dy });
  };
  const onUp = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    if (!moved) onClick();
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

const WEATHER_LABELS: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Neblina",
  48: "Neblina con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna",
  55: "Llovizna intensa",
  56: "Llovizna helada",
  57: "Llovizna helada intensa",
  61: "Lluvia ligera",
  63: "Lluvia",
  65: "Lluvia intensa",
  66: "Lluvia helada",
  67: "Lluvia helada intensa",
  71: "Nieve ligera",
  73: "Nieve",
  75: "Nieve intensa",
  77: "Nieve granulada",
  80: "Chubascos ligeros",
  81: "Chubascos",
  82: "Chubascos intensos",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta con granizo intenso",
};

type WeatherInfo = { city: string; temp: number; max: number; min: number; code: number };

const FALLBACK_WEATHER: WeatherInfo = { city: "Lima", temp: 19, max: 25, min: 19, code: 3 };

function WeatherIcon({ code, size = 26 }: { code: number; size?: number }) {
  const group = code === 0 ? "sun" : [1, 2, 3, 45, 48].includes(code) ? "cloud" : "rain";

  if (group === "sun") {
    return (
      <svg width={size} height={size} viewBox="0 0 26 26" fill="none" style={{ marginTop: 2 }}>
        <circle cx="13" cy="13" r="5.5" stroke="rgba(247,247,247,0.85)" strokeWidth="1.4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1={13 + Math.cos((deg * Math.PI) / 180) * 8.5}
            y1={13 + Math.sin((deg * Math.PI) / 180) * 8.5}
            x2={13 + Math.cos((deg * Math.PI) / 180) * 11}
            y2={13 + Math.sin((deg * Math.PI) / 180) * 11}
            stroke="rgba(247,247,247,0.85)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  }

  if (group === "rain") {
    return (
      <svg width={size} height="24" viewBox="0 0 26 24" fill="none" style={{ marginTop: 2 }}>
        <path
          d="M6.5 13.5C3.46 13.5 1 11.14 1 8.25C1 5.36 3.46 3 6.5 3C7.03 3 7.54 3.08 8.02 3.22C8.98 1.5 10.87 0.5 13 0.5C15.99 0.5 18.46 2.63 18.94 5.4C21.24 5.75 23 7.68 23 10C23 12.49 20.98 14.5 18.5 14.5H7C6.83 14.5 6.66 14.5 6.5 14.5"
          stroke="rgba(247,247,247,0.85)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="8" y1="17.5" x2="6.5" y2="21.5" stroke="rgba(247,247,247,0.85)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="13" y1="17.5" x2="11.5" y2="21.5" stroke="rgba(247,247,247,0.85)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="18" y1="17.5" x2="16.5" y2="21.5" stroke="rgba(247,247,247,0.85)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width={size} height="18" viewBox="0 0 26 18" fill="none" style={{ marginTop: 2 }}>
      <path
        d="M6.5 13.5C3.46 13.5 1 11.14 1 8.25C1 5.36 3.46 3 6.5 3C7.03 3 7.54 3.08 8.02 3.22C8.98 1.5 10.87 0.5 13 0.5C15.99 0.5 18.46 2.63 18.94 5.4C21.24 5.75 23 7.68 23 10C23 12.49 20.98 14.5 18.5 14.5H7C6.83 14.5 6.66 14.5 6.5 14.5"
        stroke="rgba(247,247,247,0.85)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function smoothScrollToId(id: string, duration = 500) {
  const target = document.getElementById(id);
  if (!target) return;
  const container = (target.closest(".shs-scroll") as HTMLElement | null) ?? document.scrollingElement;
  if (!container) return;

  const startY = container.scrollTop;
  const targetY = startY + target.getBoundingClientRect().top - container.getBoundingClientRect().top;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now: number) {
    const t = Math.min((now - startTime) / duration, 1);
    container!.scrollTop = startY + distance * easeInOutQuad(t);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const FIGMA_BENEFITS_LIVE = [
  "10 clases en vivo (24 horas)",
  "Acceso ilimitado al material y las clases",
  "Librería de componentes Figma incluida",
  "Certificado al completar el programa",
];
const FIGMA_BENEFITS_RECORDED = [
  "10 clases grabadas (24 horas)",
  "Acceso limitado al material y las clases",
  "Librería de componentes Figma incluida",
  "Certificado al completar el programa",
];
const WEBFLOW_BENEFITS_LIVE = [
  "12 clases en vivo (30 horas)",
  "Acceso al material y las clases",
  "Relume Pro 2 meses gratis",
  "Interacción en vivo con instructores y alumnos",
  "2 sesiones 1:1 para feedback y dudas (45min c/u)",
  "Retos semanales prácticos con feedback",
  "Ejercicios para practicar lo aprendido",
  "Certificado al completar el programa",
];
const WEBFLOW_BENEFITS_RECORDED = [
  "12 clases grabadas (30 horas)",
  "Acceso al material y las clases",
  "2 sesiones grupales para feedback y dudas (1 sesión por mes)",
  "Ejercicios para practicar lo aprendido",
  "Certificado al completar el programa",
];

const WEBFLOW_MODULES = [
  { number: "01", title: "Comprender el valor de Webflow", body: "Qué es Webflow y cómo utilizarlo para crear sitios web sin código. Aprenderás Client-First, naming conventions y organización profesional de proyectos." },
  { number: "02", title: "Identificar y construir layouts profesionales", body: "Usarás Flexbox y Grid para construir layouts responsivos y eficientes. Implementarás buenas prácticas en la maquetación." },
  { number: "03", title: "Gestionar contenido dinámico", body: "Crearás y gestionarás Collections, templates y contenido dinámico. Configurarás relaciones entre colecciones y estructuras escalables." },
  { number: "04", title: "Acelerar con herramientas profesionales", body: "Usarás Relume para construir 10x más rápido con componentes profesionales y workflows optimizados que mejoran tu productividad." },
  { number: "05", title: "Mejorar la experiencia del usuario", body: "Interacciones y animaciones para mejorar la experiencia. Scroll effects, micro-animaciones y transiciones que elevan tu diseño." },
  { number: "06", title: "Publicar y optimizar para resultados", body: "Optimizar y publicar tu sitio web en Webflow, asegurando un rendimiento óptimo, mejor posicionamiento SEO y resultados medibles." },
];

type MotivoIconKind = "layers" | "shield" | "link" | "globe" | "zap";

function MotivoIcon({ kind }: { kind: MotivoIconKind }) {
  const common = { width: 20, height: 20, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<MotivoIconKind, ReactNode> = {
    layers: (
      <>
        <path d="M10 2 2 6l8 4 8-4-8-4Z" />
        <path d="M2 10l8 4 8-4" />
        <path d="M2 14l8 4 8-4" />
      </>
    ),
    shield: (
      <>
        <path d="M10 2 3 5v5c0 4.5 3 7.5 7 8 4-.5 7-3.5 7-8V5l-7-3Z" />
        <path d="M7 10l2 2 4-4" />
      </>
    ),
    link: (
      <>
        <path d="M8 12a4 4 0 0 0 5.66 0l2-2a4 4 0 1 0-5.66-5.66l-1 1" />
        <path d="M12 8a4 4 0 0 0-5.66 0l-2 2a4 4 0 1 0 5.66 5.66l1-1" />
      </>
    ),
    globe: (
      <>
        <circle cx="10" cy="10" r="8" />
        <path d="M2 10h16M10 2c2.5 2.2 2.5 13.8 0 16M10 2c-2.5 2.2-2.5 13.8 0 16" />
      </>
    ),
    zap: <path d="M11 2 4 12h5l-1 6 7-10h-5l1-6Z" strokeLinejoin="round" />,
  };
  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--blue-light)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg {...common}>{paths[kind]}</svg>
    </div>
  );
}

const FIGMA_MOTIVOS: { title: string; body: string; icon: MotivoIconKind }[] = [
  { title: "Diseña sistemas, no solo pantallas", body: "Aprende a crear componentes y variables reutilizables: la base de cualquier proyecto real.", icon: "layers" },
  { title: "Sé alguien menos reemplazable", body: "La IA genera una pantalla en segundos, pero no estructura un sistema ni defiende una decisión de UX.", icon: "shield" },
  { title: "El puente entre diseño, código e IA", body: "Figma es el lenguaje común entre diseño, desarrollo e IA. Entrega archivos listos para producción.", icon: "link" },
];

const WEBFLOW_MOTIVOS: { title: string; body: string; icon: MotivoIconKind }[] = [
  { title: "Construye proyectos reales", body: "Crearás un sitio web profesional completo, de cero a publicado, que puedes usar en tu portfolio.", icon: "globe" },
  { title: "Sé alguien menos reemplazable", body: "La IA acelera el build, pero no reemplaza el criterio: entender al cliente y defender una decisión de diseño.", icon: "shield" },
  { title: "Acelera con IA, sin depender de ella", body: "Aprende a usar Figma, Relume e IA para construir más rápido — el mismo flujo que usamos con clientes reales.", icon: "zap" },
];

const FIGMA_PERKS = [
  { variant: "blue" as const, heading: "Comunidad forHuman", note: "*Acceso de por vida", body: "Únete a la comunidad privada de estudiantes y egresados de forHuman Studio, para compartir proyectos y resolver dudas.", icon: "/forhuman-lab/icon-figma.svg", iconKind: "color" as const },
  { variant: "light" as const, heading: "Relume Pro — 2 meses gratis", note: "*Durante el curso", body: "Acceso completo a la librería de componentes profesionales. Webflow + Figma integrados. Construye 10x más rápido con componentes pre-diseñados y workflows optimizados.", icon: "/forhuman-lab/icon-relume.png", iconKind: "color" as const },
  { variant: "yellow" as const, heading: "Merch oficial", note: "*Válido para Perú", body: "Participa de las actividades que tendremos presenciales y llévate merch oficial de superHuman School.", icon: "/forhuman-lab/logo-superhuman.svg", iconKind: "mask" as const },
];

const FIGMA_FAQ = [
  {
    q: "¿Necesito saber diseño?",
    a: "No. Figma Camp es un curso de nivel básico, pensado para personas que están empezando. No necesitas experiencia previa en diseño para llevar el curso con éxito.",
  },
  {
    q: "¿Necesito saber código?",
    a: "Tampoco. Figma es una herramienta 100% visual — no vas a escribir una sola línea de código. Trabajarás con auto layout, componentes y variables para armar interfaces reales.",
  },
  { q: "¿Las clases quedan grabadas?", a: "Sí. Todas las clases se graban y se suben al día siguiente para que puedas verlas con calma o ponerte al día si no pudiste asistir en vivo." },
  {
    q: "¿Cómo funciona la modalidad On-Demand?",
    a: "Las clases principales se dictan en vivo martes y jueves de 7 a 9pm Perú y se graban. Como estudiante On-Demand recibirás las grabaciones al día siguiente. Además tendrás acceso a 2 sesiones grupales en vivo al mes para resolver dudas junto a otros estudiantes On-Demand.",
  },
  { q: "¿Cómo funcionan los retos semanales?", a: "Cada semana tendrás un reto práctico donde aplicarás lo aprendido en clase. Estos retos te ayudan a consolidar el conocimiento y avanzar paso a paso en tu proyecto final." },
  { q: "¿Qué necesito técnicamente?", a: "• Laptop\n• Conexión a internet estable\n• Ganas de construir 🚀" },
  {
    q: "¿Se puede pagar en 2 cuotas?",
    a: "Sí. Ofrecemos pago en 2 partes: 50% al momento de inscribirte y 50% antes de que inicien las clases.",
  },
];

const WEBFLOW_PERKS = [
  { variant: "blue" as const, heading: "Figma Educator", note: "*Solo proyectos personales", body: "Accede gratis al plan Professional de Figma como participante del camp.", icon: "/forhuman-lab/icon-figma.svg", iconKind: "color" as const },
  { variant: "light" as const, heading: "Relume Pro — 2 meses gratis", note: "*Durante el curso", body: "Acceso completo a la librería de componentes profesionales. Webflow + Figma integrados. Construye 10x más rápido con componentes pre-diseñados y workflows optimizados.", icon: "/forhuman-lab/icon-relume.png", iconKind: "color" as const },
  { variant: "yellow" as const, heading: "Merch oficial", note: "*Válido para Perú", body: "Participa de las actividades que tendremos presenciales y llévate merch oficial.", icon: "/forhuman-lab/icon-webflow-mark.svg", iconKind: "mask" as const },
];

const WEBFLOW_FAQ = [
  {
    q: "¿Necesito saber código?",
    a: "No. Webflow Camp es un curso de nivel básico, pensado para personas que están empezando. No necesitas conocimientos previos de programación para llevar el curso con éxito.",
  },
  {
    q: "¿Necesito saber diseño?",
    a: "Tampoco. Durante el curso trabajaremos con un diseño en Figma que usaremos en clase para desarrollarlo paso a paso en Webflow. Además, para el proyecto final podrás usar una herramienta con IA que te ayudará a generar un diseño base, llevarlo a Figma y luego desarrollarlo en Webflow.",
  },
  { q: "¿Las clases quedan grabadas?", a: "Sí. Todas las clases se graban y se suben al día siguiente para que puedas verlas con calma o ponerte al día si no pudiste asistir en vivo." },
  {
    q: "¿Cómo funciona la modalidad On-Demand?",
    a: "Las clases principales se dictan en vivo martes y jueves de 7 a 9pm Perú y se graban. Como estudiante On-Demand recibirás las grabaciones al día siguiente. Además tendrás acceso a 2 sesiones grupales en vivo al mes para resolver dudas junto a otros estudiantes On-Demand.",
  },
  { q: "¿Cómo funcionan los retos semanales?", a: "Cada semana tendrás un reto práctico donde aplicarás lo aprendido en clase. Estos retos te ayudan a consolidar el conocimiento y avanzar paso a paso en tu proyecto final." },
  { q: "¿Qué necesito técnicamente?", a: "• Laptop\n• Conexión a internet estable\n• Ganas de construir 🚀" },
  {
    q: "¿Se puede pagar en 2 cuotas?",
    a: "Sí. Ofrecemos pago en 2 partes: 50% al momento de inscribirte y 50% antes de que inicien las clases.",
  },
];

const REAL_PHOTOS = ["/forhuman-lab/mentor-1.jpg", "/forhuman-lab/mentor-2.jpg", "/forhuman-lab/fio-cisneros.jpg"];

function PhotoSlot({ index }: { index: number }) {
  const src = REAL_PHOTOS[index % REAL_PHOTOS.length];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Foto"
      style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 10, objectFit: "cover", display: "block" }}
    />
  );
}

function TrafficLights({ onClose, hovered, onHoverChange }: { onClose: () => void; hovered: boolean; onHoverChange: (v: boolean) => void }) {
  const dot = (bg: string, glyph: ReactNode, onClick?: () => void) => (
    <div
      onClick={onClick}
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: bg,
        boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.45)",
        cursor: onClick ? "pointer" : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {hovered && glyph}
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 8 }} onMouseEnter={() => onHoverChange(true)} onMouseLeave={() => onHoverChange(false)}>
      {dot("#FF5C60", <div style={{ width: 11, height: 11, background: "url(/forhuman-lab/icon-traffic-close.svg) center / contain no-repeat" }} />, onClose)}
      {dot("#FAC800", <div style={{ width: 11, height: 2, background: "url(/forhuman-lab/icon-traffic-minimize.svg) center / contain no-repeat" }} />)}
      {dot("#35C759", <div style={{ width: 11, height: 11, background: "url(/forhuman-lab/icon-traffic-maximize.svg) center / contain no-repeat" }} />)}
    </div>
  );
}

function WindowChrome({
  title,
  bg = "var(--white)",
  onClose,
  closing = false,
  sidebar,
  sidebarOpen,
  onToggleSidebar,
  inset = { top: "5%", left: "7%", right: "7%", bottom: "5%" },
  titleBarVariant = "dark",
  children,
}: {
  title: string;
  bg?: string;
  onClose: () => void;
  closing?: boolean;
  sidebar?: ReactNode;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  inset?: { top?: string; left: string; right: string; bottom?: string };
  titleBarVariant?: "dark" | "light";
  children: ReactNode;
}) {
  const titleColor = titleBarVariant === "light" ? "#0D0D0D" : "#F7F7F7";
  const fitHeight = !inset.bottom;
  const [trafficHover, setTrafficHover] = useState(false);
  const [contentFade, setContentFade] = useState(1);
  const prevSidebarOpen = useRef(sidebarOpen);
  useEffect(() => {
    if (prevSidebarOpen.current === sidebarOpen) return;
    prevSidebarOpen.current = sidebarOpen;
    setContentFade(0.4);
    const t = setTimeout(() => setContentFade(1), 20);
    return () => clearTimeout(t);
  }, [sidebarOpen]);
  const appWindow = (
    <div
      className={`shs-app-window${closing ? " shs-app-window-closing" : ""}`}
      style={{
        position: fitHeight ? "relative" : "absolute",
        top: fitHeight ? undefined : inset.top,
        left: fitHeight ? undefined : inset.left,
        right: fitHeight ? undefined : inset.right,
        bottom: fitHeight ? undefined : inset.bottom,
        width: fitHeight ? "100%" : undefined,
        maxHeight: fitHeight ? "100%" : undefined,
        background: bg,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={(e) => e.stopPropagation()}
    >
        <div
          style={{
            height: 32,
            background:
              titleBarVariant === "light"
                ? "rgba(128,128,128,0.55)"
                : "linear-gradient(rgba(30,30,30,0.55),rgba(30,30,30,0.55)),#1E1E1E",
            backdropFilter: titleBarVariant === "light" ? "blur(80px)" : "blur(5px)",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            position: "relative",
            flexShrink: 0,
            boxShadow: "inset 0 0 0 0.67px rgba(255,255,255,0.1)",
          }}
        >
          <TrafficLights onClose={onClose} hovered={trafficHover} onHoverChange={setTrafficHover} />
          {onToggleSidebar && (
            <div
              onClick={onToggleSidebar}
              style={{
                width: 26,
                height: 24,
                marginLeft: 14,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 19,
                  height: 15,
                  backgroundColor: titleColor,
                  WebkitMaskImage: "url(/forhuman-lab/icon-sidebar-toggle.svg)",
                  maskImage: "url(/forhuman-lab/icon-sidebar-toggle.svg)",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            </div>
          )}
          <span
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              font: "500 13px/1 'Work Sans',sans-serif",
              color: titleColor,
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {sidebar}
          <div
            className="shs-scroll"
            style={{
              overflowY: "auto",
              flex: 1,
              background: bg,
              opacity: contentFade,
              transition: "opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.3)",
        opacity: closing ? 0 : 1,
        transition: closing ? "opacity 0.22s ease" : undefined,
        pointerEvents: closing ? "none" : undefined,
      }}
      onClick={onClose}
    >
      {fitHeight ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: inset.left,
            right: inset.right,
            transform: "translateY(-50%)",
            maxHeight: "80%",
            display: "flex",
          }}
        >
          {appWindow}
        </div>
      ) : (
        appWindow
      )}
    </div>
  );
}

const FINDER_SECTIONS = [
  { id: "nosotras", label: "Nosotras" },
  { id: "cifras", label: "Cifras" },
  { id: "mentores", label: "Mentores" },
];

const FIGMA_SECTIONS = [
  { id: "figma-inicio", label: "Inicio" },
  { id: "figma-programa", label: "Programa" },
  { id: "figma-motivos", label: "Motivos" },
  { id: "figma-bono", label: "Regalos" },
  { id: "figma-precios", label: "Precios" },
  { id: "figma-mentores", label: "Mentoras" },
  { id: "figma-faq", label: "Preguntas" },
];

const WEBFLOW_SECTIONS = [
  { id: "webflow-inicio", label: "Inicio" },
  { id: "webflow-programa", label: "Programa" },
  { id: "webflow-motivos", label: "Motivos" },
  { id: "webflow-bono", label: "Regalos" },
  { id: "webflow-testimonios", label: "Testimonios" },
  { id: "webflow-precios", label: "Precios" },
  { id: "webflow-mentores", label: "Mentoras" },
  { id: "webflow-faq", label: "Preguntas" },
];

const FLOWMCP_SECTIONS = [
  { id: "flowmcp-inicio", label: "Inicio" },
  { id: "flowmcp-problema", label: "Problema" },
  { id: "flowmcp-como-funciona", label: "Cómo funciona" },
  { id: "flowmcp-seguridad", label: "Seguridad" },
  { id: "flowmcp-agencias", label: "Agencias" },
];

const WEBFLOW_TESTIMONIALS = [
  {
    quote:
      "Disfruté mucho las energías de quienes nos dictaron las clases, y los invitados que estuvieron ahí para apoyarnos. También aprecio mucho que nos dieran espacios 1:1 para resolver dudas de nuestros proyectos.",
    date: "28 may 2026",
  },
  {
    quote:
      "Un programa muy bueno para cualquier nivel de experiencia en Webflow. Dani y Fio son muy agradables, accesibles, sobretodo orientadas a las buenas prácticas dentro de Webflow. Fue un excelente curso para partir de una buena base.",
    date: "29 may 2026",
  },
  {
    quote: "Excelente curso, siembra muy buenas bases para trabajar con Webflow.",
    date: "29 may 2026",
  },
  {
    quote: "Aparte de las clases, la retroalimentación con los invitados fue lo que más disfruté. Es muy bueno para iniciar en Webflow.",
    date: "29 may 2026",
  },
  {
    quote: "Lo que más disfruté fue poder construir un proyecto propio por mí misma.",
    date: "29 may 2026",
  },
  {
    quote: "Sin duda la interacción con las tutoras — muy buena onda y con mucha paciencia.",
    date: "3 jun 2026",
  },
];

const FOTOS_SECTIONS = [
  { id: "favoritos", label: "Favoritos", icon: "/forhuman-lab/icon-favoritos.svg" },
  { id: "mascotas", label: "Mascotas", icon: "/forhuman-lab/icon-mascotas.svg" },
  { id: "recientes", label: "Reciente", icon: "/forhuman-lab/icon-reciente.svg" },
];

function AppSidebar({
  label = "Secciones",
  sections,
  active,
  onSelect,
  open,
}: {
  label?: string;
  sections: { id: string; label: string; icon?: string }[];
  active: string;
  onSelect: (id: string) => void;
  open: boolean;
}) {
  return (
    <div
      style={{
        width: open ? 190 : 0,
        flexShrink: 0,
        background: "#E6E6E6",
        borderRight: open ? "1px solid rgba(13,13,13,0.08)" : "none",
        overflow: "hidden",
        transition: "width 0.24s cubic-bezier(0.22, 1, 0.36, 1)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: 190, padding: "20px 10px", boxSizing: "border-box" }}>
        <div style={{ font: "600 11px/1 'Inconsolata',monospace", letterSpacing: "0.12em", color: "#6B6B6B", textTransform: "uppercase", padding: "0 10px", marginBottom: 10 }}>
          {label}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <div
                key={s.id}
                onClick={() => onSelect(s.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 10px",
                  borderRadius: 7,
                  background: isActive ? "#F2F2F2" : "transparent",
                  boxShadow: isActive ? "0 0 0 1px rgba(13,13,13,0.06)" : "none",
                  transition: "background 0.22s ease, box-shadow 0.22s ease",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    backgroundColor: "#0078F0",
                    WebkitMaskImage: `url(${s.icon ?? "/forhuman-lab/icon-doc.svg"})`,
                    maskImage: `url(${s.icon ?? "/forhuman-lab/icon-doc.svg"})`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
                <span style={{ font: "400 13px/1.2 'Work Sans',sans-serif", color: "#0D0D0D" }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileScreen({
  title,
  bg,
  onClose,
  closing = false,
  children,
}: {
  title: string;
  bg: string;
  onClose: () => void;
  closing?: boolean;
  children: ReactNode;
}) {
  const [trafficHover, setTrafficHover] = useState(false);
  return (
    <div
      className={`shs-app-window${closing ? " shs-app-window-closing" : ""}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: "calc(env(safe-area-inset-top, 0px) + 32px)",
          background: "linear-gradient(rgba(30,30,30,0.55),rgba(30,30,30,0.55)),#1E1E1E",
          display: "flex",
          alignItems: "flex-end",
          padding: "0 14px 8px",
          position: "relative",
          flexShrink: 0,
          boxShadow: "inset 0 0 0 0.67px rgba(255,255,255,0.1)",
        }}
      >
        <TrafficLights onClose={onClose} hovered={trafficHover} onHoverChange={setTrafficHover} />
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: 8,
            transform: "translateX(-50%)",
            font: "500 13px/1 'Work Sans',sans-serif",
            color: "#F7F7F7",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
      </div>
      <div className="shs-scroll" style={{ flex: 1, overflowY: "auto", background: bg, WebkitOverflowScrolling: "touch" }}>
        {children}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loader size={30} />
    </div>
  );
}

function FaqAccordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 320 }}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              padding: "20px 24px",
              cursor: "pointer",
            }}
            onClick={() => setOpenIndex(isOpen ? null : i)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <span style={{ font: "500 18px/1.3 'Work Sans',sans-serif", color: "var(--white)" }}>{item.q}</span>
              <span
                style={{
                  font: "400 22px/1 'Work Sans',sans-serif",
                  color: "var(--white)",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  flexShrink: 0,
                }}
              >
                +
              </span>
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <p style={{ font: "300 15px/1.5 'Work Sans',sans-serif", color: "rgba(255,255,255,0.75)", margin: "16px 0 0", whiteSpace: "pre-line" }}>
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.33, 1, 0.68, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function RevealGroup({
  children,
  style,
  className,
  itemStyle,
  staggerDelay = 0.08,
}: {
  children: ReactNode[];
  style?: CSSProperties;
  className?: string;
  itemStyle?: CSSProperties;
  staggerDelay?: number;
}) {
  return (
    <div style={style} className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * staggerDelay} style={itemStyle}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

function MomentumCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const [hover, setHover] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  return (
    <motion.div
      style={{ cursor: "default", ...style }}
      onMouseEnter={() => setHover(true)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        setOffset({ x: relX * 14, y: relY * 14 });
      }}
      onMouseLeave={() => {
        setHover(false);
        setOffset({ x: 0, y: 0 });
      }}
      animate={{ x: offset.x, y: offset.y - (hover ? 6 : 0) }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}

type PerkItem = {
  variant: "yellow" | "dark" | "blue" | "light";
  heading: string;
  note: string;
  body: string;
  icon: string;
  iconKind: "color" | "mask";
};

function PerkIcon({ item, size }: { item: PerkItem; size: string }) {
  return item.iconKind === "mask" ? (
    <div
      style={{
        width: size,
        height: `calc(${size} * 0.63)`,
        backgroundColor: item.variant === "yellow" || item.variant === "light" ? "var(--black)" : "var(--white)",
        WebkitMaskImage: `url(${item.icon})`,
        maskImage: `url(${item.icon})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.icon} alt="" style={{ width: size, height: size, objectFit: "contain" }} />
  );
}

function DescubreButton({ onClick, style }: { onClick: () => void; style?: CSSProperties }) {
  return (
    <button
      onClick={onClick}
      className="shs-perk-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 28px",
        borderRadius: "var(--radius-full)",
        border: "none",
        background: "var(--yellow)",
        color: "var(--black)",
        font: "500 18px/1 'Work Sans',sans-serif",
        cursor: "pointer",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
      Descubre
    </button>
  );
}

function StackedPerks({ items }: { items: PerkItem[] }) {
  const [order, setOrder] = useState(items.map((_, i) => i));
  const next = () => setOrder((o) => [...o.slice(1), o[0]]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 48 }}>
      <div style={{ position: "relative", width: "clamp(280px, 82vw, 410px)" }}>
        <div style={{ position: "relative", width: "clamp(280px, 82vw, 410px)", height: "clamp(400px, 100vw, 500px)" }}>
          {items.map((item, i) => {
            const pos = order.indexOf(i);
            const tilt = pos % 2 === 0 ? -4 - pos * 3 : 4 + pos * 3;
            const xOffset = pos % 2 === 0 ? -pos * 10 : pos * 10;
            return (
              <motion.div
                key={item.heading}
                animate={{ x: xOffset, y: pos * 16, scale: 1 - pos * 0.05, rotate: tilt, zIndex: items.length - pos }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                style={{ position: "absolute", inset: 0, pointerEvents: pos === 0 ? "auto" : "none" }}
              >
                <PromoCard
                  variant={item.variant}
                  heading={item.heading}
                  note={item.note}
                  body={item.body}
                  linkText=""
                  iconPosition="top"
                  style={{ width: "clamp(280px, 82vw, 410px)", height: "clamp(400px, 100vw, 500px)" }}
                  icon={<PerkIcon item={item} size="clamp(48px, 14vw, 80px)" />}
                />
              </motion.div>
            );
          })}
        </div>
        <DescubreButton onClick={next} style={{ position: "absolute", left: "50%", bottom: 0, zIndex: 999, transform: "translate(-50%, 50%)" }} />
      </div>
    </div>
  );
}

const TESTIMONIAL_DOT_COLORS = ["var(--yellow)", "#4ADE80", "#38BDF8", "var(--blue)"];

function TestimonialsSection({ items }: { items: { quote: string; date: string }[] }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const container = pinRef.current?.closest(".shs-scroll") as HTMLElement | null;
    if (container) setMinHeight(container.clientHeight);
  }, []);

  useEffect(() => {
    if (minHeight === undefined) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        if (cancelled || !pinRef.current || !trackRef.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const scroller = pinRef.current.closest(".shs-scroll") as HTMLElement | null;

        ctx = gsap.context(() => {
          const track = trackRef.current!;
          const getDistance = () => Math.max(0, track.scrollWidth - pinRef.current!.clientWidth);
          gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: pinRef.current!,
              scroller: scroller ?? undefined,
              start: "top top",
              end: () => "+=" + getDistance(),
              scrub: true,
              pin: true,
              pinType: "transform",
              invalidateOnRefresh: true,
            },
          });
        });
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [minHeight]);

  return (
    <div id="webflow-testimonios" ref={pinRef} style={{ background: "var(--black)", overflow: "hidden", minHeight }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "clamp(32px, 7vw, 56px)",
          paddingTop: "clamp(40px, 8vw, 64px)",
          paddingBottom: "clamp(40px, 8vw, 64px)",
          boxSizing: "border-box",
          minHeight,
        }}
      >
        <div className="shs-inner-pad" style={{ padding: "0 64px" }}>
          <Reveal>
            <h2 style={{ font: "400 clamp(28px, 6.5vw, 52px)/1.25 'Manrope',sans-serif", letterSpacing: "-0.02em", margin: 0, maxWidth: 960 }}>
              <span style={{ color: "var(--white)" }}>¿Qué opinan de Webflow Camp? Ya son más de 150 alumnos formados. </span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>No te quedes solo con nuestra palabra — escúchalo directo de nuestra comunidad.</span>
            </h2>
          </Reveal>
        </div>
        <div ref={trackRef} className="shs-inner-pad" style={{ display: "flex", gap: 20, padding: "0 64px", width: "max-content" }}>
          {items.map((t, i) => (
            <div
              key={i}
              style={{
                width: "clamp(240px, 78vw, 420px)",
                height: "clamp(240px, 78vw, 420px)",
                flexShrink: 0,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.14)",
                padding: "clamp(24px, 5vw, 40px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 24,
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, font: "400 15px/1 'Work Sans',sans-serif", color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: TESTIMONIAL_DOT_COLORS[i % TESTIMONIAL_DOT_COLORS.length] }} />
                  Webflow Camp
                </span>
                <span style={{ font: "400 14px/1 'Work Sans',sans-serif", color: "rgba(255,255,255,0.4)" }}>{t.date}</span>
              </div>
              <p style={{ font: "300 clamp(16px, 4vw, 22px)/1.5 'Work Sans',sans-serif", color: "rgba(255,255,255,0.9)", margin: 0 }}>
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SumateCTA({ courseName, weeks, targetId }: { courseName: string; weeks: string; targetId: string }) {
  return (
    <Reveal style={{ width: "100%", maxWidth: 900 }}>
      <div
        style={{
          background: "var(--blue)",
          borderRadius: "var(--radius-md)",
          padding: "clamp(32px, 8vw, 56px) clamp(24px, 6vw, 48px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          textAlign: "center",
        }}
      >
        <h2 style={{ font: "400 clamp(28px, 7.5vw, 48px)/1.15 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--white)", margin: 0, maxWidth: 640 }}>
          Súmate al {courseName}
        </h2>
        <p style={{ font: "300 clamp(16px, 4vw, 20px)/1.4 'Work Sans',sans-serif", color: "rgba(255,255,255,0.9)", margin: 0, maxWidth: 640 }}>
          <strong style={{ fontWeight: 600 }}>{weeks}</strong> intensivas donde construirás <strong style={{ fontWeight: 600 }}>2 proyectos publicados</strong>, obtén aprendizaje real y beneficios exclusivos de nuestro camp!
        </p>
        <button
          onClick={() => smoothScrollToId(targetId)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 24px",
            borderRadius: "var(--radius-full)",
            border: "none",
            background: "var(--blue-light)",
            color: "var(--black)",
            font: "500 16px/1 'Work Sans',sans-serif",
            cursor: "pointer",
          }}
        >
          Ver cronograma
          <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
            <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
          </svg>
        </button>
      </div>
    </Reveal>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        color: "var(--white)",
        font: "400 22px/1.1 'Manrope',sans-serif",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          height: 2,
          width: hover ? "100%" : "0%",
          background: "var(--yellow)",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: "none",
        }}
      />
    </a>
  );
}

function FooterLinkCol({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px, 4vw, 24px)", width: 180 }}>
      <span style={{ font: "400 15px/1 'Manrope',sans-serif", color: "rgba(247,247,247,0.5)" }}>{eyebrow}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>{children}</div>
    </div>
  );
}

function SiteFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const footerRef = useRef<HTMLDivElement>(null);
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    const container = footerRef.current?.closest(".shs-scroll") as HTMLElement | null;
    setScrollContainer(container);
    if (container) setSpacerHeight(Math.min(container.clientHeight * 0.35, 160));
  }, []);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    container: scrollContainer ? { current: scrollContainer } : undefined,
    offset: ["start end", "start center"],
  });
  const innerY = useTransform(scrollYProgress, [0, 1], ["-25%", "0%"]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Algo salió mal");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Algo salió mal");
    }
  };

  return (
    <footer ref={footerRef} style={{ position: "relative", background: "var(--black)", paddingTop: "clamp(32px, 8vw, 64px)", overflow: "hidden" }}>
      <motion.div style={{ y: innerY, display: "flex", flexDirection: "column", minHeight: spacerHeight ? spacerHeight + 260 : undefined }}>
        <div className="shs-inner-pad" style={{ padding: "0 64px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "clamp(24px, 6vw, 40px)" }}>
          <div style={{ display: "flex", gap: "clamp(24px, 6vw, 48px)", flexWrap: "wrap" }}>
            <FooterLinkCol eyebrow="Páginas">
              <FooterLink href="https://www.forhuman.studio/">forHuman</FooterLink>
              <FooterLink href="#">Webflow Camp</FooterLink>
              <FooterLink href="#">Aviso legal</FooterLink>
            </FooterLinkCol>
            <FooterLinkCol eyebrow="Social">
              <FooterLink href="https://www.linkedin.com/company/forhuman-studio/">LinkedIn</FooterLink>
              <FooterLink href="https://www.instagram.com/superhuman.school/">Instagram</FooterLink>
            </FooterLinkCol>
            <FooterLinkCol eyebrow="Contacto">
              <FooterLink href="mailto:hola@forhuman.studio">hola@forhuman.studio</FooterLink>
              <FooterLink href="https://api.whatsapp.com/send/?phone=%2B51936098806&text=Hola%2C+quisiera+informaci%C3%B3n+sobre...&type=phone_number&app_absent=0">
                +51 936 098 806
              </FooterLink>
            </FooterLinkCol>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 260 }}>
            <span style={{ font: "400 13px/1.4 'Work Sans',sans-serif", color: "rgba(247,247,247,0.6)" }}>
              Recibe novedades de próximos experimentos de forHuman.
            </span>
            {status === "done" ? (
              <span style={{ font: "500 14px/1 'Work Sans',sans-serif", color: "var(--white)" }}>
                ¡Listo! Ya estás suscrito.
              </span>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", gap: 8, width: "100%" }}>
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="peter@parker.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 5,
                    border: "1px solid rgba(247,247,247,0.15)",
                    background: "rgba(247,247,247,0.08)",
                    color: "var(--white)",
                    font: "400 14px/1 'Work Sans',sans-serif",
                    width: "100%",
                    minWidth: 0,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 5,
                    border: "1px solid var(--yellow)",
                    background: "var(--yellow)",
                    color: "var(--black)",
                    font: "500 14px/1 'Work Sans',sans-serif",
                    cursor: status === "loading" ? "default" : "pointer",
                    opacity: status === "loading" ? 0.7 : 1,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {status === "loading" ? "..." : "Enviar"}
                </button>
              </form>
            )}
            {status === "error" && (
              <span style={{ font: "400 12px/1.3 'Work Sans',sans-serif", color: "rgba(247,247,247,0.6)" }}>{errorMsg}</span>
            )}
          </div>
        </div>
        <div style={{ marginTop: "auto", paddingTop: "clamp(32px, 9vw, 120px)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/forhuman-lab/logo-forhuman-footer.svg" alt="forHuman" style={{ width: "100%", display: "block" }} />
        </div>
      </motion.div>
    </footer>
  );
}

function FigmaBody() {
  return (
    <>
      <section id="figma-inicio" style={{ padding: "clamp(32px, 8vw, 64px) 64px clamp(24px, 6vw, 56px) 64px", display: "flex", flexDirection: "column", gap: 24 }}>
        <Reveal>
          <HeroPunchBlock
            kicker="La IA ya genera un mockup en Figma en segundos: acomoda cajas, alinea textos, hasta sugiere una paleta de colores. Si sientes que eso te vuelve prescindible, no es la herramienta lo que tienes que aprender — es el criterio que la IA todavía no tiene."
            headline={<>Aprende a ser <HeroHighlight>menos reemplazable</HeroHighlight>.</>}
          />
        </Reveal>
        <Reveal delay={0.04}>
          <Tag>Nuevo · Inicia 10 Marzo · 15 plazas · 4 semanas</Tag>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 style={{ font: "400 clamp(34px, 9vw, 56px)/1.05 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--black)", margin: 0, maxWidth: 820 }}>
            Figma Camp
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p style={{ font: "300 clamp(16px, 4vw, 22px)/1.4 'Work Sans',sans-serif", color: "var(--black)", maxWidth: 680, margin: 0 }}>
            Programa intensivo para dominar Figma: sistemas de diseño, prototipado y handoff con desarrollo. De cero a listo para producción.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div style={{ display: "flex", gap: 20, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
            <PrincipalButton variant="primary">Quiero inscribirme</PrincipalButton>
            <TextButton href="#">Ver beneficios</TextButton>
          </div>
        </Reveal>
      </section>
      <section id="figma-programa" style={{ padding: "0 64px clamp(40px, 9vw, 80px) 64px", display: "flex", flexDirection: "column", gap: 32 }}>
        <Reveal>
          <Header
            kicker="Currículum"
            title="El programa"
            subtitle="Al finalizar tendrás el conocimiento y las herramientas para diseñar, prototipar y entregar interfaces listas para producción."
            align="left"
          />
        </Reveal>
        <RevealGroup
          className="shs-motivos-row"
          style={{ display: "flex", gap: 20, alignItems: "stretch" }}
          itemStyle={{ flex: "1 1 0", minWidth: 0 }}
        >
          <CardAprendizaje number="01" title="Fundamentos de Figma" body="Interfaz, componentes y auto layout para trabajar rápido y ordenado." style={{ width: "100%", height: "100%" }} />
          <CardAprendizaje number="02" title="Sistemas de diseño" body="Variables, estilos y librerías compartidas para escalar cualquier proyecto." style={{ width: "100%", height: "100%" }} />
          <CardAprendizaje number="03" title="Prototipado y handoff" body="Interacciones realistas y especificaciones claras para developers." style={{ width: "100%", height: "100%" }} />
        </RevealGroup>
      </section>
      <section id="figma-motivos" style={{ background: "var(--gray-100)", padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", flexDirection: "column", gap: 32 }}>
        <Reveal>
          <Header kicker="Por qué este camp" title="De principiante a builder profesional" subtitle="Motivos para llevar el curso" align="left" />
        </Reveal>
        <RevealGroup
          className="shs-motivos-row"
          style={{ display: "flex", gap: 20, alignItems: "stretch" }}
          itemStyle={{ flex: "1 1 0", minWidth: 0 }}
        >
          {FIGMA_MOTIVOS.map((m) => (
            <div
              key={m.title}
              style={{
                height: "100%",
                background: "var(--pure-white)",
                borderRadius: "var(--radius-md)",
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                boxSizing: "border-box",
              }}
            >
              <MotivoIcon kind={m.icon} />
              <div style={{ font: "400 24px/1.15 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--black)" }}>{m.title}</div>
              <div style={{ font: "300 15px/1.4 'Work Sans',sans-serif", color: "var(--gray-500)" }}>{m.body}</div>
            </div>
          ))}
        </RevealGroup>
      </section>
      <section id="figma-bono" style={{ background: "var(--black)", padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", flexDirection: "column", gap: 32, alignItems: "center" }}>
        <Reveal>
          <Header
            kicker="Beneficios"
            kickerColor="var(--yellow)"
            title="No solo aprendes. También tienes regalos."
            subtitle="Cada estudiante recibe acceso a herramientas profesionales de la industria."
            color="var(--white)"
          />
        </Reveal>
        <Reveal>
          <StackedPerks items={FIGMA_PERKS} />
        </Reveal>
      </section>
      <section id="figma-precios" style={{ padding: "clamp(40px, 9vw, 80px) 64px", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
        <Reveal>
          <Header kicker="Precios" title="Inscríbete y potencia tus habilidades" subtitle="Transforma tus habilidades en oportunidades internacionales, tu propia agencia o proyectos independientes." />
        </Reveal>
        <StripeTag />
        <RevealGroup style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          <CardPricing variant="blue" title="En vivo" subtitle="Conecta y aprende" price="$150" oldPrice="$220" benefits={FIGMA_BENEFITS_LIVE} />
          <CardPricing variant="dark" title="On-Demand" subtitle="Aprende a tu ritmo" price="$100" oldPrice="$150" benefits={FIGMA_BENEFITS_RECORDED} />
        </RevealGroup>
      </section>
      <section id="figma-mentores" className="shs-mentores-row" style={{ background: "var(--black)", padding: "clamp(40px, 9vw, 80px) 64px", display: "flex", gap: 48, flexWrap: "nowrap", alignItems: "center" }}>
        <Reveal style={{ flex: "1 1 320px", minWidth: 0 }}>
          <Header
            kicker="Quiénes te enseñan"
            kickerColor="rgba(255,255,255,0.6)"
            title="Aprende de Figma Educators certificadas"
            subtitle="Al finalizar tendrás el conocimiento y las herramientas para diseñar, prototipar y entregar interfaces listas para producción."
            align="left"
            color="var(--white)"
          />
        </Reveal>
        <RevealGroup style={{ display: "flex", gap: 24, flexWrap: "nowrap", flexShrink: 0, minWidth: 0 }}>
          <MomentumCard style={{ width: 260, borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/forhuman-lab/fio-cisneros.jpg" alt="Fiorella Cisneros" style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 20px", background: "linear-gradient(0deg, rgba(0,0,0,0.75), transparent)" }}>
              <div style={{ font: "500 20px/1 'Manrope',sans-serif", color: "var(--white)" }}>Fiorella Cisneros</div>
              <div style={{ font: "300 13px/1 'Work Sans',sans-serif", color: "rgba(255,255,255,0.8)" }}>Figma Educator</div>
            </div>
          </MomentumCard>
          <MomentumCard style={{ width: 260, borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/forhuman-lab/mentor-1.jpg" alt="Danitza Rosas" style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 20px", background: "linear-gradient(0deg, rgba(0,0,0,0.75), transparent)" }}>
              <div style={{ font: "500 20px/1 'Manrope',sans-serif", color: "var(--white)" }}>Danitza Rosas</div>
              <div style={{ font: "300 13px/1 'Work Sans',sans-serif", color: "rgba(255,255,255,0.8)" }}>Product Designer</div>
            </div>
          </MomentumCard>
        </RevealGroup>
      </section>
      <section id="figma-cta" style={{ background: "var(--black)", padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", justifyContent: "center" }}>
        <SumateCTA courseName="Figma Camp" weeks="4 semanas" targetId="figma-programa" />
      </section>
      <section id="figma-faq" style={{ background: "var(--black)", padding: "clamp(40px, 9vw, 80px) 64px", display: "flex", gap: "clamp(28px, 7vw, 64px)", flexWrap: "wrap" }}>
        <Reveal style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ font: "600 13px/1 'Inconsolata',monospace", letterSpacing: "0.1em", color: "var(--yellow)", textTransform: "uppercase" }}>
            Antes de empezar
          </span>
          <h2 style={{ font: "400 clamp(26px, 6.5vw, 40px)/1.15 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--white)", margin: 0 }}>
            ¿Tienes dudas? Aquí las resolvemos
          </h2>
          <p style={{ font: "300 16px/1.4 'Work Sans',sans-serif", color: "rgba(255,255,255,0.75)", margin: 0 }}>
            Sabemos que siempre surgen preguntas. Aquí te dejamos las respuestas a las dudas más frecuentes sobre Figma Camp.
          </p>
        </Reveal>
        <Reveal delay={0.1} style={{ flex: 1, minWidth: 320 }}>
          <FaqAccordion items={FIGMA_FAQ} />
        </Reveal>
      </section>
      <SiteFooter />
    </>
  );
}

function WebflowBody() {
  return (
    <>
      <section id="webflow-inicio" style={{ padding: "clamp(32px, 8vw, 64px) 64px clamp(24px, 6vw, 56px) 64px", display: "flex", flexDirection: "column", gap: 24 }}>
        <Reveal>
          <HeroPunchBlock
            kicker="La IA ya arma una web básica en minutos: crea secciones, aplica estilos, hasta escribe el copy. Si te preocupa que eso te vuelva prescindible, no es Webflow lo que tienes que dominar — es el criterio que la IA todavía no tiene."
            headline={<>Aprende a ser <HeroHighlight>menos reemplazable</HeroHighlight>.</>}
          />
        </Reveal>
        <Reveal delay={0.04}>
          <Tag>Early Bird · Inicia 25 Febrero · 15 plazas · 5 semanas</Tag>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 style={{ font: "400 clamp(34px, 9vw, 56px)/1.05 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--black)", margin: 0, maxWidth: 820 }}>
            Webflow Camp
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p style={{ font: "300 clamp(16px, 4vw, 22px)/1.4 'Work Sans',sans-serif", color: "var(--black)", maxWidth: 680, margin: 0 }}>
            Programa intensivo donde aprendes a construir sitios web profesionales desde la maquetación hasta la publicación, aplicando buenas prácticas. Sin código. Sin excusas.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div style={{ display: "flex", gap: 20, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
            <PrincipalButton variant="primary">Quiero inscribirme</PrincipalButton>
            <TextButton href="#">Ver beneficios</TextButton>
          </div>
        </Reveal>
      </section>
      <section id="webflow-programa" style={{ padding: "0 64px clamp(40px, 9vw, 80px) 64px", display: "flex", flexDirection: "column", gap: 32 }}>
        <Reveal>
          <Header
            kicker="Currículum"
            title="El programa"
            subtitle="Al finalizar tendrás el conocimiento y las herramientas para crear y lanzar sitios web sin depender de código."
            align="left"
          />
        </Reveal>
        <RevealGroup style={{ display: "flex", gap: 20, flexWrap: "wrap" }} itemStyle={{ flex: "1 1 300px", minWidth: 0 }}>
          {WEBFLOW_MODULES.map((m) => (
            <CardAprendizaje key={m.number} number={m.number} title={m.title} body={m.body} style={{ width: "100%" }} />
          ))}
        </RevealGroup>
      </section>
      <section id="webflow-motivos" style={{ background: "var(--gray-100)", padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", flexDirection: "column", gap: 32 }}>
        <Reveal>
          <Header kicker="Por qué este camp" title="De principiante a builder profesional" subtitle="Motivos para llevar el curso" align="left" />
        </Reveal>
        <RevealGroup
          className="shs-motivos-row"
          style={{ display: "flex", gap: 20, alignItems: "stretch" }}
          itemStyle={{ flex: "1 1 0", minWidth: 0 }}
        >
          {WEBFLOW_MOTIVOS.map((m) => (
            <div
              key={m.title}
              style={{
                height: "100%",
                background: "var(--pure-white)",
                borderRadius: "var(--radius-md)",
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                boxSizing: "border-box",
              }}
            >
              <MotivoIcon kind={m.icon} />
              <div style={{ font: "400 24px/1.15 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--black)" }}>{m.title}</div>
              <div style={{ font: "300 15px/1.4 'Work Sans',sans-serif", color: "var(--gray-500)" }}>{m.body}</div>
            </div>
          ))}
        </RevealGroup>
      </section>
      <section id="webflow-bono" style={{ background: "var(--black)", padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", flexDirection: "column", gap: 32, alignItems: "center" }}>
        <Reveal>
          <Header
            kicker="Beneficios"
            kickerColor="var(--yellow)"
            title="No solo aprendes. También tienes regalos."
            subtitle="Cada estudiante recibe acceso a herramientas profesionales de la industria."
            color="var(--white)"
          />
        </Reveal>
        <Reveal>
          <StackedPerks items={WEBFLOW_PERKS} />
        </Reveal>
      </section>
      <TestimonialsSection items={WEBFLOW_TESTIMONIALS} />
      <section id="webflow-precios" style={{ padding: "clamp(40px, 9vw, 80px) 64px", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
        <Reveal>
          <Header kicker="Precios" title="Inscríbete y potencia tus habilidades" subtitle="Transforma tus habilidades en oportunidades internacionales, tu propia agencia o proyectos independientes." />
        </Reveal>
        <StripeTag />
        <RevealGroup style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          <CardPricing
            variant="blue"
            title="En vivo"
            subtitle="Conecta y aprende"
            price="$180"
            oldPrice="$250"
            benefits={WEBFLOW_BENEFITS_LIVE}
            onCtaClick={() =>
              window.open(
                `https://api.whatsapp.com/send/?phone=%2B51936098806&text=${encodeURIComponent("Hola Fio, me interesa el curso en vivo")}&type=phone_number&app_absent=0`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          />
          <CardPricing
            variant="dark"
            title="On-Demand"
            subtitle="Aprende a tu ritmo"
            price="$120"
            oldPrice="$180"
            footnote="*Pago único - La grabación es de las clases en vivo"
            benefits={WEBFLOW_BENEFITS_RECORDED}
            onCtaClick={() =>
              window.open(
                `https://api.whatsapp.com/send/?phone=%2B51936098806&text=${encodeURIComponent("Hola Fio, me interesa el curso on-demand")}&type=phone_number&app_absent=0`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          />
        </RevealGroup>
      </section>
      <section id="webflow-mentores" className="shs-mentores-row" style={{ background: "var(--black)", padding: "clamp(40px, 9vw, 80px) 64px", display: "flex", gap: 48, flexWrap: "nowrap", alignItems: "center" }}>
        <Reveal style={{ flex: "1 1 320px", minWidth: 0 }}>
          <Header
            kicker="Quiénes te enseñan"
            kickerColor="rgba(255,255,255,0.6)"
            title="Aprende de Webflow Educators certificadas"
            subtitle="Al finalizar tendrás el conocimiento y las herramientas para crear y lanzar sitios web sin depender de código."
            align="left"
            color="var(--white)"
          />
        </Reveal>
        <RevealGroup style={{ display: "flex", gap: 24, flexWrap: "nowrap", flexShrink: 0, minWidth: 0 }}>
          <MomentumCard style={{ width: 260, borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/forhuman-lab/fio-cisneros.jpg" alt="Fiorella Cisneros" style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 20px", background: "linear-gradient(0deg, rgba(0,0,0,0.75), transparent)" }}>
              <div style={{ font: "500 20px/1 'Manrope',sans-serif", color: "var(--white)" }}>Fiorella Cisneros</div>
              <div style={{ font: "300 13px/1 'Work Sans',sans-serif", color: "rgba(255,255,255,0.8)" }}>Webflow Educator</div>
            </div>
          </MomentumCard>
          <MomentumCard style={{ width: 260, borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/forhuman-lab/mentor-1.jpg" alt="Danitza Rosas" style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 20px", background: "linear-gradient(0deg, rgba(0,0,0,0.75), transparent)" }}>
              <div style={{ font: "500 20px/1 'Manrope',sans-serif", color: "var(--white)" }}>Danitza Rosas</div>
              <div style={{ font: "300 13px/1 'Work Sans',sans-serif", color: "rgba(255,255,255,0.8)" }}>Webflow Designer</div>
            </div>
          </MomentumCard>
        </RevealGroup>
      </section>
      <section id="webflow-cta" style={{ background: "var(--black)", padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", justifyContent: "center" }}>
        <SumateCTA courseName="Webflow Camp" weeks="6 semanas" targetId="webflow-programa" />
      </section>
      <section id="webflow-faq" style={{ background: "var(--black)", padding: "clamp(40px, 9vw, 80px) 64px", display: "flex", gap: "clamp(28px, 7vw, 64px)", flexWrap: "wrap" }}>
        <Reveal style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ font: "600 13px/1 'Inconsolata',monospace", letterSpacing: "0.1em", color: "var(--yellow)", textTransform: "uppercase" }}>
            Antes de empezar
          </span>
          <h2 style={{ font: "400 clamp(26px, 6.5vw, 40px)/1.15 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--white)", margin: 0 }}>
            ¿Tienes dudas? Aquí las resolvemos
          </h2>
          <p style={{ font: "300 16px/1.4 'Work Sans',sans-serif", color: "rgba(255,255,255,0.75)", margin: 0 }}>
            Sabemos que siempre surgen preguntas. Aquí te dejamos las respuestas a las dudas más frecuentes sobre Webflow Camp.
          </p>
        </Reveal>
        <Reveal delay={0.1} style={{ flex: 1, minWidth: 320 }}>
          <FaqAccordion items={WEBFLOW_FAQ} />
        </Reveal>
      </section>
      <SiteFooter />
    </>
  );
}

const TERMINAL_ACCENT: Record<string, string> = {
  npm: "#FF6B6B",
  flowmcp: "#FFBE00",
};

function TerminalLine({ line }: { line: string }) {
  const tokens = line.split(/(\s+)/);
  return (
    <>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        const isFirst = tokens.slice(0, i).every((t) => /^\s+$/.test(t));
        let color = "rgba(247,247,247,0.88)";
        let fontWeight = 400;
        if (isFirst && TERMINAL_ACCENT[token]) {
          color = TERMINAL_ACCENT[token];
          fontWeight = 700;
        } else if (/^<.+>$/.test(token)) {
          color = "#5FD0FF";
        } else if (/^-/.test(token)) {
          color = "#B5F4A5";
        } else if (["connect", "install", "debug"].includes(token)) {
          color = "#5FD0FF";
        }
        return (
          <span key={i} style={{ color, fontWeight }}>
            {token}
          </span>
        );
      })}
    </>
  );
}

function TerminalSnippet({ lines, style }: { lines: string[]; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "#161616",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        width: "100%",
        maxWidth: 520,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          background: "#242424",
          borderBottom: "1px solid rgba(247,247,247,0.08)",
        }}
      >
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57", display: "inline-block" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E", display: "inline-block" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840", display: "inline-block" }} />
        <span
          style={{
            flex: 1,
            textAlign: "center",
            font: "400 12px/1 'Inconsolata',monospace",
            color: "rgba(247,247,247,0.35)",
            marginRight: 33,
          }}
        >
          zsh — flowmcp
        </span>
      </div>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span style={{ font: "400 14px/1.5 'Inconsolata',monospace", color: "#28C840", flexShrink: 0 }}>❯</span>
            <span style={{ font: "400 14px/1.5 'Inconsolata',monospace", wordBreak: "break-all" }}>
              <TerminalLine line={line} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FLOWMCP_INSTALL_LINES = [
  "npm install -g @forhuman/flowmcp",
  "flowmcp connect <tu-org>",
  "flowmcp install <tu-org> claude-code",
];

const FLOWMCP_MICRO_FEATURES = ["JSON-first para agentes", "Diagnóstico incluido", "Bilingüe (ES/EN)", "Open source · MIT"];

const FLOWMCP_AGENTS = ["Claude Code", "Claude Desktop", "Cursor", "ChatGPT", "Codex"];

function FlowmcpBody() {
  return (
    <>
      <section id="flowmcp-inicio" style={{ padding: "clamp(32px, 8vw, 64px) 64px clamp(24px, 6vw, 56px) 64px", display: "flex", flexDirection: "column", gap: 24 }}>
        <Reveal>
          <Tag>CLI de código abierto · MIT License</Tag>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 style={{ font: "400 clamp(34px, 9vw, 56px)/1.05 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--black)", margin: 0, maxWidth: 820 }}>
            flowmcp
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p style={{ font: "300 clamp(16px, 4vw, 22px)/1.4 'Work Sans',sans-serif", color: "var(--black)", maxWidth: 640, margin: 0 }}>
            Conecta Webflow a tu agente de IA en un comando, sin que el token pase nunca por el contexto del agente.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ font: "600 12px/1 'Inconsolata',monospace", letterSpacing: "0.08em", color: "var(--gray-500)", textTransform: "uppercase" }}>
              Funciona con
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FLOWMCP_AGENTS.map((a) => (
                <Tag key={a}>{a}</Tag>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.18}>
          <TerminalSnippet lines={FLOWMCP_INSTALL_LINES} />
        </Reveal>
        <Reveal delay={0.24}>
          <div style={{ display: "flex", gap: 20, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
            <PrincipalButton
              variant="dark"
              onClick={() => window.open("https://github.com/fiorellacisneros/flowmcp", "_blank", "noopener,noreferrer")}
            >
              Ver en GitHub
            </PrincipalButton>
            <TextButton href="https://www.npmjs.com/package/@forhuman/flowmcp" target="_blank" rel="noopener noreferrer">
              Ver en npm
            </TextButton>
          </div>
        </Reveal>
      </section>
      <section id="flowmcp-problema" style={{ background: "var(--gray-100)", padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", flexDirection: "column", gap: 32 }}>
        <Reveal>
          <Header
            kicker="El problema"
            title="Cambiar de cliente no debería ser desconectar y reconectar"
            subtitle="Si manejas varios sitios de Webflow con tu agente de IA, ya conoces el ciclo: desconectas al cliente anterior, reinicias el agente, conectas al siguiente — o directamente pegas un token nuevo a mano cada vez. Con 5 clientes activos, eso son 5 reinicios por día, y un token pegado en un chat es un riesgo de seguridad."
            align="left"
          />
        </Reveal>
        <RevealGroup style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "stretch" }} itemStyle={{ flex: "1 1 320px", minWidth: 0 }}>
          <div
            style={{
              height: "100%",
              background: "var(--pure-white)",
              borderRadius: "var(--radius-md)",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxSizing: "border-box",
            }}
          >
            <span style={{ font: "600 13px/1 'Inconsolata',monospace", letterSpacing: "0.1em", color: "var(--gray-500)", textTransform: "uppercase" }}>
              Sin flowmcp
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, font: "400 20px/1.3 'Manrope',sans-serif", letterSpacing: "-0.02em", color: "var(--black)" }}>
              <span>Desconectar</span>
              <span style={{ color: "var(--gray-500)" }}>→</span>
              <span>Reiniciar</span>
              <span style={{ color: "var(--gray-500)" }}>→</span>
              <span>Reconectar</span>
              <span style={{ color: "var(--gray-500)" }}>→</span>
              <span style={{ color: "var(--gray-500)" }}>repetir por cliente</span>
            </div>
          </div>
          <div
            style={{
              height: "100%",
              background: "var(--black)",
              borderRadius: "var(--radius-md)",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxSizing: "border-box",
            }}
          >
            <span style={{ font: "600 13px/1 'Inconsolata',monospace", letterSpacing: "0.1em", color: "var(--yellow)", textTransform: "uppercase" }}>
              Con flowmcp
            </span>
            <div style={{ font: "400 20px/1.3 'Manrope',sans-serif", letterSpacing: "-0.02em", color: "var(--white)" }}>
              Un comando por cliente, una sola vez. Cada org queda conectado y aislado — cambias entre ellos sin desconectar nada.
            </div>
          </div>
        </RevealGroup>
      </section>
      <section id="flowmcp-como-funciona" style={{ padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", flexDirection: "column", gap: 32 }}>
        <Reveal>
          <Header
            kicker="3 pasos"
            title="Cómo funciona"
            subtitle="Conecta un org, instálalo en tu agente y verifica la conexión — con los comandos reales."
            align="left"
          />
        </Reveal>
        <RevealGroup style={{ display: "flex", gap: 20, flexWrap: "wrap" }} itemStyle={{ flex: "1 1 300px", minWidth: 0 }}>
          <CardAprendizaje
            number="01"
            label="Comando"
            title="Conecta tu org"
            body="flowmcp connect <org> — guarda las credenciales en Keychain (macOS) o vía sesión OAuth aislada. Ningún comando acepta ni imprime un token."
            style={{ width: "100%" }}
          />
          <CardAprendizaje
            number="02"
            label="Comando"
            title="Instálalo en tu agente"
            body="flowmcp install <org> <client> — conecta ese org a Claude Code, Claude Desktop, Cursor, ChatGPT o Codex con un solo comando."
            style={{ width: "100%" }}
          />
          <CardAprendizaje
            number="03"
            label="Comando"
            title="Verifica la conexión"
            body="flowmcp debug <org> — diagnostica en segundos por qué una conexión no funciona."
            style={{ width: "100%" }}
          />
        </RevealGroup>
        <Reveal delay={0.1}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {FLOWMCP_MICRO_FEATURES.map((f) => (
              <Tag key={f}>{f}</Tag>
            ))}
          </div>
        </Reveal>
      </section>
      <section id="flowmcp-seguridad" style={{ background: "var(--black)", padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", flexDirection: "column", gap: 20 }}>
        <Reveal>
          <Header
            kicker="Seguridad"
            kickerColor="var(--yellow)"
            title="El token nunca pasa por el agente"
            subtitle="Ningún comando de flowmcp acepta o imprime un token de API. Se guarda cifrado en Keychain de macOS, o vive en una sesión OAuth aislada — tu agente de IA solo ve el resultado de cada comando, nunca la credencial."
            align="left"
            color="var(--white)"
          />
        </Reveal>
      </section>
      <section id="flowmcp-agencias" style={{ padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", flexDirection: "column", gap: 20 }}>
        <Reveal>
          <Header
            kicker="Para agencias y freelancers"
            title="Un cliente, una conexión aislada"
            subtitle="Maneja tantos sitios de Webflow como necesites, de distintos clientes, sin mezclar credenciales entre ellos. flowmcp connect <org> por cada cliente — sin límite de cuántos manejas."
            align="left"
          />
        </Reveal>
      </section>
      <section id="flowmcp-cta" style={{ background: "var(--black)", padding: "clamp(32px, 8vw, 64px) 64px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Reveal style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
          <h2 style={{ font: "400 clamp(26px, 6.5vw, 40px)/1.15 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--white)", margin: 0 }}>
            Instala flowmcp
          </h2>
          <p style={{ font: "300 16px/1.4 'Work Sans',sans-serif", color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 480 }}>
            npm install -g @forhuman/flowmcp
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <PrincipalButton
              variant="primary"
              onClick={() => window.open("https://github.com/fiorellacisneros/flowmcp", "_blank", "noopener,noreferrer")}
            >
              Ver en GitHub
            </PrincipalButton>
            <TextButton
              href="https://www.forhuman.studio/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--yellow)" }}
            >
              Built by forhuman
            </TextButton>
          </div>
        </Reveal>
      </section>
      <SiteFooter />
    </>
  );
}

function StatIcon({ kind, color, size = 32 }: { kind: "live" | "graduate" | "layers"; color: string; size?: number }) {
  if (kind === "live") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="3.2" fill={color} />
        <path d="M10.5 10.5C8.5 12.5 8.5 19.5 10.5 21.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M21.5 10.5C23.5 12.5 23.5 19.5 21.5 21.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.5 6.5C2.83 10.83 2.83 21.17 6.5 25.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
        <path d="M25.5 6.5C29.17 10.83 29.17 21.17 25.5 25.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }
  if (kind === "graduate") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M16 8L29 14L16 20L3 14L16 8Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 17V23C9 23 12 26 16 26C20 26 23 23 23 23V17" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M27 15V22" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 5L28 11L16 17L4 11L16 5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 16.5L16 22.5L28 16.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 22L16 28L28 22" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STAT_VARIANTS: Record<"yellow" | "blue" | "light", { bg: string; text: string; sub: string }> = {
  yellow: { bg: "var(--yellow)", text: "var(--black)", sub: "rgba(13,13,13,0.65)" },
  blue: { bg: "var(--blue)", text: "var(--white)", sub: "rgba(247,247,247,0.7)" },
  light: { bg: "var(--white)", text: "var(--black)", sub: "var(--gray-600)" },
};

function StatCard({
  value,
  label,
  variant,
  icon,
  rotate = 0,
}: {
  value: string;
  label: string;
  variant: "yellow" | "blue" | "light";
  icon: "live" | "graduate" | "layers";
  rotate?: number;
}) {
  const c = STAT_VARIANTS[variant];
  return (
    <motion.div
      initial={{ rotate }}
      whileHover={{ rotate: 0, scale: 1.04, y: -8 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      style={{
        background: c.bg,
        borderRadius: "var(--radius-md)",
        padding: "32px 28px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxSizing: "border-box",
        minWidth: 200,
        boxShadow: "0 20px 40px rgba(13,13,13,0.18)",
      }}
    >
      <StatIcon kind={icon} color={c.text} />
      <span style={{ font: "700 clamp(48px, 10vw, 88px)/1 'Manrope',sans-serif", letterSpacing: "-0.04em", color: c.text, marginTop: 4 }}>
        {value}
      </span>
      <span style={{ font: "500 16px/1.3 'Work Sans',sans-serif", color: c.text, maxWidth: 220 }}>{label}</span>
    </motion.div>
  );
}

function FinderBody() {
  return (
    <>
      <section id="nosotras" style={{ padding: "clamp(40px, 9vw, 80px) 64px", display: "flex", flexDirection: "column", gap: 24 }}>
        <span style={{ font: "600 13px/1 'Inconsolata',monospace", letterSpacing: "0.1em", color: "var(--gray-500)", textTransform: "uppercase" }}>
          Nuestra historia
        </span>
        <h1 style={{ font: "400 clamp(32px, 8.5vw, 52px)/1.15 'Manrope',sans-serif", letterSpacing: "-0.03em", color: "var(--black)", margin: 0, maxWidth: 820 }}>
          De agencia a escuela: <span style={{ fontStyle: "italic", color: "var(--blue)" }}>así nació superHuman.</span>
        </h1>
        <p style={{ font: "300 clamp(16px, 4vw, 22px)/1.4 'Work Sans',sans-serif", color: "var(--black)", maxWidth: 720, margin: 0 }}>
          forHuman Studio es la primera agencia en Perú certificada como Webflow Expert y Webflow Educator. Después de construir sitios para decenas de marcas, decidimos enseñar lo que sabemos — así nació superHuman School.
        </p>
        <p style={{ font: "300 clamp(15px, 4vw, 20px)/1.4 'Work Sans',sans-serif", color: "var(--gray-500)", maxWidth: 720, margin: 0 }}>
          Hoy formamos builders que lanzan su propia marca, sin depender de agencias ni de código. Webflow Camp y Figma Camp son el punto de partida.
        </p>
      </section>
      <section
        id="cifras"
        style={{
          background: "var(--blue-light)",
          padding: "clamp(40px, 9vw, 80px) 64px",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(28px, 6vw, 40px)",
        }}
      >
        <Reveal>
          <Header
            kicker="En números"
            title="Resultados que hablan por nosotras"
            subtitle="Cifras reales de las primeras generaciones de superHuman School."
            align="left"
            kickerColor="var(--blue)"
            style={{ gap: 16 }}
          />
        </Reveal>
        <RevealGroup
          style={{ display: "flex", flexWrap: "wrap", gap: "clamp(20px, 4vw, 32px)", justifyContent: "center", alignItems: "flex-end", padding: "12px 0 24px" }}
        >
          <StatCard value="100%" label="Estudiantes practicando en vivo" variant="yellow" icon="live" rotate={-4} />
          <StatCard value="+200" label="Builders graduados en LATAM" variant="blue" icon="graduate" rotate={3} />
          <StatCard value="2" label="Programas: Webflow Camp y Figma Camp" variant="light" icon="layers" rotate={-2} />
        </RevealGroup>
      </section>
      <section id="mentores" className="shs-mentores-row" style={{ background: "var(--black)", padding: "clamp(40px, 9vw, 80px) 64px", display: "flex", gap: 48, flexWrap: "nowrap", alignItems: "center" }}>
        <Reveal style={{ flex: "1 1 320px", minWidth: 0 }}>
          <Header
            kicker="Quiénes te enseñan"
            kickerColor="rgba(255,255,255,0.6)"
            title="Aprende de Webflow Educators certificadas"
            subtitle="Mentoras activas en la industria, enseñando lo que aplican todos los días."
            align="left"
            color="var(--white)"
          />
        </Reveal>
        <RevealGroup style={{ display: "flex", gap: 24, flexWrap: "nowrap", flexShrink: 0, minWidth: 0 }}>
          <MomentumCard style={{ width: 260, borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/forhuman-lab/fio-cisneros.jpg" alt="Fiorella Cisneros" style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 20px", background: "linear-gradient(0deg, rgba(0,0,0,0.75), transparent)" }}>
              <div style={{ font: "500 20px/1 'Manrope',sans-serif", color: "var(--white)" }}>Fiorella Cisneros</div>
              <div style={{ font: "300 13px/1 'Work Sans',sans-serif", color: "rgba(255,255,255,0.8)" }}>Webflow Educator</div>
            </div>
          </MomentumCard>
          <MomentumCard style={{ width: 260, borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/forhuman-lab/mentor-1.jpg" alt="Danitza Rosas" style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 20px", background: "linear-gradient(0deg, rgba(0,0,0,0.75), transparent)" }}>
              <div style={{ font: "500 20px/1 'Manrope',sans-serif", color: "var(--white)" }}>Danitza Rosas</div>
              <div style={{ font: "300 13px/1 'Work Sans',sans-serif", color: "rgba(255,255,255,0.8)" }}>Webflow Designer</div>
            </div>
          </MomentumCard>
        </RevealGroup>
      </section>
      <SiteFooter />
    </>
  );
}

function FotosSection({ id, title, count }: { id: string; title: string; count: number }) {
  return (
    <div id={id} style={{ padding: "16px 20px 28px" }}>
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 14, aspectRatio: "16 / 8" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={REAL_PHOTOS[0]} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)" }} />
        <div style={{ position: "absolute", left: 16, bottom: 12, color: "#F7F7F7" }}>
          <div style={{ font: "700 22px/1 'Manrope',sans-serif" }}>{title}</div>
          <div style={{ font: "400 12px/1 'Work Sans',sans-serif", opacity: 0.85 }}>{count} fotos</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {Array.from({ length: count }).map((_, i) => (
          <PhotoSlot key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

function FotosBody() {
  return (
    <div className="shs-scroll" style={{ overflowY: "auto", flex: 1, background: "var(--white)", paddingBottom: 24 }}>
      <FotosSection id="favoritos" title="Favoritos" count={6} />
      <FotosSection id="mascotas" title="Mascotas" count={6} />
      <FotosSection id="recientes" title="Reciente" count={6} />
    </div>
  );
}

const SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/embed/playlist/1B4v3p7vMeE1GVJBMjd1Ft?utm_source=generator&theme=0";

function SpotifyBody() {
  return (
    <div style={{ flex: 1, background: "#0D0D0D", padding: 24, boxSizing: "border-box", overflowY: "auto" }}>
      <iframe
        title="Playlist de Spotify"
        style={{ borderRadius: 12, border: 0 }}
        src={SPOTIFY_PLAYLIST_URL}
        width="100%"
        height="352"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}

const FULL_MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatNotesDateTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${date.getDate()} de ${FULL_MONTHS[date.getMonth()]} de ${date.getFullYear()}, ${hours}:${minutes}`;
}

function SelectHighlight({
  children,
  className,
  dotColor,
  dotRatio = 0.55,
}: {
  children: ReactNode;
  className: string;
  dotColor: string;
  /** Dot diameter as a fraction of the highlighted text's own font-size (not the page's). */
  dotRatio?: number;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let rafId = 0;

    // Mutate the dot nodes' inline styles directly instead of going through
    // React state: setState + re-render is a frame or more slower than the
    // browser's own scroll compositing, which is what made the dots visibly
    // lag/detach from the text while scrolling. Writing style.left/top here
    // keeps them locked to the text on every single rAF tick.
    const measure = () => {
      const text = textRef.current;
      const [startDot, endDot] = dotRefs.current;
      if (!text || !startDot || !endDot) {
        rafId = requestAnimationFrame(measure);
        return;
      }
      // Ignore degenerate/zero-size fragments some browsers emit at wrap points.
      const rects = Array.from(text.getClientRects()).filter((r) => r.width > 0.5 && r.height > 0.5);
      if (rects.length) {
        const first = rects[0];
        const last = rects[rects.length - 1];
        const fontSize = parseFloat(getComputedStyle(text).fontSize) || 16;
        const size = fontSize * dotRatio;
        // iOS-style handles: start knob sits above the top of its line,
        // end knob sits below the bottom of its line.
        startDot.style.display = "block";
        startDot.style.left = `${first.left}px`;
        startDot.style.top = `${first.top}px`;
        startDot.style.width = `${size}px`;
        startDot.style.height = `${size}px`;
        endDot.style.display = "block";
        endDot.style.left = `${last.right}px`;
        endDot.style.top = `${last.bottom}px`;
        endDot.style.width = `${size}px`;
        endDot.style.height = `${size}px`;
      } else {
        // Text collapsed to zero size (e.g. a closed accordion/FAQ) — hide the
        // dots immediately instead of leaving them frozen at their last spot.
        startDot.style.display = "none";
        endDot.style.display = "none";
      }
      // Keep tracking continuously: the highlighted text sits inside animated
      // (Framer Motion) wrappers that move via transform, which resize/scroll
      // listeners never fire for — a rAF loop is the only reliable way to stay
      // pinned to the text through reveal animations and line-wrap changes.
      rafId = requestAnimationFrame(measure);
    };

    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [children, dotRatio]);

  const dotStyle: CSSProperties = {
    position: "fixed",
    display: "none",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    background: dotColor,
    pointerEvents: "none",
    zIndex: 9999,
  };

  return (
    <>
      <span ref={textRef} className={className}>
        {children}
      </span>
      {mounted &&
        createPortal(
          <>
            <span ref={(el) => { dotRefs.current[0] = el; }} style={dotStyle} />
            <span ref={(el) => { dotRefs.current[1] = el; }} style={dotStyle} />
          </>,
          document.body
        )}
    </>
  );
}

function ManifiestoHighlight({ children }: { children: ReactNode }) {
  return (
    <SelectHighlight className="shs-ios-select" dotColor="var(--yellow)" dotRatio={0.65}>
      {children}
    </SelectHighlight>
  );
}

function HeroKicker({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        font: "300 clamp(15px, 4vw, 17px)/1.5 'Work Sans',sans-serif",
        color: "var(--gray-600)",
        margin: 0,
        maxWidth: 640,
      }}
    >
      {children}
    </p>
  );
}

function HeroBig({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        font: "700 clamp(30px, 9vw, 60px)/1.05 'Manrope',sans-serif",
        letterSpacing: "-0.01em",
        textTransform: "uppercase",
        color: "var(--black)",
        margin: 0,
        maxWidth: 900,
      }}
    >
      {children}
    </p>
  );
}

function HeroHighlight({ children }: { children: ReactNode }) {
  return (
    <SelectHighlight className="shs-ios-select-blue" dotColor="var(--blue)" dotRatio={0.42}>
      {children}
    </SelectHighlight>
  );
}

function StripeTag() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px",
        borderRadius: 4,
        background: "var(--blue-light)",
        color: "var(--blue)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4v-6h16zm0-10H4V6h16z" />
      </svg>
      <span style={{ font: "300 14px/1 'Work Sans',sans-serif" }}>
        Pago seguro vía Stripe<span className="shs-desktop-only"> (Tarjetas de crédito o débito)</span>
      </span>
    </div>
  );
}

function HeroPunchBlock({ kicker, headline }: { kicker: ReactNode; headline: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <HeroKicker>{kicker}</HeroKicker>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/forhuman-lab/hero-ai-detection.png"
        alt="Detección de personas con IA, superpuesta sobre una foto de un cruce peatonal"
        style={{ width: "100%", height: "clamp(200px, 55vw, 480px)", objectFit: "cover", objectPosition: "top", borderRadius: "var(--radius-md)" }}
      />
      <HeroBig>{headline}</HeroBig>
    </div>
  );
}

function ManifiestoBody({ now, compact = false }: { now: Date | null; compact?: boolean }) {
  const pad = compact ? "16px 20px 40px" : "24px 56px 64px";
  return (
    <div style={{ padding: pad, display: "flex", flexDirection: "column", gap: compact ? 24 : 30, maxWidth: 720 }}>
      <span style={{ font: "400 13px/1 'Work Sans',sans-serif", color: "rgba(247,247,247,0.5)", textAlign: "center" }}>
        {now ? formatNotesDateTime(now) : ""}
      </span>
      <h1
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700,
          fontSize: compact ? 26 : 38,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          color: "#F7F7F7",
          margin: 0,
        }}
      >
        Aprender se aprende haciendo.
      </h1>
      <p style={{ font: `300 ${compact ? 15 : 18}px/1.6 'Work Sans',sans-serif`, color: "rgba(247,247,247,0.9)", margin: 0 }}>
        Creemos que el mejor diseño no se enseña con slides, se enseña construyendo. superHuman School nace de forHuman Studio: la misma agencia que factura, entrega y se equivoca en proyectos reales — ahora enseñando lo que de verdad usamos, no lo que se ve bien en un curso.
      </p>
      <p style={{ font: `300 ${compact ? 15 : 18}px/1.6 'Work Sans',sans-serif`, color: "rgba(247,247,247,0.9)", margin: 0 }}>
        No queremos graduados con certificado. Queremos builders con criterio: personas que salgan de acá sabiendo defender una decisión de diseño, no solo ejecutarla. Por eso cada camp lo dan quienes hoy mismo siguen
        <ManifiestoHighlight>trabajando con clientes reales, no solo enseñando teoría</ManifiestoHighlight>.
      </p>
      <p style={{ font: `300 ${compact ? 15 : 18}px/1.6 'Work Sans',sans-serif`, color: "rgba(247,247,247,0.9)", margin: 0 }}>
        En un mercado saturado de cursos grabados y certificados de fin de semana, el diferencial ya no es la herramienta, es el criterio. La IA acelera el build — la usamos todos los días en forHuman Studio — pero no reemplaza saber qué necesita un cliente, ni defender una decisión cuando algo no sale como el tutorial. Por eso no formamos gente que sepa apretar botones: formamos
        <ManifiestoHighlight>gente menos reemplazable</ManifiestoHighlight>.
      </p>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: compact ? 8 : 24 }}>
        <span style={{ font: `400 ${compact ? 30 : 38}px/1 'Reenie Beanie',cursive`, color: "#F7F7F7" }}>Dani y Fio</span>
      </div>
    </div>
  );
}

function ContactIcon({ contact, size = 64 }: { contact: WhatsAppContact; size?: number }) {
  const badge = Math.round(size * 0.37);
  return (
    <>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={contact.photo} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} alt={contact.name} />
        <div
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            width: badge,
            height: badge,
            borderRadius: Math.round(badge * 0.3),
            background: "url(/forhuman-lab/icon-whatsapp.svg) center / cover no-repeat",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
        />
      </div>
      <span
        style={{
          font: "400 11px/1.2 'Work Sans',sans-serif",
          color: "#F7F7F7",
          textShadow: "0 1px 3px rgba(0,0,0,0.6)",
          textAlign: "center",
          maxWidth: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {contact.name}
      </span>
    </>
  );
}

const dockIconBase: CSSProperties = { width: 56, height: 56, borderRadius: 14, cursor: "pointer", position: "relative" };

function DockTooltip({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(30,30,30,0.92)",
        backdropFilter: "blur(10px)",
        color: "#F7F7F7",
        font: "400 13px/1 'Work Sans',sans-serif",
        padding: "8px 14px",
        borderRadius: 9,
        whiteSpace: "nowrap",
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        zIndex: 5,
      }}
    >
      {label}
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid rgba(30,30,30,0.92)",
        }}
      />
    </div>
  );
}

const DOCK_MAGNIFY_RADIUS = 85;
const DOCK_MAGNIFY_MAX_SCALE = 1.22;
const DOCK_MAGNIFY_LIFT = 10;

function DockIcon({
  label,
  hoverId,
  hovered,
  onHover,
  onClick,
  open = false,
  mouseX,
  children,
}: {
  label: string;
  hoverId: HoverId;
  hovered: HoverId;
  onHover: (v: HoverId) => void;
  onClick?: () => void;
  open?: boolean;
  mouseX: number | null;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (mouseX === null || !ref.current) {
      setScale(1);
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const distance = Math.abs(mouseX - center);
    const linear = Math.max(0, 1 - distance / DOCK_MAGNIFY_RADIUS);
    const falloff = linear * linear;
    setScale(1 + falloff * (DOCK_MAGNIFY_MAX_SCALE - 1));
  }, [mouseX]);

  return (
    <div style={{ position: "relative" }} onMouseEnter={() => onHover(hoverId)} onMouseLeave={() => onHover(null)}>
      {hovered === hoverId && <DockTooltip label={label} />}
      <motion.div
        ref={ref}
        className="shs-dock-icon"
        onClick={onClick}
        animate={{ scale, y: -(scale - 1) * DOCK_MAGNIFY_LIFT }}
        whileTap={{ scale: scale * 0.9 }}
        transition={{ type: "spring", stiffness: 320, damping: 20, mass: 0.6 }}
        style={dockIconBase}
      >
        {children}
      </motion.div>
      {open && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -7,
            transform: "translateX(-50%)",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#F7F7F7",
          }}
        />
      )}
    </div>
  );
}

const MENU_BAR_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MENU_BAR_MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatMenuBarDateTime(date: Date) {
  const day = MENU_BAR_DAYS[date.getDay()];
  const month = MENU_BAR_MONTHS[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${date.getDate()} ${month}  ${hours}:${minutes}`;
}

export function MacDesktopExperience() {
  const [isMobile, setIsMobile] = useState(false);
  const [openApp, setOpenApp] = useState<AppId>(null);
  const [loadingApp, setLoadingApp] = useState<AppId>(null);
  const [closingApp, setClosingApp] = useState<AppId>(null);
  const [hoveredApp, setHoveredApp] = useState<HoverId>(null);
  const [dockMouseX, setDockMouseX] = useState<number | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [deviceScale, setDeviceScale] = useState(1);
  const [folderPos, setFolderPos] = useState({ x: 0, y: 52 });
  const [contactPositions, setContactPositions] = useState(
    WHATSAPP_CONTACTS.map((_, i) => ({ x: 0, y: 168 + i * 116 }))
  );
  const [finderSidebarOpen, setFinderSidebarOpen] = useState(false);
  const [finderSection, setFinderSection] = useState("nosotras");
  const [figmaSidebarOpen, setFigmaSidebarOpen] = useState(false);
  const [figmaSection, setFigmaSection] = useState("figma-inicio");
  const [webflowSidebarOpen, setWebflowSidebarOpen] = useState(false);
  const [webflowSection, setWebflowSection] = useState("webflow-inicio");
  const [flowmcpSidebarOpen, setFlowmcpSidebarOpen] = useState(false);
  const [flowmcpSection, setFlowmcpSection] = useState("flowmcp-inicio");
  const [fotosSidebarOpen, setFotosSidebarOpen] = useState(false);
  const [fotosSection, setFotosSection] = useState("favoritos");

  const goToSection = (setActive: (id: string) => void, id: string) => {
    setActive(id);
    smoothScrollToId(id);
  };

  useEffect(() => {
    if (window.innerWidth >= 860) {
      setFinderSidebarOpen(true);
      setFigmaSidebarOpen(true);
      setWebflowSidebarOpen(true);
      setFlowmcpSidebarOpen(true);
      setFotosSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 860);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const position = () => {
      const w = window.innerWidth;
      setFolderPos({ x: w - 168, y: 56 });
      setContactPositions([
        { x: w - 360, y: 220 },
        { x: w - 150, y: 320 },
      ]);
    };
    position();
    window.addEventListener("resize", position);
    return () => window.removeEventListener("resize", position);
  }, []);

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeather(FALLBACK_WEATHER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
          );
          const weatherData = await weatherRes.json();
          setWeather((prev) => ({
            ...(prev ?? FALLBACK_WEATHER),
            temp: Math.round(weatherData.current.temperature_2m),
            max: Math.round(weatherData.daily.temperature_2m_max[0]),
            min: Math.round(weatherData.daily.temperature_2m_min[0]),
            code: weatherData.current.weather_code,
          }));
        } catch {
          setWeather((prev) => prev ?? FALLBACK_WEATHER);
        }

        try {
          const geoRes = await fetch(`/api/reverse-geocode?latitude=${latitude}&longitude=${longitude}`);
          const geoData = await geoRes.json();
          if (geoData?.city) setWeather((prev) => ({ ...(prev ?? FALLBACK_WEATHER), city: geoData.city }));
        } catch {
          // keep whatever city we already have
        }
      },
      () => setWeather(FALLBACK_WEATHER),
      { timeout: 8000 }
    );
  }, []);

  const openWhatsApp = (contact: WhatsAppContact) => {
    const text = encodeURIComponent(`Hola ${contact.firstName}, me interesa el curso en vivo`);
    window.open(`https://api.whatsapp.com/send/?phone=%2B${contact.phone}&text=${text}&type=phone_number&app_absent=0`, "_blank", "noopener,noreferrer");
  };

  const closeApp = () => {
    setLoadingApp(null);
    if (!openApp) return;
    setClosingApp(openApp);
    setOpenApp(null);
    window.setTimeout(() => setClosingApp(null), 220);
  };

  const openWindow = (id: Exclude<AppId, null>) => {
    if (id !== "photos") {
      setOpenApp(id);
      return;
    }
    setLoadingApp(id);
    setOpenApp(null);
    window.setTimeout(() => {
      setOpenApp(id);
      setLoadingApp(null);
    }, 700);
  };

  const windowTitles: Record<Exclude<AppId, null>, string> = {
    figma: "superHuman — Figma Camp",
    webflow: "superHuman — Webflow Camp",
    flowmcp: "flowmcp — Webflow para tu agente de IA",
    finder: "Finder — forHuman",
    photos: "Fotos",
    notas: "Manifiesto.txt",
    spotify: "Spotify — Playlist",
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", fontFamily: "'Work Sans',sans-serif", background: "#000" }}>
      {!isMobile && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            background: "linear-gradient(160deg,#1c2c8f 0%,#012EDC 26%,#0D0D0D 68%,#000000 100%)",
          }}
        >
          {/* Menu bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              zIndex: 50,
              font: "400 13px/1 'Work Sans',sans-serif",
              color: "#F7F7F7",
              textShadow: "0 1px 3px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 14, height: 14, background: "url(/forhuman-lab/logo-superhuman.svg) center / contain no-repeat" }} />
              <span style={{ fontWeight: 700 }}>forHuman Lab</span>
              <span>Archivo</span>
              <span>Edición</span>
              <span>Ver</span>
              <span>Ventana</span>
              <span>Ayuda</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#F7F7F7" strokeWidth="2" />
                <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="#F7F7F7" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <svg width="16" height="12" viewBox="0 0 19 12">
                <path d="M9.5 3.2C11.8 3.2 13.9 4.1 15.4 5.6L16.5 4.5C14.7 2.7 12.2 1.5 9.5 1.5C6.8 1.5 4.3 2.7 2.5 4.5L3.6 5.6C5.1 4.1 7.2 3.2 9.5 3.2Z" fill="#F7F7F7" />
                <path d="M9.5 6.8C10.9 6.8 12.1 7.3 13 8.2L14.1 7.1C12.8 5.9 11.2 5.1 9.5 5.1C7.8 5.1 6.2 5.9 4.9 7.1L6 8.2C6.9 7.3 8.1 6.8 9.5 6.8Z" fill="#F7F7F7" />
                <circle cx="9.5" cy="10.5" r="1.5" fill="#F7F7F7" />
              </svg>
              <div style={{ width: 22, height: 11, border: "1.4px solid rgba(247,247,247,0.7)", borderRadius: 3, padding: 1.5, display: "flex", position: "relative" }}>
                <div style={{ width: "75%", height: "100%", background: "#F7F7F7", borderRadius: 1 }} />
                <div style={{ position: "absolute", right: -3, top: 3, width: 2, height: 5, background: "rgba(247,247,247,0.7)", borderRadius: "0 1px 1px 0" }} />
              </div>
              <span style={{ font: "400 13px/1 'Work Sans',sans-serif" }}>
                {now ? formatMenuBarDateTime(now) : ""}
              </span>
            </div>
          </div>

          {/* Widgets */}
          <div style={{ position: "absolute", top: 44, left: 24, display: "flex", flexDirection: "column", gap: 12, zIndex: 20, width: 320 }}>
            {/* Calendar widget */}
            <div
              style={{
                borderRadius: 20,
                background: "rgba(20,26,54,0.55)",
                backdropFilter: "blur(24px)",
                padding: 18,
                display: "flex",
                gap: 14,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                <span style={{ font: "600 11px/1 'Inconsolata',monospace", letterSpacing: "0.08em", color: "rgba(247,247,247,0.6)", textTransform: "uppercase" }}>
                  {now ? MENU_BAR_DAYS[now.getDay()] : ""}
                </span>
                <span style={{ font: "400 40px/1 'Manrope',sans-serif", color: "#F7F7F7", letterSpacing: "-0.03em" }}>{now ? now.getDate() : ""}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
                <span style={{ font: "600 11px/1 'Inconsolata',monospace", letterSpacing: "0.08em", color: "rgba(247,247,247,0.5)", textTransform: "uppercase" }}>Agosto</span>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 11px" }}>
                  <div style={{ font: "600 13px/1.3 'Work Sans',sans-serif", color: "#F7F7F7" }}>Webflow Camp</div>
                  <div style={{ font: "400 12px/1.3 'Inconsolata',monospace", color: "rgba(247,247,247,0.6)" }}>Mar y Jue · 7–9pm Perú</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 11px" }}>
                  <div style={{ font: "600 13px/1.3 'Work Sans',sans-serif", color: "#F7F7F7" }}>Figma Camp</div>
                  <div style={{ font: "400 12px/1.3 'Inconsolata',monospace", color: "rgba(247,247,247,0.6)" }}>Mar y Jue · 7–9pm Perú</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {/* Reminders-style widget */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  borderRadius: 20,
                  background: "rgba(28,22,20,0.55)",
                  backdropFilter: "blur(24px)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ font: "700 15px/1 'Work Sans',sans-serif", color: "#F7F7F7" }}>Hoy</span>
                  <span style={{ font: "500 12px/1 'Work Sans',sans-serif", color: "rgba(247,247,247,0.5)" }}>4</span>
                </div>
                {["Webflow Camp — Mar y Jue", "Figma Camp — Mar y Jue", "Cupos Early Bird", "Certificado final"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px rgba(247,247,247,0.5)", flexShrink: 0 }} />
                    <span
                      style={{
                        font: "300 12px/1.3 'Work Sans',sans-serif",
                        color: "rgba(247,247,247,0.92)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Weather-style widget */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  borderRadius: 20,
                  background: "rgba(28,22,20,0.55)",
                  backdropFilter: "blur(24px)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}
              >
                <span style={{ font: "600 13px/1 'Work Sans',sans-serif", color: "#F7F7F7" }}>{weather?.city ?? "—"}</span>
                <span style={{ font: "300 40px/1 'Manrope',sans-serif", color: "#F7F7F7", letterSpacing: "-0.03em" }}>
                  {weather ? `${weather.temp}°` : "—"}
                </span>
                {weather ? (
                  <WeatherIcon code={weather.code} />
                ) : (
                  <span style={{ height: 18 }} />
                )}
                <span style={{ font: "400 13px/1.3 'Work Sans',sans-serif", color: "rgba(247,247,247,0.85)" }}>
                  {weather ? WEATHER_LABELS[weather.code] ?? "Nublado" : "—"}
                </span>
                <span style={{ font: "300 12px/1.3 'Work Sans',sans-serif", color: "rgba(247,247,247,0.6)" }}>
                  {weather ? `Máx.: ${weather.max}° Mín.: ${weather.min}°` : "Máx.: — Mín.: —"}
                </span>
              </div>
            </div>
          </div>

          {/* Folder icon */}
          <div
            style={{ position: "absolute", left: folderPos.x, top: folderPos.y, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "grab", width: 84, zIndex: 20, userSelect: "none" }}
            onMouseDown={(e) => beginDrag(e, folderPos, setFolderPos, () => openWindow("finder"))}
          >
            <div style={{ width: 64, height: 59, background: "url(/forhuman-lab/icon-folder.svg) center / contain no-repeat" }} />
            <span style={{ font: "400 12px/1.2 'Work Sans',sans-serif", color: "#F7F7F7", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>forHuman</span>
          </div>

          {/* Dock */}
          <div
            onMouseMove={(e) => setDockMouseX(e.clientX)}
            onMouseLeave={() => setDockMouseX(null)}
            style={{
              position: "absolute",
              bottom: 14,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "flex-end",
              gap: 14,
              background: "rgba(247,247,247,0.25)",
              backdropFilter: "blur(24px)",
              borderRadius: 22,
              padding: "10px 14px",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)",
              zIndex: 30,
            }}
          >
            <DockIcon label="Finder" hoverId="finder" hovered={hoveredApp} onHover={setHoveredApp} onClick={() => openWindow("finder")} open={openApp === "finder"} mouseX={dockMouseX}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-finder-app.svg) center / cover no-repeat" }} />
            </DockIcon>
            <DockIcon label="Figma Camp" hoverId="figma" hovered={hoveredApp} onHover={setHoveredApp} onClick={() => openWindow("figma")} open={openApp === "figma"} mouseX={dockMouseX}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-figma.svg) center / cover no-repeat" }} />
            </DockIcon>
            <DockIcon label="Webflow Camp" hoverId="webflow" hovered={hoveredApp} onHover={setHoveredApp} onClick={() => openWindow("webflow")} open={openApp === "webflow"} mouseX={dockMouseX}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-webflow.svg) center / cover no-repeat" }} />
            </DockIcon>
            <DockIcon label="flowmcp" hoverId="flowmcp" hovered={hoveredApp} onHover={setHoveredApp} onClick={() => openWindow("flowmcp")} open={openApp === "flowmcp"} mouseX={dockMouseX}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-flowmcp.svg) center / cover no-repeat" }} />
            </DockIcon>
            <DockIcon label="Fotos" hoverId="photos" hovered={hoveredApp} onHover={setHoveredApp} onClick={() => openWindow("photos")} open={openApp === "photos" || loadingApp === "photos"} mouseX={dockMouseX}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-fotos.svg) center / cover no-repeat" }} />
            </DockIcon>
            <DockIcon label="Notas" hoverId="notas" hovered={hoveredApp} onHover={setHoveredApp} onClick={() => openWindow("notas")} open={openApp === "notas"} mouseX={dockMouseX}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-notas.svg) center / cover no-repeat" }} />
            </DockIcon>
            <DockIcon label="Spotify" hoverId="spotify" hovered={hoveredApp} onHover={setHoveredApp} onClick={() => openWindow("spotify")} open={openApp === "spotify"} mouseX={dockMouseX}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-spotify.svg) center / cover no-repeat" }} />
            </DockIcon>
          </div>

          {loadingApp === "photos" && (
            <WindowChrome title={windowTitles.photos} bg="#1c1c1e" onClose={closeApp}>
              <LoadingScreen />
            </WindowChrome>
          )}
          {(openApp === "figma" || closingApp === "figma") && (
            <WindowChrome
              title={windowTitles.figma}
              onClose={closeApp}
              closing={closingApp === "figma"}
              sidebarOpen={figmaSidebarOpen}
              onToggleSidebar={() => setFigmaSidebarOpen((v) => !v)}
              sidebar={<AppSidebar sections={FIGMA_SECTIONS} active={figmaSection} onSelect={(id) => goToSection(setFigmaSection, id)} open={figmaSidebarOpen} />}
            >
              <FigmaBody />
            </WindowChrome>
          )}
          {(openApp === "webflow" || closingApp === "webflow") && (
            <WindowChrome
              title={windowTitles.webflow}
              onClose={closeApp}
              closing={closingApp === "webflow"}
              sidebarOpen={webflowSidebarOpen}
              onToggleSidebar={() => setWebflowSidebarOpen((v) => !v)}
              sidebar={<AppSidebar sections={WEBFLOW_SECTIONS} active={webflowSection} onSelect={(id) => goToSection(setWebflowSection, id)} open={webflowSidebarOpen} />}
            >
              <WebflowBody />
            </WindowChrome>
          )}
          {(openApp === "flowmcp" || closingApp === "flowmcp") && (
            <WindowChrome
              title={windowTitles.flowmcp}
              onClose={closeApp}
              closing={closingApp === "flowmcp"}
              sidebarOpen={flowmcpSidebarOpen}
              onToggleSidebar={() => setFlowmcpSidebarOpen((v) => !v)}
              sidebar={<AppSidebar sections={FLOWMCP_SECTIONS} active={flowmcpSection} onSelect={(id) => goToSection(setFlowmcpSection, id)} open={flowmcpSidebarOpen} />}
            >
              <FlowmcpBody />
            </WindowChrome>
          )}
          {(openApp === "finder" || closingApp === "finder") && (
            <WindowChrome
              title={windowTitles.finder}
              onClose={closeApp}
              closing={closingApp === "finder"}
              sidebarOpen={finderSidebarOpen}
              onToggleSidebar={() => setFinderSidebarOpen((v) => !v)}
              sidebar={<AppSidebar sections={FINDER_SECTIONS} active={finderSection} onSelect={(id) => goToSection(setFinderSection, id)} open={finderSidebarOpen} />}
            >
              <FinderBody />
            </WindowChrome>
          )}
          {(openApp === "photos" || closingApp === "photos") && (
            <WindowChrome
              title={windowTitles.photos}
              bg="var(--white)"
              onClose={closeApp}
              closing={closingApp === "photos"}
              sidebarOpen={fotosSidebarOpen}
              onToggleSidebar={() => setFotosSidebarOpen((v) => !v)}
              sidebar={<AppSidebar label="Destacadas" sections={FOTOS_SECTIONS} active={fotosSection} onSelect={(id) => goToSection(setFotosSection, id)} open={fotosSidebarOpen} />}
              inset={{ left: "16%", right: "16%" }}
            >
              <FotosBody />
            </WindowChrome>
          )}
          {(openApp === "notas" || closingApp === "notas") && (
            <WindowChrome
              title={windowTitles.notas}
              bg="#0D0D0D"
              onClose={closeApp}
              closing={closingApp === "notas"}
              inset={{ left: "24%", right: "24%" }}
            >
              <ManifiestoBody now={now} />
            </WindowChrome>
          )}
          {(openApp === "spotify" || closingApp === "spotify") && (
            <WindowChrome
              title={windowTitles.spotify}
              bg="#0D0D0D"
              onClose={closeApp}
              closing={closingApp === "spotify"}
              inset={{ left: "30%", right: "30%" }}
            >
              <SpotifyBody />
            </WindowChrome>
          )}
        </div>
      )}

      {isMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            background: "linear-gradient(160deg,#1c2c8f 0%,#012EDC 30%,#0D0D0D 75%)",
          }}
        >
          <div
            style={{
              position: "fixed",
              left: "50%",
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
              transform: "translateX(-50%)",
              width: 134,
              height: 5,
              borderRadius: 100,
              background: "rgba(247,247,247,0.7)",
              zIndex: 90,
              pointerEvents: "none",
            }}
          />
          {loadingApp === "photos" && (
            <div
              className="shs-app-window"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 70,
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader size={30} />
            </div>
          )}

          {!openApp && !loadingApp && (
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "calc(env(safe-area-inset-top,0px) + 14px) 16px 0",
                  color: "#F7F7F7",
                  textShadow: "0 1px 3px rgba(0,0,0,0.35)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 13, height: 13, background: "url(/forhuman-lab/logo-superhuman.svg) center / contain no-repeat" }} />
                  <span style={{ font: "700 12px/1 'Work Sans',sans-serif" }}>forHuman Lab</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="10.5" viewBox="0 0 19 12">
                    <path d="M9.5 3.2C11.8 3.2 13.9 4.1 15.4 5.6L16.5 4.5C14.7 2.7 12.2 1.5 9.5 1.5C6.8 1.5 4.3 2.7 2.5 4.5L3.6 5.6C5.1 4.1 7.2 3.2 9.5 3.2Z" fill="#F7F7F7" />
                    <path d="M9.5 6.8C10.9 6.8 12.1 7.3 13 8.2L14.1 7.1C12.8 5.9 11.2 5.1 9.5 5.1C7.8 5.1 6.2 5.9 4.9 7.1L6 8.2C6.9 7.3 8.1 6.8 9.5 6.8Z" fill="#F7F7F7" />
                    <circle cx="9.5" cy="10.5" r="1.5" fill="#F7F7F7" />
                  </svg>
                  <div style={{ width: 19, height: 9.5, border: "1.2px solid rgba(247,247,247,0.7)", borderRadius: 3, padding: 1.5, display: "flex", position: "relative" }}>
                    <div style={{ width: "75%", height: "100%", background: "#F7F7F7", borderRadius: 1 }} />
                    <div style={{ position: "absolute", right: -2.5, top: 2.5, width: 1.5, height: 4, background: "rgba(247,247,247,0.7)", borderRadius: "0 1px 1px 0" }} />
                  </div>
                  <span style={{ font: "400 12px/1 'Work Sans',sans-serif" }}>{now ? formatMenuBarDateTime(now) : ""}</span>
                </div>
              </div>
              <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ borderRadius: 22, background: "rgba(13,13,13,0.4)", backdropFilter: "blur(24px)", padding: 16, display: "flex", flexDirection: "column", gap: 9, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                    <span style={{ font: "400 34px/1 'Manrope',sans-serif", color: "#F7F7F7", letterSpacing: "-0.03em" }}>{now ? now.getDate() : ""}</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ font: "600 10px/1 'Inconsolata',monospace", letterSpacing: "0.08em", color: "rgba(247,247,247,0.75)", textTransform: "uppercase" }}>
                        {now ? MENU_BAR_MONTHS[now.getMonth()] : ""}
                      </span>
                      <span style={{ font: "400 10px/1.2 'Inconsolata',monospace", color: "rgba(247,247,247,0.5)" }}>{now ? now.getFullYear() : ""}</span>
                    </div>
                  </div>
                  {[
                    ["Webflow Camp", "Mar y Jue · 7–9pm Perú"],
                    ["Figma Camp", "Mar y Jue · 7–9pm Perú"],
                  ].map(([title, detail]) => (
                    <div key={title} style={{ background: "rgba(255,255,255,0.09)", borderRadius: 10, padding: "8px 10px" }}>
                      <div style={{ font: "500 13px/1.3 'Work Sans',sans-serif", color: "#F7F7F7" }}>{title}</div>
                      <div style={{ font: "400 11px/1.3 'Inconsolata',monospace", color: "rgba(247,247,247,0.6)" }}>{detail}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderRadius: 22, background: "rgba(13,13,13,0.4)", backdropFilter: "blur(24px)", padding: 16, display: "flex", flexDirection: "column", gap: 10, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ font: "500 13px/1 'Work Sans',sans-serif", color: "#F7F7F7" }}>Próximos lanzamientos</span>
                    <span style={{ font: "600 11px/1 'Work Sans',sans-serif", color: "#F7F7F7", background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "3px 8px" }}>4</span>
                  </div>
                  {["Webflow Camp — Mar y Jue", "Figma Camp — Mar y Jue", "Cupos Early Bird limitados", "Certificado al completar"].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 15, height: 15, borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px rgba(247,247,247,0.55)", flexShrink: 0 }} />
                      <span style={{ font: "300 12px/1.3 'Work Sans',sans-serif", color: "rgba(247,247,247,0.92)" }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }} onClick={() => openWindow("photos")}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-fotos.svg) center / cover no-repeat", cursor: "pointer" }} />
                    <span style={{ font: "400 11px/1 'Work Sans',sans-serif", color: "#F7F7F7", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>Fotos</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }} onClick={() => openWindow("spotify")}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-spotify.svg) center / cover no-repeat", cursor: "pointer" }} />
                    <span style={{ font: "400 11px/1 'Work Sans',sans-serif", color: "#F7F7F7", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>Spotify</span>
                  </div>
                  {WHATSAPP_CONTACTS.map((contact) => (
                    <div
                      key={contact.name}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", width: "100%", minWidth: 0 }}
                      onClick={() => openWhatsApp(contact)}
                    >
                      <ContactIcon contact={contact} size={56} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "auto", padding: "10px 14px calc(env(safe-area-inset-bottom,0px) + 16px)", display: "flex", justifyContent: "center" }}>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", width: "100%", background: "rgba(247,247,247,0.22)", backdropFilter: "blur(24px)", borderRadius: 26, padding: "12px 14px", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} onClick={() => openWindow("finder")}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-finder-app.svg) center / cover no-repeat", cursor: "pointer" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} onClick={() => openWindow("figma")}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-figma.svg) center / cover no-repeat", cursor: "pointer" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} onClick={() => openWindow("webflow")}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-webflow.svg) center / cover no-repeat", cursor: "pointer" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} onClick={() => openWindow("flowmcp")}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-flowmcp.svg) center / cover no-repeat", cursor: "pointer" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} onClick={() => openWindow("notas")}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "url(/forhuman-lab/icon-notas.svg) center / cover no-repeat", cursor: "pointer" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {(openApp === "figma" || closingApp === "figma") && (
            <MobileScreen title={windowTitles.figma} bg="var(--white)" onClose={closeApp} closing={closingApp === "figma"}>
              <FigmaBody />
            </MobileScreen>
          )}

          {(openApp === "webflow" || closingApp === "webflow") && (
            <MobileScreen title={windowTitles.webflow} bg="var(--white)" onClose={closeApp} closing={closingApp === "webflow"}>
              <WebflowBody />
            </MobileScreen>
          )}

          {(openApp === "flowmcp" || closingApp === "flowmcp") && (
            <MobileScreen title={windowTitles.flowmcp} bg="var(--white)" onClose={closeApp} closing={closingApp === "flowmcp"}>
              <FlowmcpBody />
            </MobileScreen>
          )}

          {(openApp === "finder" || closingApp === "finder") && (
            <MobileScreen title={windowTitles.finder} bg="var(--white)" onClose={closeApp} closing={closingApp === "finder"}>
              <FinderBody />
            </MobileScreen>
          )}

          {(openApp === "photos" || closingApp === "photos") && (
            <MobileScreen title={windowTitles.photos} bg="var(--white)" onClose={closeApp} closing={closingApp === "photos"}>
              <FotosBody />
            </MobileScreen>
          )}

          {(openApp === "notas" || closingApp === "notas") && (
            <MobileScreen title={windowTitles.notas} bg="#0D0D0D" onClose={closeApp} closing={closingApp === "notas"}>
              <ManifiestoBody now={now} compact />
            </MobileScreen>
          )}

          {(openApp === "spotify" || closingApp === "spotify") && (
            <MobileScreen title={windowTitles.spotify} bg="#0D0D0D" onClose={closeApp} closing={closingApp === "spotify"}>
              <SpotifyBody />
            </MobileScreen>
          )}
        </div>
      )}
    </div>
  );
}
