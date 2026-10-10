import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Scale, Trophy } from "lucide-react";
import { api } from "../services/api";
import { formatVNDFull } from "../mocks/db";
import type { CarWithBrand } from "../types";
import { useShopStore } from "../stores/useShopStore";
import { SectionHead, Reveal, Magnetic } from "../components/fx";

interface Row {
  label: string;
  get: (c: CarWithBrand) => string | number;
  numeric?: boolean;
  lowerBetter?: boolean;
}

const ROWS: Row[] = [
  { label: "Giá bán", get: (c) => formatVNDFull(c.promoPrice ?? c.price), numeric: true, lowerBetter: true },
  { label: "Năm sản xuất", get: (c) => c.year, numeric: true },
  { label: "Công suất", get: (c) => `${c.powerHp} HP`, numeric: true },
  { label: "Mô-men xoắn", get: (c) => `${c.torqueNm} Nm`, numeric: true },
  { label: "Động cơ", get: (c) => c.engine },
  { label: "Hộp số", get: (c) => (c.transmission === "AT" ? "Tự động" : "Số sàn") },
  { label: "Nhiên liệu", get: (c) => c.fuel },
  { label: "Dẫn động", get: (c) => c.drivetrain },
  { label: "Tiêu thụ", get: (c) => `${c.consumption} L/100km`, numeric: true, lowerBetter: true },
  { label: "Số chỗ", get: (c) => c.seats, numeric: true },
  { label: "Số km", get: (c) => c.mileage === 0 ? "Mới 100%" : `${c.mileage.toLocaleString("vi-VN")} km`, numeric: true, lowerBetter: true },
];

const numOf = (c: CarWithBrand, r: Row): number => {
  const v = r.get(c);
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
};

export default function Compare() {
  const { compare, toggleCompare, clearCompare } = useShopStore();
  const [cars, setCars] = useState<CarWithBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!compare.length) {
      setCars([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .cars()
      .then((r) => setCars(r.data.filter((c) => compare.includes(c.id))))
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }, [compare]);

  // keep store order
  const ordered = compare.map((id) => cars.find((c) => c.id === id)).filter(Boolean) as CarWithBrand[];

  if (!compare.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-obsidian px-6 pt-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center border border-gold/40 text-gold"><Scale size={30} /></span>
        <h1 className="mt-8 font-display text-5xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Chưa có xe để so sánh
        </h1>
        <p className="mt-4 max-w-md text-sm text-ash">Bấm biểu tượng cân trên thẻ xe để thêm tối đa 3 chiếc vào bàn cân.</p>
        <Magnetic>
          <Link to="/cars" className="mt-8 inline-flex bg-gold px-8 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian hover:bg-champagne">
            Chọn xe ngay
          </Link>
        </Magnetic>
      </div>
    );
  }

  return (
    <div className="bg-obsidian pt-28">
      <div className="mx-auto max-w-7xl px-6 pb-24">
        <SectionHead kicker="Đối đầu" title={<>Bàn cân <em className="text-gold">tuyệt phẩm</em></>} />
        <Reveal className="mt-6 text-center">
          <button onClick={clearCompare} className="font-condensed text-xs uppercase tracking-[0.25em] text-ash hover:text-gold">
            Xóa tất cả
          </button>
        </Reveal>

        {loading ? (
          <p className="mt-12 text-center text-ash">Đang tải...</p>
        ) : (
          <Reveal className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <th className="w-40 border border-white/10 bg-carbon p-4 text-left font-condensed text-xs uppercase tracking-[0.25em] text-ash">Tiêu chí</th>
                  {ordered.map((c) => (
                    <th key={c.id} className="relative border border-white/10 bg-carbon p-0 align-top">
                      <button
                        onClick={() => toggleCompare(c.id)}
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center border border-white/20 bg-obsidian/70 text-ivory backdrop-blur hover:border-gold hover:text-gold"
                        aria-label="Xóa khỏi so sánh"
                      >
                        <X size={14} />
                      </button>
                      <Link to={`/cars/${c.slug}`} data-cursor="Xem xe">
                        <img src={c.images[0]} alt={`${c.brandName} ${c.model}`} className="aspect-[16/9] w-full object-cover" />
                        <div className="p-4 text-left">
                          <p className="font-condensed text-[11px] uppercase tracking-[0.3em] text-champagne">{c.brandName}</p>
                          <p className="mt-1 font-display text-xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {c.model} {c.year}
                          </p>
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => {
                  const nums = ordered.map((c) => numOf(c, r));
                  const best = r.numeric
                    ? r.lowerBetter ? Math.min(...nums) : Math.max(...nums)
                    : null;
                  return (
                    <tr key={r.label}>
                      <td className="border border-white/10 bg-carbon/60 p-4 font-condensed text-xs uppercase tracking-[0.2em] text-ash">{r.label}</td>
                      {ordered.map((c) => {
                        const isBest = best !== null && numOf(c, r) === best && ordered.length > 1;
                        return (
                          <td key={c.id} className={`border border-white/10 p-4 text-[15px] ${isBest ? "bg-gold/10 font-semibold text-gold" : "text-ivory/85"}`}>
                            <span className="flex items-center gap-2">
                              {isBest && <Trophy size={14} className="shrink-0 text-gold" />}
                              {r.get(c)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Reveal>
        )}
      </div>
    </div>
  );
}
