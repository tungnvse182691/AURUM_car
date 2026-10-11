import { useEffect, useState } from "react";
import { CalendarCheck, ChevronRight, MapPin, Clock, ShieldCheck } from "lucide-react";
import { api } from "../services/api";
import type { CarWithBrand } from "../types";
import BookingModal from "../components/BookingModal";
import { Reveal, SectionHead } from "../components/fx";
import { formatVND } from "../mocks/db";

export default function TestDrive() {
  const [cars, setCars] = useState<CarWithBrand[]>([]);
  const [selected, setSelected] = useState<CarWithBrand | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.cars().then((r) => setCars(r.data)).catch(() => {});
  }, []);

  const openBooking = (car: CarWithBrand) => {
    setSelected(car);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Hero */}
      <section className="border-b border-white/10 px-6 py-16 text-center sm:py-20">
        <Reveal>
          <p className="font-condensed text-xs uppercase tracking-[0.3em] text-gold">Trải nghiệm thực tế</p>
          <h1 className="mt-4 font-display text-4xl text-ivory sm:text-5xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Đặt lịch lái thử
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ash">
            Chọn xe anh muốn trải nghiệm, chọn ngày giờ — chuyên gia AURUM sẽ chuẩn bị xe
            và gọi xác nhận trước giờ hẹn.
          </p>
        </Reveal>
        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-6 text-xs text-ash">
          <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-gold" /> Miễn phí</span>
          <span className="flex items-center gap-2"><Clock size={14} className="text-gold" /> 30 phút / xe</span>
          <span className="flex items-center gap-2"><MapPin size={14} className="text-gold" /> 86 Nguyễn Huệ, Quận 1</span>
        </div>
      </section>

      {/* Car selection */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <SectionHead kicker="Bước 1" title="Chọn xe muốn lái thử" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <button
              key={car.id}
              onClick={() => openBooking(car)}
              className="group flex items-center gap-4 border border-white/10 bg-carbon p-4 text-left transition-colors hover:border-gold/60"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden bg-black/40">
                <img
                  src={car.images[0]}
                  alt={`${car.brandName} ${car.model}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ivory">
                  {car.brandName} {car.model}
                </p>
                <p className="mt-1 text-xs text-ash">{formatVND(car.price)}</p>
                <p className="mt-2 flex items-center gap-1 font-condensed text-[11px] uppercase tracking-[0.18em] text-gold">
                  <CalendarCheck size={12} /> Đặt lịch <ChevronRight size={12} />
                </p>
              </div>
            </button>
          ))}
        </div>
        {cars.length === 0 && (
          <p className="py-16 text-center text-sm text-ash">Đang tải danh sách xe...</p>
        )}
      </section>

      {selected && (
        <BookingModal car={selected} open={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
