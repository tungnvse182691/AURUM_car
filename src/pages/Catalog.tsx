import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { api } from "../services/api";
import type { Brand, CarWithBrand } from "../types";
import CarCard from "../components/CarCard";
import { Reveal, SectionHead } from "../components/fx";

const PRICE_RANGES = [
  { id: "all", label: "Mọi mức giá", min: 0, max: Infinity },
  { id: "u5", label: "Dưới 5 tỷ", min: 0, max: 5_000_000_000 },
  { id: "5-10", label: "5 – 10 tỷ", min: 5_000_000_000, max: 10_000_000_000 },
  { id: "10-15", label: "10 – 15 tỷ", min: 10_000_000_000, max: 15_000_000_000 },
  { id: "o15", label: "Trên 15 tỷ", min: 15_000_000_000, max: Infinity },
];

const SORTS = [
  { id: "featured", label: "Nổi bật" },
  { id: "price-asc", label: "Giá tăng dần" },
  { id: "price-desc", label: "Giá giảm dần" },
  { id: "newest", label: "Đời mới nhất" },
  { id: "power", label: "Mạnh nhất" },
];

const FUELS = ["Xăng", "Dầu", "Hybrid", "Điện"];

function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse border border-white/10 bg-carbon">
          <div className="aspect-[16/10] bg-white/5" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-2/3 bg-white/10" />
            <div className="h-6 w-1/2 bg-white/10" />
            <div className="h-4 w-1/3 bg-gold/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Catalog() {
  const [brands, setBrands] = useState<(Brand & { count: number })[]>([]);
  const [cars, setCars] = useState<CarWithBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sort, setSort] = useState("featured");
  const [selBrands, setSelBrands] = useState<string[]>([]);
  const [priceId, setPriceId] = useState("all");
  const [fuel, setFuel] = useState<string | null>(null);
  const [transmission, setTransmission] = useState<string | null>(null);
  const [onlyNew, setOnlyNew] = useState(false);
  const [mobileFilter, setMobileFilter] = useState(false);

  useEffect(() => {
    api.brands().then((r) => setBrands(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const priceRange = PRICE_RANGES.find((p) => p.id === priceId)!;

  useEffect(() => {
    setLoading(true);
    // brand filter: API supports single brand; multi-brand filtered client-side
    api
      .cars({ q: debouncedQ, sort, minPrice: priceRange.min === 0 ? undefined : priceRange.min, maxPrice: priceRange.max === Infinity ? undefined : priceRange.max })
      .then((r) => {
        let list = r.data;
        if (selBrands.length) list = list.filter((c) => selBrands.includes(c.brandId));
        if (fuel) list = list.filter((c) => c.fuel === fuel);
        if (transmission) list = list.filter((c) => c.transmission === transmission);
        if (onlyNew) list = list.filter((c) => c.isNew);
        setCars(list);
      })
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }, [debouncedQ, sort, priceId, selBrands, fuel, transmission, onlyNew]);

  const activeFilterCount = useMemo(
    () =>
      selBrands.length +
      (priceId !== "all" ? 1 : 0) +
      (fuel ? 1 : 0) +
      (transmission ? 1 : 0) +
      (onlyNew ? 1 : 0),
    [selBrands, priceId, fuel, transmission, onlyNew],
  );

  const clearAll = () => {
    setSelBrands([]);
    setPriceId("all");
    setFuel(null);
    setTransmission(null);
    setOnlyNew(false);
    setQ("");
  };

  const toggleBrand = (id: string) =>
    setSelBrands((s) => (s.includes(id) ? s.filter((b) => b !== id) : [...s, id]));

  const filterPanel = (
    <div className="space-y-8">
      {/* brand */}
      <div>
        <h4 className="font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-gold">Thương hiệu</h4>
        <div className="mt-4 space-y-2.5">
          {brands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-3 text-sm text-ivory/80 hover:text-ivory">
              <input
                type="checkbox"
                checked={selBrands.includes(b.id)}
                onChange={() => toggleBrand(b.id)}
                className="h-4 w-4 accent-[#D4AF37]"
              />
              <span className="flex-1">{b.name}</span>
              <span className="font-condensed text-xs text-ash">{b.count}</span>
            </label>
          ))}
        </div>
      </div>
      {/* price */}
      <div>
        <h4 className="font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-gold">Khoảng giá</h4>
        <div className="mt-4 space-y-2">
          {PRICE_RANGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPriceId(p.id)}
              className={`block w-full border px-4 py-2.5 text-left text-sm transition-colors ${
                priceId === p.id ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-ivory/70 hover:border-white/30 hover:text-ivory"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {/* fuel */}
      <div>
        <h4 className="font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-gold">Nhiên liệu</h4>
        <div className="mt-4 flex flex-wrap gap-2">
          {FUELS.map((f) => (
            <button
              key={f}
              onClick={() => setFuel(fuel === f ? null : f)}
              className={`border px-4 py-2 text-sm transition-colors ${
                fuel === f ? "border-gold bg-gold text-obsidian font-semibold" : "border-white/10 text-ivory/70 hover:border-white/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {/* transmission */}
      <div>
        <h4 className="font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-gold">Hộp số</h4>
        <div className="mt-4 flex gap-2">
          {[
            { id: "AT", label: "Tự động" },
            { id: "MT", label: "Số sàn" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTransmission(transmission === t.id ? null : t.id)}
              className={`flex-1 border px-4 py-2 text-sm transition-colors ${
                transmission === t.id ? "border-gold bg-gold text-obsidian font-semibold" : "border-white/10 text-ivory/70 hover:border-white/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {/* condition */}
      <label className="flex cursor-pointer items-center gap-3 text-sm text-ivory/80 hover:text-ivory">
        <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} className="h-4 w-4 accent-[#D4AF37]" />
        Chỉ xe mới 100%
      </label>

      {activeFilterCount > 0 && (
        <button onClick={clearAll} className="flex items-center gap-2 font-condensed text-xs uppercase tracking-[0.25em] text-ash hover:text-gold">
          <X size={14} /> Xóa bộ lọc ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-obsidian pt-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead kicker="Showroom" title={<>Bộ sưu tập <em className="text-gold">AURUM</em></>} />
        <Reveal delay={0.1}>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-ash">
            {cars.length ? `${cars.length} tuyệt phẩm` : "Đang tải"} — mỗi chiếc đều qua 200 điểm kiểm tra kỹ thuật.
          </p>
        </Reveal>

        {/* search + sort bar */}
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm: Panamera, Huracán, V8..."
              className="w-full border border-white/15 bg-carbon py-3.5 pl-11 pr-4 text-sm text-ivory placeholder:text-ash/60 focus:border-gold focus:outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none border border-white/15 bg-carbon py-3.5 pl-4 pr-10 font-condensed text-sm uppercase tracking-[0.18em] text-ivory focus:border-gold focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-carbon">{s.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ash" />
          </div>
          <button
            onClick={() => setMobileFilter(!mobileFilter)}
            className="flex items-center justify-center gap-2 border border-white/15 px-5 py-3.5 font-condensed text-sm uppercase tracking-[0.18em] text-ivory lg:hidden"
          >
            <SlidersHorizontal size={15} /> Lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        <div className="mt-8 grid gap-10 pb-24 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 border border-white/10 bg-carbon/50 p-6">{filterPanel}</div>
          </aside>
          {mobileFilter && (
            <div className="border border-white/10 bg-carbon/80 p-6 lg:hidden">{filterPanel}</div>
          )}
          <div>
            {loading ? (
              <Skeleton />
            ) : cars.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {cars.map((c) => (
                  <CarCard key={c.id} car={c} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center border border-white/10 bg-carbon/50 px-6 py-24 text-center">
                <p className="font-display text-3xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Không tìm thấy chiếc xe nào
                </p>
                <p className="mt-3 max-w-sm text-sm text-ash">Thử nới lỏng bộ lọc hoặc từ khóa tìm kiếm — biết đâu tuyệt phẩm đang chờ ở tiêu chí khác.</p>
                <button onClick={clearAll} className="mt-6 border border-gold/60 px-6 py-3 font-condensed text-xs uppercase tracking-[0.25em] text-gold hover:bg-gold hover:text-obsidian">
                  Xóa toàn bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
