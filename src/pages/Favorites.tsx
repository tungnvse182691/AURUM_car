import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { api } from "../services/api";
import type { CarWithBrand } from "../types";
import { useShopStore } from "../stores/useShopStore";
import CarCard from "../components/CarCard";
import { SectionHead, Reveal, Magnetic } from "../components/fx";

export default function Favorites() {
  const { favorites } = useShopStore();
  const [cars, setCars] = useState<CarWithBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!favorites.length) {
      setCars([]);
      setLoading(false);
      return;
    }
    api
      .cars()
      .then((r) => setCars(r.data.filter((c) => favorites.includes(c.id))))
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="bg-obsidian pt-28">
      <div className="mx-auto max-w-7xl px-6 pb-24">
        <SectionHead kicker="Bộ sưu tập cá nhân" title={<>Những chiếc xe <em className="text-gold">anh đã chọn</em></>} />

        {loading ? (
          <p className="mt-12 text-center text-ash">Đang tải...</p>
        ) : cars.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cars.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        ) : (
          <Reveal className="mx-auto mt-12 flex max-w-md flex-col items-center border border-white/10 bg-carbon/50 px-6 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center border border-white/15 text-ash">
              <Heart size={24} />
            </span>
            <p className="mt-6 font-display text-3xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Chưa lưu chiếc xe nào
            </p>
            <p className="mt-3 text-sm text-ash">Bấm biểu tượng trái tim trên thẻ xe để lưu vào bộ sưu tập cá nhân.</p>
            <Magnetic>
              <Link to="/cars" className="mt-8 inline-flex bg-gold px-8 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian hover:bg-champagne">
                Khám phá ngay
              </Link>
            </Magnetic>
          </Reveal>
        )}
      </div>
    </div>
  );
}
