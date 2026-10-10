import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import AurumLogo from "./brand/AurumLogo";

/* ── Cinematic preloader: logo shimmer + % + curtain reveal ── */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const DUR = 2000;
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(100, Math.round(((t - start) / DUR) * 100));
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-obsidian"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="relative">
        <AurumLogo variant="icon" glow className="h-28 w-28" />
        {/* shimmer sweep */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="h-full w-1/3 animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>
      </div>
      <div className="mt-6 overflow-hidden">
        <motion.p
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center font-cinzel text-xl tracking-[0.45em] text-ivory"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          AURUM
        </motion.p>
      </div>
      <p className="mt-3 font-condensed text-sm tracking-[0.3em] text-oldgold">
        {String(progress).padStart(3, "0")}%
      </p>
      <div className="mt-4 h-px w-48 bg-white/10">
        <div className="h-full bg-gradient-to-r from-oldgold to-champagne transition-all" style={{ width: `${progress}%` }} />
      </div>
      <style>{`@keyframes shimmer { 0% { transform: translateX(-120%);} 100% { transform: translateX(420%);} }`}</style>
    </motion.div>
  );
}

/* ── Custom cursor: dot + trailing gold ring, label on [data-cursor] ── */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 32 });
  const ry = useSpring(y, { stiffness: 350, damping: 32 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.body.style.cursor = "none";
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = (e.target as HTMLElement).closest("[data-cursor]");
      setLabel(t?.getAttribute("data-cursor") || null);
      setHovering(!!(e.target as HTMLElement).closest("a,button"));
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      document.body.style.cursor = "";
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[200] h-1.5 w-1.5 rounded-full bg-gold" style={{ x, y, translateX: "-50%", translateY: "-50%" }} />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] flex items-center justify-center rounded-full border border-gold/60"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: label ? 88 : hovering ? 52 : 34,
          height: label ? 88 : hovering ? 52 : 34,
          backgroundColor: label ? "rgba(212,175,55,0.92)" : "rgba(212,175,55,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        {label && (
          <span className="px-2 text-center font-condensed text-[11px] font-semibold uppercase tracking-[0.18em] text-obsidian">
            {label}
          </span>
        )}
      </motion.div>
    </>
  );
}

/* ── Magnetic wrapper: pulls children toward cursor ── */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 16 });
  const sy = useSpring(y, { stiffness: 200, damping: 16 });

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ x: sx, y: sy }} className="inline-block">
      {children}
    </motion.div>
  );
}

/* ── Gold marquee band ── */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-coal/60 py-4">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-10">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-condensed text-sm font-medium uppercase tracking-[0.35em] text-champagne">{t}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" className="text-gold"><path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" /></svg>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0);} to { transform: translateX(-33.333%);} }`}</style>
    </div>
  );
}

/* ── 3D tilt card with glare sheen ── */
export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setStyle({ rx: (0.5 - py) * 10, ry: (px - 0.5) * 12, gx: px * 100, gy: py * 100 });
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setStyle({ rx: 0, ry: 0, gx: 50, gy: 50 })}
      className={`[perspective:1200px] ${className}`}
    >
      <div
        className="relative h-full transition-transform duration-200 ease-out [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${style.rx}deg) rotateY(${style.ry}deg)` }}
      >
        {children}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{ background: `radial-gradient(circle at ${style.gx}% ${style.gy}%, rgba(255,255,255,0.14), transparent 55%)` }}
        />
      </div>
    </div>
  );
}

/* ── Animated counter (spec numbers) ── */
export function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const DUR = 1600;
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DUR);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {decimals > 0
        ? val.toFixed(decimals).replace(".", ",")
        : Math.round(val).toLocaleString("vi-VN")}
      {suffix}
    </span>
  );
}

/* ── Scroll reveal wrapper ── */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Section heading: kicker + serif title ── */
export function SectionHead({ kicker, title, align = "center" }: { kicker: string; title: ReactNode; align?: "center" | "left" }) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Reveal className={`flex flex-col ${alignCls} gap-4`}>
      <span className="flex items-center gap-3 font-condensed text-xs font-medium uppercase tracking-[0.4em] text-oldgold">
        <span className="h-px w-8 bg-oldgold/60" />
        {kicker}
        <span className="h-px w-8 bg-oldgold/60" />
      </span>
      <h2 className="max-w-3xl font-display text-4xl leading-tight text-ivory md:text-5xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {title}
      </h2>
    </Reveal>
  );
}

export { AnimatePresence };
