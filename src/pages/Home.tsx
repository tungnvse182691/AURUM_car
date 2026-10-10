import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Gauge, Timer, Gem, ShieldCheck, ChevronDown } from "lucide-react";
import { api } from "../services/api";
import { IMG, formatVNDFull } from "../mocks/db";
import type { CarWithBrand } from "../types";
import { Marquee, CountUp, Reveal, SectionHead, Magnetic } from "../components/fx";
import CarCard from "../components/CarCard";

/* ═══════════ HERO — "Đêm ra mắt" ═══════════ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, 120]);

  return (
    <div ref={ref} className="grain relative flex h-[108svh] items-end overflow-hidden">
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
        <img src={IMG.heroMonaco} alt="Mercedes-AMG GT tại bến du thuyền Monaco" className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/35 to-obsidian/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian/70 via-transparent to-transparent" />

      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-28">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.8 }}
          className="flex items-center gap-3 font-condensed text-[11px] md:text-xs font-medium uppercase leading-loose tracking-[0.3em] md:tracking-[0.45em] text-champagne"
        >
          <span className="h-px w-10 shrink-0 bg-gold" /> Showroom ô tô hạng sang · Saigon
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.75, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-4xl font-display text-6xl leading-[1.02] text-ivory md:text-8xl"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Driven by <em className="text-gold not-italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>Gold.</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.95, duration: 0.8 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-ivory/70"
        >
          Nơi những cỗ máy vĩ đại nhất hành tinh tìm thấy chủ nhân xứng tầm. AURUM — chuẩn mực mới của sự xa xỉ.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.1, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <Magnetic>
            <Link to="/cars" data-cursor="Khám phá" className="group inline-flex items-center gap-3 bg-gold px-8 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian transition-colors hover:bg-champagne">
              Khám phá bộ sưu tập <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link to="/test-drive" className="inline-flex items-center gap-3 border border-ivory/30 px-8 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-ivory transition-colors hover:border-gold hover:text-gold">
              Đặt lịch lái thử
            </Link>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.4 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-ivory/50"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={22} />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ═══════════ FEATURED ═══════════ */
function Featured() {
  const [cars, setCars] = useState<CarWithBrand[]>([]);
  useEffect(() => {
    api.featuredCars().then((r) => setCars(r.data)).catch(() => {});
  }, []);

  if (!cars.length) return null;
  const [first, ...rest] = cars;
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <SectionHead kicker="Bộ sưu tập" title={<>Những tuyệt phẩm <em className="text-gold">đang chờ</em> chủ nhân</>} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <CarCard car={first} large />
        {rest.slice(0, 4).map((c) => (
          <CarCard key={c.id} car={c} />
        ))}
      </div>
      <Reveal className="mt-12 text-center">
        <Magnetic>
          <Link to="/cars" className="inline-flex items-center gap-3 border border-gold/50 px-8 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-obsidian">
            Xem toàn bộ bộ sưu tập <ArrowRight size={16} />
          </Link>
        </Magnetic>
      </Reveal>
    </section>
  );
}

/* ═══════════ CONFIGURATOR — "Phun sơn tại chỗ" ═══════════ */
const PAINTS = [
  { id: "obsidian", name: "Obsidian Black", hex: "#1a1a1e" },
  { id: "champagne", name: "Champagne Gold", hex: "#C9A96A" },
  { id: "burgundy", name: "Burgundy Noir", hex: "#4A1420" },
  { id: "emerald", name: "Emerald Night", hex: "#0E3B2E" },
  { id: "ivory", name: "Ivory Silk", hex: "#E8E2D4" },
];

function Configurator() {
  const [paint, setPaint] = useState(PAINTS[1]);
  const [sweepKey, setSweepKey] = useState(0);
  const price = 12100000000;

  const pick = (p: (typeof PAINTS)[number]) => {
    if (p.id === paint.id) return;
    setPaint(p);
    setSweepKey((k) => k + 1);
  };

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-coal py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead kicker="Xưởng sơn AURUM" title={<>Phun sơn <em className="text-gold">tại chỗ</em> — ngắm trước khi quyết</>} />
        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_360px]">
          <Reveal className="relative overflow-hidden border border-white/10">
            <div className="relative aspect-[16/9]">
              <img src={IMG.amgGtrGold} alt="Mercedes-AMG GT R" className="h-full w-full object-cover" />
              {/* paint tint */}
              <div
                className="absolute inset-0 transition-all duration-700"
                style={{ backgroundColor: paint.hex, mixBlendMode: "color", opacity: paint.id === "obsidian" ? 0.25 : paint.id === "champagne" ? 0.45 : 0.6 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              {/* spray sweep */}
              <div key={sweepKey} className="pointer-events-none absolute inset-y-0 w-1/3 animate-[spray_1.1s_ease-out_forwards] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              <div className="absolute bottom-5 left-6">
                <p className="font-condensed text-xs uppercase tracking-[0.35em] text-champagne">Mercedes-AMG GT R</p>
                <p className="mt-1 font-display text-3xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{paint.name}</p>
              </div>
            </div>
            <style>{`@keyframes spray { from { left: -35%; } to { left: 110%; } }`}</style>
          </Reveal>

          <Reveal delay={0.15} className="flex flex-col gap-6">
            <p className="text-sm leading-relaxed text-ash">
              Chọn màu sơn — xưởng AURUM sẽ phun thử ngay trên ảnh thực tế. Màu sắc thay đổi, đẳng cấp thì không.
            </p>
            <div className="flex flex-wrap gap-3">
              {PAINTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pick(p)}
                  data-cursor="Sơn"
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                    paint.id === p.id ? "scale-110 border-gold" : "border-white/20 hover:border-white/50"
                  }`}
                  style={{ backgroundColor: p.hex }}
                  aria-label={p.name}
                >
                  {paint.id === p.id && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                </button>
              ))}
            </div>
            <div className="border border-white/10 bg-obsidian/60 p-6">
              <p className="font-condensed text-xs uppercase tracking-[0.3em] text-ash">Giá dự kiến lăn bánh</p>
              <p className="mt-2 font-condensed text-4xl font-semibold tracking-wide text-gold">
                <CountUp key={paint.id} to={price} />
                <span className="ml-2 text-lg text-ash">₫</span>
              </p>
              <p className="mt-1 text-xs text-ash/70">{formatVNDFull(price)} · đã gồm VAT</p>
              <Magnetic>
                <Link to="/loan-calculator" className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-gold px-6 py-3.5 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian transition-colors hover:bg-champagne">
                  Tính trả góp <ArrowRight size={16} />
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════ STATS BAND ═══════════ */
function Stats() {
  const stats = [
    { icon: Gem, value: 10, suffix: "", label: "Siêu phẩm đang trưng bày" },
    { icon: Gauge, value: 759, suffix: " HP", label: "Công suất tối đa" },
    { icon: Timer, value: 2.9, suffix: "s", decimals: 1, label: "Tăng tốc 0–100 nhanh nhất" },
    { icon: ShieldCheck, value: 100, suffix: "%", label: "Pháp lý minh bạch" },
  ];
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1} className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <s.icon size={20} className="text-gold/80" />
            <p className="font-condensed text-5xl font-semibold tracking-wide text-ivory">
              <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </p>
            <p className="font-condensed text-xs uppercase tracking-[0.25em] text-ash">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ SHOWROOM ═══════════ */
function Showroom() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="grain relative overflow-hidden border border-white/10">
          <img src={IMG.garage} alt="Gara trưng bày AURUM" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <p className="font-condensed text-xs uppercase tracking-[0.35em] text-champagne">Private Garage</p>
              <p className="mt-1 font-display text-3xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Gara trong mơ</p>
            </div>
          </div>
        </Reveal>
        <div>
          <SectionHead align="left" kicker="Trải nghiệm" title={<>Không phải showroom.<br />Là <em className="text-gold">thánh đường</em> tốc độ.</>} />
          <Reveal delay={0.1}>
            <p className="mt-6 leading-relaxed text-ash">
              Ánh sáng được tính toán từng lux, nhiệt độ và độ ẩm kiểm soát 24/7, mỗi chiếc xe đậu trên bệ xoay riêng. Anh không đến xem xe — anh đến dự một buổi trình diễn.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <ul className="mt-8 space-y-4">
              {["Đường chạy thử private 2km trong khuôn viên", "Chuyên gia tư vấn 1-kèm-1, cà phê pha máy", "Xưởng detailing & bảo dưỡng đạt chuẩn hãng"].map((t) => (
                <li key={t} className="flex items-center gap-4 border-b border-white/10 pb-4 text-[15px] text-ivory/85">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-gold/50 text-gold"><ShieldCheck size={15} /></span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.3} className="mt-8">
            <Magnetic>
              <Link to="/test-drive" data-cursor="Đặt lịch" className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian transition-colors hover:bg-champagne">
                Đặt lịch tham quan <ArrowUpRight size={16} />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════ PAGE ═══════════ */
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee items={["Driven by Gold", "Mercedes-AMG", "Porsche", "Lamborghini", "Audi Sport", "BMW M", "Range Rover", "Est. 2026 · Saigon"]} />
      <Featured />
      <Configurator />
      <Stats />
      <Showroom />
    </>
  );
}
