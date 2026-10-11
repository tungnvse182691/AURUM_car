import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Palette, CircleDot, Sofa, Package, Save, Trash2, ArrowRight, Sparkles, Box, Image as ImageIcon } from "lucide-react";
import { api } from "../services/api";
import { formatVND } from "../mocks/db";
import { useStudioStore, PAINTS, WHEELS, INTERIORS, PACKAGES, studioPrice } from "../stores/useStudioStore";
import Car3DViewer from "../components/studio/Car3DViewer";
import type { CarWithBrand } from "../types";
import { Reveal } from "../components/fx";

const TABS = [
  { id: "paint", label: "Màu sơn", icon: Palette },
  { id: "wheels", label: "Mâm xe", icon: CircleDot },
  { id: "interior", label: "Nội thất", icon: Sofa },
  { id: "packages", label: "Gói trang bị", icon: Package },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Studio() {
  const [cars, setCars] = useState<CarWithBrand[]>([]);
  const [tab, setTab] = useState<TabId>("paint");
  const [saved, setSaved] = useState(false);
  const [view3d, setView3d] = useState(false);
  const s = useStudioStore();

  useEffect(() => {
    api.cars().then((r) => {
      setCars(r.data);
      if (!useStudioStore.getState().carId && r.data.length) {
        useStudioStore.getState().setCar(r.data[0].id);
      }
    }).catch(() => {});
  }, []);

  const car = useMemo(() => cars.find((c) => c.id === s.carId) ?? cars[0], [cars, s.carId]);
  const paint = PAINTS.find((p) => p.id === s.paintId) ?? PAINTS[0];
  const price = useMemo(
    () => (car ? studioPrice(car.promoPrice ?? car.price, s) : null),
    [car, s.paintId, s.wheelId, s.interiorId, s.packageIds],
  );
  const total = price ? price.base + price.options : 0;

  const doSave = () => {
    if (!car) return;
    s.saveBuild(`${car.brandName} ${car.model}`, total);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  if (!car) {
    return <div className="flex min-h-screen items-center justify-center bg-obsidian text-ash">Đang tải xưởng thiết kế...</div>;
  }

  return (
    <div className="bg-obsidian pt-24">
      <div className="mx-auto max-w-7xl px-6 pb-24">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-condensed text-xs uppercase tracking-[0.4em] text-gold">
              <Sparkles size={14} /> AURUM Atelier
            </p>
            <h1 className="mt-3 font-display text-5xl text-ivory md:text-6xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Xưởng <em className="text-gold">thiết kế</em>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ash">
              Tự tay cấu hình chiếc AURUM của riêng bạn — màu sơn, mâm xe, nội thất và gói trang bị.
              Mọi lựa chọn cập nhật giá trực tiếp.
            </p>
          </div>
        </div>

        {/* car selector */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {cars.map((c) => (
            <button
              key={c.id}
              onClick={() => s.setCar(c.id)}
              className={`group relative w-44 shrink-0 overflow-hidden border text-left transition-all ${
                c.id === car.id ? "border-gold" : "border-white/10 hover:border-white/30"
              }`}
            >
              <img src={c.images[0]} alt={`${c.brandName} ${c.model}`} className="h-24 w-full object-cover" loading="lazy" />
              <div className="bg-carbon/90 p-2.5">
                <p className="truncate text-xs text-ivory">{c.brandName} {c.model}</p>
                <p className="font-condensed text-[11px] text-gold">{formatVND(c.promoPrice ?? c.price)}</p>
              </div>
              {c.id === car.id && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center bg-gold text-obsidian">
                  <Check size={14} />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* preview */}
          <div>
            <Reveal>
              {/* 2D / 3D toggle */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-condensed text-xs uppercase tracking-[0.3em] text-ash">
                    {view3d ? "Concept 3D tương tác" : "Xem ảnh thực tế"}
                  </p>
                  {view3d && (
                    <p className="mt-1 max-w-md text-[11px] leading-relaxed text-ash/60">
                      Concept 3D do AURUM dựng — xem màu sơn & mâm xe thay đổi trực tiếp.
                    </p>
                  )}
                </div>
                <div className="flex border border-white/15">
                  <button
                    onClick={() => setView3d(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 font-condensed text-[11px] uppercase tracking-[0.18em] transition-colors ${!view3d ? "bg-gold font-semibold text-obsidian" : "text-ivory/70 hover:text-ivory"}`}
                  >
                    <ImageIcon size={13} /> Ảnh
                  </button>
                  <button
                    onClick={() => setView3d(true)}
                    className={`flex items-center gap-2 px-4 py-2.5 font-condensed text-[11px] uppercase tracking-[0.18em] transition-colors ${view3d ? "bg-gold font-semibold text-obsidian" : "text-ivory/70 hover:text-ivory"}`}
                  >
                    <Box size={13} /> 3D
                  </button>
                </div>
              </div>

              {view3d ? (
                <Car3DViewer
                  carSlug={car.slug}
                  bodyStyle={car.bodyStyle ?? "sedan"}
                  paintHex={paint.hex}
                  paintName={paint.name}
                  wheelId={s.wheelId}
                  wheelName={WHEELS.find((w) => w.id === s.wheelId)?.name ?? ""}
                />
              ) : (
              <div className="grain relative overflow-hidden border border-white/10 bg-carbon">
                <motion.img
                  key={car.id + paint.id}
                  src={car.images[0]}
                  alt={`${car.brandName} ${car.model} — ${paint.name}`}
                  initial={{ opacity: 0.4, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                  className="h-[320px] w-full object-cover md:h-[460px]"
                  style={{ filter: paint.filter }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-transparent to-transparent" />
                {/* paint name badge */}
                <div className="absolute left-5 top-5 flex items-center gap-3 border border-white/15 bg-obsidian/70 px-4 py-2.5 backdrop-blur">
                  <span className="h-6 w-6 rounded-full border border-white/30" style={{ background: paint.hex }} />
                  <div>
                    <p className="font-condensed text-[10px] uppercase tracking-[0.25em] text-ash">Màu sơn</p>
                    <p className="text-sm text-ivory">{paint.name}</p>
                  </div>
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-condensed text-xs uppercase tracking-[0.35em] text-champagne">{car.brandName}</p>
                    <p className="mt-1 font-display text-3xl text-ivory md:text-4xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {car.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-condensed text-[10px] uppercase tracking-[0.25em] text-ash">Tổng cấu hình</p>
                    <motion.p key={total} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-condensed text-3xl font-semibold text-gold">
                      {formatVND(total)}
                    </motion.p>
                  </div>
                </div>
              </div>
              )}
            </Reveal>

            {/* tabs */}
            <div className="mt-6 flex gap-2 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex shrink-0 items-center gap-2 border px-5 py-3 font-condensed text-xs uppercase tracking-[0.2em] transition-colors ${
                    tab === t.id ? "border-gold bg-gold font-semibold text-obsidian" : "border-white/15 text-ivory/70 hover:border-white/40 hover:text-ivory"
                  }`}
                >
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                {tab === "paint" && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {PAINTS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => s.setPaint(p.id)}
                        className={`group border p-3 text-left transition-all ${s.paintId === p.id ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/30"}`}
                      >
                        <span className="relative block h-16 w-full overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.hex}, #000 130%)` }}>
                          {p.metallic && <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent" />}
                          {s.paintId === p.id && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center bg-gold text-obsidian"><Check size={12} /></span>
                          )}
                        </span>
                        <p className="mt-2.5 text-xs text-ivory">{p.name}</p>
                        <p className="font-condensed text-[11px] text-gold">{p.price ? `+${formatVND(p.price)}` : "Tiêu chuẩn"}</p>
                      </button>
                    ))}
                  </div>
                )}

                {tab === "wheels" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {WHEELS.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => s.setWheel(w.id)}
                        className={`flex items-center gap-4 border p-4 text-left transition-all ${s.wheelId === w.id ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/30"}`}
                      >
                        <WheelIcon seed={w.id} />
                        <div className="flex-1">
                          <p className="text-sm text-ivory">{w.name}</p>
                          <p className="mt-0.5 text-xs text-ash">{w.desc}</p>
                          <p className="mt-1 font-condensed text-xs text-gold">{w.price ? `+${formatVND(w.price)}` : "Tiêu chuẩn"}</p>
                        </div>
                        {s.wheelId === w.id && <Check size={18} className="shrink-0 text-gold" />}
                      </button>
                    ))}
                  </div>
                )}

                {tab === "interior" && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {INTERIORS.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => s.setInterior(o.id)}
                        className={`border p-3 text-left transition-all ${s.interiorId === o.id ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/30"}`}
                      >
                        <span className="relative block h-16 w-full" style={{ background: `repeating-linear-gradient(45deg, ${o.hex}, ${o.hex} 6px, rgba(255,255,255,0.04) 6px, rgba(255,255,255,0.04) 12px)` }}>
                          {s.interiorId === o.id && (
                            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center bg-gold text-obsidian"><Check size={12} /></span>
                          )}
                        </span>
                        <p className="mt-2.5 text-xs text-ivory">{o.name}</p>
                        <p className="font-condensed text-[11px] text-gold">{o.price ? `+${formatVND(o.price)}` : "Tiêu chuẩn"}</p>
                      </button>
                    ))}
                  </div>
                )}

                {tab === "packages" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PACKAGES.map((p) => {
                      const on = s.packageIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => s.togglePackage(p.id)}
                          className={`border p-4 text-left transition-all ${on ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/30"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-ivory">{p.name}</p>
                              <p className="mt-1 text-xs leading-relaxed text-ash">{p.desc}</p>
                            </div>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${on ? "border-gold bg-gold text-obsidian" : "border-white/25"}`}>
                              {on && <Check size={13} />}
                            </span>
                          </div>
                          <p className="mt-2 font-condensed text-xs text-gold">+{formatVND(p.price)}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* summary panel */}
          <div>
            <div className="border border-gold/30 bg-carbon/70 p-6 lg:sticky lg:top-28">
              <p className="font-condensed text-xs uppercase tracking-[0.35em] text-gold">Bản thiết kế</p>
              <h2 className="mt-2 font-display text-2xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {car.brandName} {car.model}
              </h2>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
                <Row label="Giá cơ bản" value={formatVND(price?.base ?? 0)} />
                <Row label={`Sơn · ${paint.name}`} value={price?.breakdown.paint?.price ? `+${formatVND(price.breakdown.paint.price)}` : "—"} />
                <Row label={`Mâm · ${price?.breakdown.wheel?.name}`} value={price?.breakdown.wheel?.price ? `+${formatVND(price.breakdown.wheel.price)}` : "—"} />
                <Row label={`Nội thất · ${price?.breakdown.interior?.name}`} value={price?.breakdown.interior?.price ? `+${formatVND(price.breakdown.interior.price)}` : "—"} />
                {price?.breakdown.pkgs.map((p) => (
                  <Row key={p.id} label={p.name} value={`+${formatVND(p.price)}`} />
                ))}
              </div>

              <div className="mt-5 flex items-end justify-between border-t border-gold/25 pt-5">
                <p className="font-condensed text-xs uppercase tracking-[0.25em] text-ash">Tổng cộng</p>
                <motion.p key={total} initial={{ scale: 0.96 }} animate={{ scale: 1 }} className="font-condensed text-3xl font-semibold text-gold">
                  {formatVND(total)}
                </motion.p>
              </div>

              <button
                onClick={doSave}
                className={`mt-6 flex w-full items-center justify-center gap-2 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.2em] transition-colors ${
                  saved ? "bg-emerald-700 text-white" : "bg-gold text-obsidian hover:bg-champagne"
                }`}
              >
                {saved ? <><Check size={16} /> Đã lưu vào garage</> : <><Save size={16} /> Lưu thiết kế</>}
              </button>
              <Link
                to={`/cars/${car.slug}`}
                className="mt-3 flex w-full items-center justify-center gap-2 border border-white/20 py-4 font-condensed text-sm uppercase tracking-[0.2em] text-ivory hover:border-gold hover:text-gold"
              >
                Đặt cọc xe này <ArrowRight size={15} />
              </Link>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-ash/70">
                Giá mang tính tham khảo. Liên hệ showroom để nhận báo giá chính thức cho cấu hình của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* saved builds */}
        {s.builds.length > 0 && (
          <div className="mt-16">
            <h2 className="font-condensed text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Garage thiết kế của bạn ({s.builds.length})
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {s.builds.map((b) => {
                const bc = cars.find((c) => c.id === b.carId);
                const bp = PAINTS.find((p) => p.id === b.paintId);
                return (
                  <div key={b.id} className="group border border-white/10 bg-carbon/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-ivory">{b.carName}</p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-ash">
                          <span className="inline-block h-3.5 w-3.5 rounded-full border border-white/30" style={{ background: bp?.hex }} />
                          {bp?.name} · {b.packageIds.length} gói
                        </p>
                        <p className="mt-1.5 font-condensed text-lg text-gold">{formatVND(b.totalPrice)}</p>
                      </div>
                      {bc && <img src={bc.images[0]} alt="" className="h-14 w-20 object-cover" style={{ filter: bp?.filter }} loading="lazy" />}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          s.setCar(b.carId);
                          s.setPaint(b.paintId);
                          s.setWheel(b.wheelId);
                          s.setInterior(b.interiorId);
                          b.packageIds.forEach((pid) => {
                            if (!useStudioStore.getState().packageIds.includes(pid)) useStudioStore.getState().togglePackage(pid);
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex-1 border border-white/15 py-2.5 font-condensed text-[11px] uppercase tracking-[0.18em] text-ivory/80 hover:border-gold hover:text-gold"
                      >
                        Tải lại
                      </button>
                      <button
                        onClick={() => s.removeBuild(b.id)}
                        className="border border-white/15 px-3.5 text-ash hover:border-red-800 hover:text-red-300"
                        aria-label="Xóa thiết kế"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="truncate text-ash">{label}</span>
      <span className="shrink-0 font-condensed text-ivory">{value}</span>
    </div>
  );
}

/** Decorative wheel SVG swatch */
function WheelIcon({ seed }: { seed: string }) {
  const spokes = 5 + (seed.charCodeAt(2) % 3) * 2;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
      <circle cx="26" cy="26" r="24" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.7" />
      <circle cx="26" cy="26" r="17" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="5" />
      {Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return (
          <line key={i} x1="26" y1="26" x2={26 + Math.cos(a) * 22} y2={26 + Math.sin(a) * 22}
            stroke="#D4AF37" strokeWidth="2.5" opacity="0.85" />
        );
      })}
      <circle cx="26" cy="26" r="5" fill="#D4AF37" />
    </svg>
  );
}
