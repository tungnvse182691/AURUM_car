import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Scale, CalendarCheck, BadgeCheck, ChevronRight, Gauge, Fuel, Cog, Users, Timer, Palette, Hash, ArrowLeft } from "lucide-react";
import { api } from "../services/api";
import { formatVND, formatVNDFull } from "../mocks/db";
import type { CarWithBrand } from "../types";
import { useShopStore } from "../stores/useShopStore";
import LoanCalculator from "../components/LoanCalculator";
import CarCard from "../components/CarCard";
import { Reveal, Magnetic } from "../components/fx";

function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  return (
    <div>
      <div className="grain relative aspect-[16/10] overflow-hidden border border-white/10 bg-carbon">
        <AnimatePresence mode="wait">
          <motion.img
            key={idx}
            src={images[idx]}
            alt={alt}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute bottom-4 right-4 bg-obsidian/70 px-3 py-1.5 font-condensed text-xs tracking-[0.2em] text-ivory backdrop-blur">
          {idx + 1} / {images.length}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`relative aspect-[16/10] overflow-hidden border transition-all ${idx === i ? "border-gold" : "border-white/10 opacity-60 hover:opacity-100"}`}
          >
            <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CarDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [car, setCar] = useState<(CarWithBrand & { related: CarWithBrand[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toggleFavorite, isFavorite, toggleCompare, isComparing } = useShopStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .carDetail(slug)
      .then((r) => {
        setCar(r.data);
        setNotFound(false);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-obsidian pt-28">
        <div className="mx-auto max-w-7xl animate-pulse px-6 pb-24">
          <div className="h-4 w-64 bg-white/10" />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="aspect-[16/10] bg-white/5" />
            <div className="space-y-4"><div className="h-8 bg-white/10" /><div className="h-8 w-2/3 bg-gold/20" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !car) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-obsidian px-6 text-center">
        <p className="font-display text-5xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Không tìm thấy xe</p>
        <Link to="/cars" className="mt-6 inline-flex items-center gap-2 border border-gold/60 px-6 py-3 font-condensed text-xs uppercase tracking-[0.25em] text-gold hover:bg-gold hover:text-obsidian">
          <ArrowLeft size={15} /> Về bộ sưu tập
        </Link>
      </div>
    );
  }

  const price = car.promoPrice ?? car.price;
  const fav = isFavorite(car.id);
  const cmp = isComparing(car.id);

  const specs = [
    { icon: Cog, label: "Động cơ", value: car.engine },
    { icon: Gauge, label: "Công suất", value: `${car.powerHp} HP` },
    { icon: Timer, label: "Mô-men xoắn", value: `${car.torqueNm} Nm` },
    { icon: Fuel, label: "Nhiên liệu", value: `${car.fuel} · ${car.consumption}L/100km` },
    { icon: Cog, label: "Hộp số", value: car.transmission === "AT" ? "Tự động" : "Số sàn" },
    { icon: Users, label: "Số chỗ / cửa", value: `${car.seats} chỗ · ${car.doors} cửa` },
    { icon: Palette, label: "Màu ngoại / nội thất", value: `${car.extColor} / ${car.intColor}` },
    { icon: Hash, label: "Số VIN", value: car.vin },
  ];

  return (
    <div className="bg-obsidian pt-24">
      <div className="mx-auto max-w-7xl px-6 pb-24">
        {/* breadcrumb */}
        <nav className="flex items-center gap-2 py-6 font-condensed text-xs uppercase tracking-[0.2em] text-ash">
          <Link to="/" className="hover:text-gold">Trang chủ</Link>
          <ChevronRight size={13} />
          <Link to="/cars" className="hover:text-gold">Bộ sưu tập</Link>
          <ChevronRight size={13} />
          <span className="text-ivory">{car.brandName} {car.model}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* left: gallery + specs */}
          <div>
            <Gallery images={car.images} alt={`${car.brandName} ${car.model}`} />

            <Reveal className="mt-10">
              <h2 className="font-condensed text-sm font-semibold uppercase tracking-[0.3em] text-gold">Thông số kỹ thuật</h2>
              <div className="mt-5 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
                {specs.map((s) => (
                  <div key={s.label} className="flex items-start gap-4 bg-obsidian p-5">
                    <s.icon size={18} className="mt-0.5 shrink-0 text-gold/80" />
                    <div>
                      <p className="font-condensed text-[11px] uppercase tracking-[0.25em] text-ash">{s.label}</p>
                      <p className="mt-1 text-[15px] text-ivory">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="font-condensed text-sm font-semibold uppercase tracking-[0.3em] text-gold">Mô tả</h2>
              <p className="mt-4 leading-relaxed text-ivory/80">{car.description}</p>
              <h2 className="mt-8 font-condensed text-sm font-semibold uppercase tracking-[0.3em] text-gold">Trang bị nổi bật</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {car.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm text-ivory/85">
                    <BadgeCheck size={16} className="shrink-0 text-gold" /> {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* right: sticky summary */}
          <div>
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="font-condensed text-xs uppercase tracking-[0.35em] text-champagne">{car.brandName}</p>
                <h1 className="mt-2 font-display text-4xl leading-tight text-ivory md:text-5xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {car.model} <span className="text-2xl text-ash">{car.trim}</span>
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 font-condensed text-xs uppercase tracking-[0.2em]">
                  <span className="border border-white/15 px-3 py-1.5 text-ash">{car.year}</span>
                  <span className="border border-white/15 px-3 py-1.5 text-ash">{car.mileage === 0 ? "Mới 100%" : `${car.mileage.toLocaleString("vi-VN")} km`}</span>
                  <span className={`border px-3 py-1.5 ${car.status === "available" ? "border-emerald-700 bg-emerald-deep/40 text-emerald-300" : "border-gold/60 text-gold"}`}>
                    {car.status === "available" ? "Sẵn giao" : car.status === "reserved" ? "Đã giữ chỗ" : "Đã bán"}
                  </span>
                </div>

                <div className="mt-6 border-y border-white/10 py-5">
                  {car.promoPrice && <p className="text-sm text-ash line-through">{formatVNDFull(car.price)}</p>}
                  <p className="font-condensed text-5xl font-semibold tracking-wide text-gold">{formatVND(price)}</p>
                  <p className="mt-1 text-xs text-ash">Đã gồm VAT · Hỗ trợ trả góp đến 80%</p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => toggleFavorite(car.id)}
                    className={`flex items-center justify-center gap-2 border py-3.5 font-condensed text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                      fav ? "border-gold bg-gold text-obsidian" : "border-white/20 text-ivory hover:border-gold hover:text-gold"
                    }`}
                  >
                    <Heart size={15} fill={fav ? "currentColor" : "none"} /> {fav ? "Đã lưu" : "Yêu thích"}
                  </button>
                  <button
                    onClick={() => toggleCompare(car.id)}
                    className={`flex items-center justify-center gap-2 border py-3.5 font-condensed text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                      cmp ? "border-gold bg-gold text-obsidian" : "border-white/20 text-ivory hover:border-gold hover:text-gold"
                    }`}
                  >
                    <Scale size={15} /> {cmp ? "Đã thêm" : "So sánh"}
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  <Magnetic>
                    <Link to="/test-drive" className="flex w-full items-center justify-center gap-2 bg-gold px-2 py-4 text-center font-condensed text-sm font-semibold uppercase tracking-[0.16em] text-obsidian transition-colors hover:bg-champagne">
                      <CalendarCheck size={16} className="shrink-0" /> Đặt lịch lái thử
                    </Link>
                  </Magnetic>
                  <Link to="/contact" className="flex w-full items-center justify-center gap-2 border border-white/25 px-2 py-4 text-center font-condensed text-sm font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:border-gold hover:text-gold">
                    Đặt cọc giữ xe
                  </Link>
                </div>

                <div className="mt-6">
                  <LoanCalculator carPrice={price} compact />
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* related */}
        {car.related.length > 0 && (
          <div className="mt-24">
            <Reveal>
              <h2 className="text-center font-condensed text-sm font-semibold uppercase tracking-[0.3em] text-gold">Có thể anh cũng thích</h2>
              <p className="mt-3 text-center font-display text-4xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Những tuyệt phẩm tương tự
              </p>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {car.related.map((c) => (
                <CarCard key={c.id} car={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
