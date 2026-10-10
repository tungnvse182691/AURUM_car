import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Volume2, VolumeX, MousePointer2 } from "lucide-react";
import type { CarWithBrand } from "../types";
import { playEngineSound, engineCharacter } from "../utils/engineSound";

/**
 * DARK ROOM — phòng tối trình diễn xe.
 * Spotlight bám theo chuột, bật/tắt đèn pha, nghe tiếng máy synth realtime.
 */
export default function DarkRoom({ car }: { car: CarWithBrand }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lights, setLights] = useState(false);
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  const toggleSound = () => {
    if (playing) {
      stopRef.current?.();
      stopRef.current = null;
      setPlaying(false);
      return;
    }
    stopRef.current = playEngineSound(engineCharacter(car.engine, car.fuel));
    setPlaying(true);
    setTimeout(() => setPlaying(false), 5000);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="grain relative flex min-h-[92vh] flex-col overflow-hidden bg-black"
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "40%" }}
    >
      {/* car, dimmed until spotlight reveals */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <motion.img
          src={car.images[0]}
          alt={`${car.brandName} ${car.model} trong phòng tối`}
          initial={{ opacity: 0, scale: 1.06 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2 }}
          className="max-h-[72vh] w-auto max-w-6xl object-contain"
          style={{ filter: "brightness(0.55) contrast(1.08) saturate(0.92)" }}
        />
      </div>

      {/* spotlight follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(520px circle at var(--mx) var(--my), rgba(212,175,55,0.14), rgba(0,0,0,0.88) 68%)",
        }}
      />
      {/* vignette */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.9) 100%)" }} />

      {/* headlight beams */}
      <AnimatePresence>
        {lights && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute left-[16%] top-[46%] h-40 w-40 rounded-full bg-yellow-100/90 blur-3xl" />
            <div className="absolute right-[16%] top-[46%] h-40 w-40 rounded-full bg-yellow-100/90 blur-3xl" />
            <div
              className="absolute left-[10%] top-[48%] h-[46vh] w-[38vw] origin-right"
              style={{ background: "linear-gradient(100deg, rgba(255,244,200,0.20), transparent 70%)", transform: "skewY(6deg)" }}
            />
            <div
              className="absolute right-[10%] top-[48%] h-[46vh] w-[38vw] origin-left"
              style={{ background: "linear-gradient(260deg, rgba(255,244,200,0.20), transparent 70%)", transform: "skewY(-6deg)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* header copy */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 text-center">
        <p className="font-condensed text-xs uppercase tracking-[0.45em] text-gold">AURUM Dark Room</p>
        <h2 className="mt-4 font-display text-4xl text-ivory md:text-6xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Bóng tối <em className="text-gold">tôn vinh</em> đường nét
        </h2>
        <p className="mx-auto mt-3 flex max-w-md items-center justify-center gap-2 text-xs text-ash">
          <MousePointer2 size={13} className="text-gold/70" /> Di chuột để dọi đèn — bật đèn pha, nghe tiếng máy thật
        </p>
      </div>

      {/* controls */}
      <div className="relative z-10 mt-auto flex flex-wrap items-center justify-center gap-3 px-6 pb-14">
        <button
          onClick={() => setLights(!lights)}
          className={`flex items-center gap-2.5 border px-7 py-4 font-condensed text-xs font-semibold uppercase tracking-[0.22em] transition-all ${
            lights ? "border-yellow-200 bg-yellow-100/90 text-obsidian shadow-[0_0_40px_rgba(255,240,180,0.45)]" : "border-gold/60 text-gold hover:bg-gold hover:text-obsidian"
          }`}
        >
          <Lightbulb size={15} /> {lights ? "Tắt đèn pha" : "Bật đèn pha"}
        </button>
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2.5 border px-7 py-4 font-condensed text-xs font-semibold uppercase tracking-[0.22em] transition-all ${
            playing ? "border-gold bg-gold text-obsidian" : "border-white/25 text-ivory hover:border-gold hover:text-gold"
          }`}
        >
          {playing ? <VolumeX size={15} /> : <Volume2 size={15} />}
          {playing ? "Đang gầm..." : "Nghe tiếng máy"}
        </button>
      </div>

      {/* spec ticker */}
      <div className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-10 px-6 py-5 font-condensed text-xs uppercase tracking-[0.25em]">
          <span className="text-ash">{car.engine}</span>
          <span className="h-4 w-px bg-gold/40" />
          <span className="text-gold">{car.powerHp} HP</span>
          <span className="h-4 w-px bg-gold/40" />
          <span className="text-ash">{car.torqueNm} Nm</span>
        </div>
      </div>
    </div>
  );
}
