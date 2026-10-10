import { useEffect, useState } from "react";
import { Check, X, Phone, RotateCcw } from "lucide-react";
import { api } from "../../services/api";
import { formatVND } from "../../mocks/db";

const STATUS: Record<string, string> = {
  pending: "Chờ duyệt",
  confirmed: "Đã duyệt",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn cọc",
};

const NEXT: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["done", "refunded"],
  done: [],
  cancelled: [],
  refunded: [],
};

const BTN: Record<string, string> = {
  confirmed: "Duyệt cọc",
  done: "Hoàn tất",
  cancelled: "Hủy",
  refunded: "Hoàn cọc",
};

export default function AdminOrders() {
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    api.adminOrders().then((r) => setList(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const update = async (id: string, status: string) => {
    await api.updateOrder(id, status).catch(() => {});
    load();
  };

  const filtered = filter === "all" ? list : list.filter((o) => o.status === filter);
  const totalValue = filtered.reduce((s, o) => s + Number(o.amount ?? 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-condensed text-xs uppercase tracking-[0.4em] text-gold">Vận hành</p>
          <h1 className="mt-2 font-display text-4xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Đơn đặt cọc ({list.length})
          </h1>
        </div>
        <p className="font-condensed text-sm text-ash">Tổng giá trị: <span className="text-gold">{formatVND(totalValue)}</span></p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "done", "cancelled", "refunded"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`border px-4 py-2 font-condensed text-xs uppercase tracking-[0.18em] ${filter === s ? "border-gold bg-gold font-semibold text-obsidian" : "border-white/15 text-ash hover:text-ivory"}`}>
            {s === "all" ? "Tất cả" : STATUS[s]}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? <p className="text-ash">Đang tải...</p> : filtered.length ? filtered.map((o) => {
          const car = o.car as Record<string, unknown> | null;
          return (
            <div key={String(o.id)} className="border border-white/10 bg-carbon/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-4">
                  {car && <img src={String((car.images as string[])[0])} alt="" className="h-16 w-24 object-cover" />}
                  <div>
                    <p className="text-ivory">
                      {car ? `${String(car.brandName)} ${String(car.model)}` : "Xe đã xóa"}
                    </p>
                    <p className="mt-1 font-condensed text-lg text-gold">{formatVND(Number(o.amount))}</p>
                    <p className="mt-1 text-sm text-ash">{String(o.name)} · <Phone size={11} className="inline" /> {String(o.phone)}</p>
                    <p className="mt-1 font-mono text-[11px] text-ash/50">{String(o.id)} · {String(o.createdAt).slice(0, 10)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border border-white/15 px-3 py-1.5 font-condensed text-[11px] uppercase tracking-[0.18em] text-ash">
                    {STATUS[String(o.status)]}
                  </span>
                  {(NEXT[String(o.status)] ?? []).map((ns) => (
                    <button key={ns} onClick={() => update(String(o.id), ns)}
                      className={`flex items-center gap-1.5 border px-3.5 py-2 font-condensed text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors ${
                        ns === "cancelled" || ns === "refunded"
                          ? "border-white/20 text-ash hover:border-gold hover:text-gold"
                          : "border-emerald-800/70 text-emerald-300 hover:bg-emerald-950/40"
                      }`}>
                      {ns === "refunded" ? <RotateCcw size={12} /> : ns === "cancelled" ? <X size={12} /> : <Check size={12} />}
                      {BTN[ns]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        }) : (
          <p className="border border-dashed border-white/15 py-14 text-center text-sm text-ash">Chưa có đơn nào ở trạng thái này.</p>
        )}
      </div>
    </div>
  );
}
