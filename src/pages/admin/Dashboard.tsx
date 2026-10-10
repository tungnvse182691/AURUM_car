import { useEffect, useState } from "react";
import { Car, CalendarCheck, ShoppingBag, Users, TrendingUp, Clock } from "lucide-react";
import { api, type AdminStats } from "../../services/api";
import { formatVND } from "../../mocks/db";

/** Simple SVG bar chart */
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-48 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="font-condensed text-xs text-gold">{d.value}</span>
          <div className="flex w-full items-end justify-center rounded-sm bg-white/5" style={{ height: "100%" }}>
            <div
              className="w-full max-w-[44px] bg-gradient-to-t from-gold/40 to-gold transition-all duration-700"
              style={{ height: `${Math.max(6, (d.value / max) * 130)}px` }}
            />
          </div>
          <span className="font-condensed text-[10px] uppercase tracking-[0.12em] text-ash">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Donut chart for booking status */
function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const R = 54;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-8">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
        {segments.map((s) => {
          const frac = s.value / total;
          const el = (
            <circle
              key={s.label}
              cx="70" cy="70" r={R} fill="none"
              stroke={s.color} strokeWidth="16"
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-acc * C}
              strokeLinecap="butt"
            />
          );
          acc += frac;
          return el;
        })}
      </svg>
      <div className="space-y-2.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5" style={{ background: s.color }} />
            <span className="text-ash">{s.label}</span>
            <span className="font-condensed font-semibold text-ivory">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminStats().then((s) => setStats(s.data)).catch(() => {}).finally(() => setLoading(false));
    api.adminBookings().then((b) => setBookings(b.data)).catch(() => {});
  }, []);

  if (loading || !stats) {
    return <p className="text-ash">Đang tải dữ liệu...</p>;
  }

  const kpis = [
    { icon: Car, label: "Xe trong kho", value: stats.totalCars, sub: `${stats.availableCars} sẵn giao`, gold: true },
    { icon: ShoppingBag, label: "Đơn cọc", value: stats.totalOrders, sub: `${stats.pendingOrders} chờ duyệt` },
    { icon: CalendarCheck, label: "Lịch lái thử", value: stats.totalBookings, sub: `${stats.pendingBookings} chờ xác nhận` },
    { icon: Users, label: "Người dùng", value: stats.totalUsers, sub: "tài khoản" },
  ];

  const byStatus = ["pending", "confirmed", "done", "cancelled"].map((st) => ({
    label: st,
    value: bookings.filter((b) => b.status === st).length,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-condensed text-xs uppercase tracking-[0.4em] text-gold">Bảng điều khiển</p>
          <h1 className="mt-2 font-display text-4xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Tổng quan kinh doanh
          </h1>
        </div>
        <p className="flex items-center gap-2 text-xs text-ash"><Clock size={13} /> Cập nhật realtime · Mock API</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="border border-white/10 bg-carbon/60 p-6 transition-colors hover:border-gold/40">
            <div className="flex items-center justify-between">
              <k.icon size={20} className={k.gold ? "text-gold" : "text-champagne"} />
              <TrendingUp size={15} className="text-emerald-400/70" />
            </div>
            <p className="mt-4 font-condensed text-4xl font-semibold text-ivory">{k.value}</p>
            <p className="mt-1 font-condensed text-xs uppercase tracking-[0.2em] text-ash">{k.label}</p>
            <p className="mt-1 text-xs text-gold/80">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="border border-white/10 bg-carbon/60 p-6">
          <h2 className="font-condensed text-sm font-semibold uppercase tracking-[0.25em] text-ivory">Lịch hẹn theo trạng thái</h2>
          <div className="mt-6">
            <Donut
              segments={[
                { label: "Chờ xác nhận", value: byStatus[0].value, color: "#D4AF37" },
                { label: "Đã xác nhận", value: byStatus[1].value, color: "#34d399" },
                { label: "Hoàn tất", value: byStatus[2].value, color: "#6b7280" },
                { label: "Đã hủy", value: byStatus[3].value, color: "#f87171" },
              ]}
            />
          </div>
        </div>
        <div className="border border-white/10 bg-carbon/60 p-6">
          <h2 className="font-condensed text-sm font-semibold uppercase tracking-[0.25em] text-ivory">Hoạt động</h2>
          <BarChart
            data={[
              { label: "Xe", value: stats.totalCars },
              { label: "Đơn", value: stats.totalOrders },
              { label: "Lịch hẹn", value: stats.totalBookings },
              { label: "User", value: stats.totalUsers },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 border border-gold/25 bg-gold/5 p-6">
        <p className="font-condensed text-xs uppercase tracking-[0.25em] text-gold">Doanh thu cọc đã xác nhận</p>
        <p className="mt-2 font-condensed text-4xl font-semibold text-gold">{formatVND(stats.revenue)}</p>
      </div>
    </div>
  );
}
