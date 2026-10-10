import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, ShieldCheck, User as UserIcon, LogOut, Clock } from "lucide-react";
import { api } from "../services/api";
import { formatVND } from "../mocks/db";
import { useAuthStore } from "../stores/useAuthStore";
import { SectionHead, Reveal } from "../components/fx";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chờ xác nhận", cls: "border-amber-700/60 text-amber-300" },
  confirmed: { label: "Đã xác nhận", cls: "border-emerald-700/60 text-emerald-300" },
  done: { label: "Hoàn tất", cls: "border-white/20 text-ash" },
  cancelled: { label: "Đã hủy", cls: "border-red-900/60 text-red-300" },
  refunded: { label: "Đã hoàn cọc", cls: "border-white/20 text-ash" },
};

function Timeline({ current }: { current: string }) {
  const steps = ["pending", "confirmed", "done"];
  const labels = ["Tiếp nhận", "Xác nhận", "Hoàn tất"];
  const idx = steps.indexOf(current);
  return (
    <div className="mt-4 flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 items-center gap-2 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rotate-45 border ${i <= idx && idx >= 0 ? "border-gold bg-gold" : "border-white/25"}`} />
            <span className={`font-condensed text-[10px] uppercase tracking-[0.15em] ${i <= idx && idx >= 0 ? "text-gold" : "text-ash/60"}`}>{labels[i]}</span>
          </div>
          {i < steps.length - 1 && <div className={`mb-5 h-px flex-1 ${i < idx ? "bg-gold/60" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const { user, logout } = useAuthStore();
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.myBookings(), api.myOrders()])
      .then(([b, o]) => {
        setBookings(b.data);
        setOrders(o.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const st = (s: string) => STATUS_LABEL[s] ?? STATUS_LABEL.pending;

  return (
    <div className="bg-obsidian pt-28">
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <SectionHead kicker="Garage cá nhân" title={<>Chào <em className="text-gold">{user?.name?.split(" ").slice(-1)}</em></>} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* profile card */}
          <Reveal>
            <div className="border border-white/10 bg-carbon/60 p-6 lg:sticky lg:top-28">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center bg-gold font-condensed text-xl font-bold text-obsidian">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-ivory">{user?.name}</p>
                  <p className="mt-0.5 font-condensed text-[11px] uppercase tracking-[0.2em] text-gold">{user?.role}</p>
                </div>
              </div>
              <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-ash">
                <p className="flex items-center gap-2"><UserIcon size={14} /> {user?.email}</p>
                <p className="flex items-center gap-2"><Clock size={14} /> Tham gia {user?.createdAt?.slice(0, 10)}</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                <div className="border border-white/10 p-3">
                  <p className="font-condensed text-2xl text-gold">{bookings.length}</p>
                  <p className="font-condensed text-[10px] uppercase tracking-[0.2em] text-ash">Lịch hẹn</p>
                </div>
                <div className="border border-white/10 p-3">
                  <p className="font-condensed text-2xl text-gold">{orders.length}</p>
                  <p className="font-condensed text-[10px] uppercase tracking-[0.2em] text-ash">Đơn cọc</p>
                </div>
              </div>
              <button onClick={logout} className="mt-5 flex w-full items-center justify-center gap-2 border border-white/15 py-3 font-condensed text-xs uppercase tracking-[0.22em] text-ivory/70 hover:border-red-800 hover:text-red-300">
                <LogOut size={14} /> Đăng xuất
              </button>
            </div>
          </Reveal>

          <div className="space-y-10">
            {/* bookings */}
            <Reveal>
              <h2 className="flex items-center gap-3 font-condensed text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                <CalendarCheck size={16} /> Lịch lái thử của tôi
              </h2>
              {loading ? (
                <p className="mt-4 text-sm text-ash">Đang tải...</p>
              ) : bookings.length ? (
                <div className="mt-4 space-y-4">
                  {bookings.map((b) => {
                    const s = st(String(b.status));
                    return (
                      <div key={String(b.id)} className="border border-white/10 bg-carbon/60 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-ivory">Lái thử — {String(b.date)} · {String(b.slot)}</p>
                            <p className="mt-1 text-xs text-ash">Mã {String(b.id)} · Đặt ngày {String(b.createdAt).slice(0, 10)}</p>
                          </div>
                          <span className={`border px-3 py-1.5 font-condensed text-[11px] uppercase tracking-[0.2em] ${s.cls}`}>{s.label}</span>
                        </div>
                        <Timeline current={String(b.status)} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState to="/cars" label="Đặt lịch lái thử" text="Chưa có lịch hẹn nào. Chọn một tuyệt phẩm và cảm nhận sau vô-lăng." />
              )}
            </Reveal>

            {/* orders */}
            <Reveal>
              <h2 className="flex items-center gap-3 font-condensed text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                <ShieldCheck size={16} /> Đơn đặt cọc
              </h2>
              {loading ? (
                <p className="mt-4 text-sm text-ash">Đang tải...</p>
              ) : orders.length ? (
                <div className="mt-4 space-y-4">
                  {orders.map((o) => {
                    const s = st(String(o.status));
                    return (
                      <div key={String(o.id)} className="border border-white/10 bg-carbon/60 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-ivory">Cọc {formatVND(Number(o.amount))} <span className="text-ash">· Mã {String(o.id)}</span></p>
                            <p className="mt-1 text-xs text-ash">Ngày {String(o.createdAt).slice(0, 10)}</p>
                          </div>
                          <span className={`border px-3 py-1.5 font-condensed text-[11px] uppercase tracking-[0.2em] ${s.cls}`}>{s.label}</span>
                        </div>
                        <Timeline current={String(o.status)} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState to="/cars" label="Xem bộ sưu tập" text="Chưa có đơn cọc nào. Giữ chỗ chiếc xe trong mơ chỉ với vài bước." />
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ to, label, text }: { to: string; label: string; text: string }) {
  return (
    <div className="mt-4 flex flex-col items-center border border-dashed border-white/15 px-6 py-12 text-center">
      <p className="max-w-sm text-sm text-ash">{text}</p>
      <Link to={to} className="mt-5 border border-gold/60 px-6 py-3 font-condensed text-xs uppercase tracking-[0.25em] text-gold hover:bg-gold hover:text-obsidian">
        {label}
      </Link>
    </div>
  );
}
