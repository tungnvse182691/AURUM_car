import { useEffect, useState } from "react";
import { Check, X, Phone } from "lucide-react";
import { api } from "../../services/api";

const STATUS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
};

const NEXT: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["done", "cancelled"],
  done: [],
  cancelled: [],
};

export default function AdminBookings() {
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    api.adminBookings().then((r) => setList(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const update = async (id: string, status: string) => {
    await api.updateBooking(id, status).catch(() => {});
    load();
  };

  const filtered = filter === "all" ? list : list.filter((b) => b.status === filter);

  return (
    <div>
      <p className="font-condensed text-xs uppercase tracking-[0.4em] text-gold">Vận hành</p>
      <h1 className="mt-2 font-display text-4xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Lịch lái thử ({list.length})
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "done", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`border px-4 py-2 font-condensed text-xs uppercase tracking-[0.18em] ${filter === s ? "border-gold bg-gold font-semibold text-obsidian" : "border-white/15 text-ash hover:text-ivory"}`}>
            {s === "all" ? "Tất cả" : STATUS[s]}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? <p className="text-ash">Đang tải...</p> : filtered.length ? filtered.map((b) => {
          const car = b.car as Record<string, unknown> | null;
          return (
            <div key={String(b.id)} className="border border-white/10 bg-carbon/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-4">
                  {car && <img src={String((car.images as string[])[0])} alt="" className="h-16 w-24 object-cover" />}
                  <div>
                    <p className="text-ivory">
                      {car ? `${String(car.brandName)} ${String(car.model)}` : "Xe đã xóa"}
                      <span className="ml-3 font-condensed text-xs text-gold">{String(b.date)} · {String(b.slot)}</span>
                    </p>
                    <p className="mt-1 text-sm text-ash">{String(b.name)} · <span className="flex-inline items-center gap-1"><Phone size={11} className="inline" /> {String(b.phone)}</span></p>
                    {b.note ? <p className="mt-1 text-xs italic text-ash/70">"{String(b.note)}"</p> : null}
                    <p className="mt-1 font-mono text-[11px] text-ash/50">{String(b.id)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="border border-white/15 px-3 py-1.5 font-condensed text-[11px] uppercase tracking-[0.18em] text-ash">
                    {STATUS[String(b.status)]}
                  </span>
                  {(NEXT[String(b.status)] ?? []).map((ns) => (
                    <button key={ns} onClick={() => update(String(b.id), ns)}
                      className={`flex items-center gap-1.5 border px-3.5 py-2 font-condensed text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors ${
                        ns === "cancelled" ? "border-red-900/70 text-red-300 hover:bg-red-950/40" : "border-emerald-800/70 text-emerald-300 hover:bg-emerald-950/40"
                      }`}>
                      {ns === "cancelled" ? <X size={12} /> : <Check size={12} />}
                      {ns === "confirmed" ? "Xác nhận" : ns === "done" ? "Hoàn tất" : "Hủy"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        }) : (
          <p className="border border-dashed border-white/15 py-14 text-center text-sm text-ash">Chưa có lịch hẹn nào ở trạng thái này.</p>
        )}
      </div>
    </div>
  );
}
