import { Link } from "react-router-dom";
import { ArrowUpRight, Gauge, Heart, Scale } from "lucide-react";
import type { CarWithBrand } from "../types";
import { formatVND } from "../mocks/db";
import { useShopStore } from "../stores/useShopStore";
import { TiltCard } from "./fx";

export default function CarCard({ car, large = false }: { car: CarWithBrand; large?: boolean }) {
  const price = car.promoPrice ?? car.price;
  const { toggleFavorite, isFavorite, toggleCompare, isComparing } = useShopStore();
  const fav = isFavorite(car.id);
  const cmp = isComparing(car.id);

  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(car.id);
  };
  const onCmp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!toggleCompare(car.id)) {
      // limit reached — could toast here in Phase 4
    }
  };

  return (
    <TiltCard className={large ? "md:col-span-2" : ""}>
      <Link
        to={`/cars/${car.slug}`}
        data-cursor="Khám phá"
        className={`group relative block overflow-hidden border border-white/10 bg-carbon transition-colors hover:border-gold/40 ${large ? "md:grid md:grid-cols-2" : ""}`}
      >
        <div className={`relative overflow-hidden ${large ? "h-72 md:h-full md:min-h-[380px]" : "aspect-[16/10]"}`}>
          <img
            src={car.images[0]}
            alt={`${car.brandName} ${car.model}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex gap-2">
            {car.promoPrice && (
              <span className="bg-gold px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-obsidian">
                Ưu đãi
              </span>
            )}
            {car.status === "reserved" && (
              <span className="border border-gold/70 bg-obsidian/70 px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur">
                Đã giữ chỗ
              </span>
            )}
          </div>
          <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={onFav}
              aria-label="Yêu thích"
              className={`flex h-10 w-10 items-center justify-center border backdrop-blur transition-colors ${
                fav ? "border-gold bg-gold text-obsidian" : "border-white/25 bg-obsidian/60 text-ivory hover:border-gold hover:text-gold"
              }`}
            >
              <Heart size={16} fill={fav ? "currentColor" : "none"} />
            </button>
            <button
              onClick={onCmp}
              aria-label="So sánh"
              className={`flex h-10 w-10 items-center justify-center border backdrop-blur transition-colors ${
                cmp ? "border-gold bg-gold text-obsidian" : "border-white/25 bg-obsidian/60 text-ivory hover:border-gold hover:text-gold"
              }`}
            >
              <Scale size={16} />
            </button>
          </div>
        </div>
        <div className="relative flex flex-col gap-3 p-6">
          <div>
            <p className="font-condensed text-xs uppercase tracking-[0.35em] text-champagne">{car.brandName}</p>
            <h3 className="mt-1.5 font-display text-2xl text-ivory md:text-[1.7rem]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {car.model} <span className="text-lg text-ash">{car.trim}</span>
            </h3>
          </div>
          <div className="flex items-center gap-5 font-condensed text-[13px] uppercase tracking-[0.18em] text-ash">
            <span className="flex items-center gap-1.5"><Gauge size={14} className="text-gold/80" /> {car.powerHp} HP</span>
            <span>{car.year}</span>
            <span>{car.mileage === 0 ? "Mới 100%" : `${car.mileage.toLocaleString("vi-VN")} km`}</span>
          </div>
          <div className="mt-1 flex items-end justify-between border-t border-white/10 pt-4">
            <div>
              {car.promoPrice && <p className="text-sm text-ash line-through">{formatVND(car.price)}</p>}
              <p className="font-condensed text-2xl font-semibold tracking-wide text-gold">{formatVND(price)}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center border border-white/15 text-ivory transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-obsidian">
              <ArrowUpRight size={17} />
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
