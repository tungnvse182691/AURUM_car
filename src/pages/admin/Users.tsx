import { useEffect, useState } from "react";
import { Shield, Lock, Unlock } from "lucide-react";
import { api } from "../../services/api";

type U = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  bookings: number;
  orders: number;
};

const ROLE_LABEL: Record<string, string> = { admin: "Quản trị", staff: "Nhân viên", user: "Khách hàng" };
const ROLE_CLS: Record<string, string> = {
  admin: "border-gold/60 text-gold",
  staff: "border-sky-800 text-sky-300",
  user: "border-white/15 text-ash",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<U[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = () => {
    setLoading(true);
    api.adminUsers().then((r) => setUsers(r.data as U[])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const update = async (id: string, body: { role?: string; status?: string }) => {
    try {
      await api.updateUser(id, body);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Cập nhật thất bại");
    }
    load();
  };

  const filtered = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <p className="font-condensed text-xs uppercase tracking-[0.4em] text-gold">Hệ thống</p>
      <h1 className="mt-2 font-display text-4xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Người dùng ({users.length})
      </h1>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên / email..."
        className="mt-6 max-w-sm w-full border border-white/15 bg-carbon px-4 py-3 text-sm text-ivory placeholder:text-ash/60 focus:border-gold focus:outline-none" />

      <div className="mt-6 overflow-x-auto border border-white/10">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="bg-carbon font-condensed text-[11px] uppercase tracking-[0.2em] text-ash">
              {["Người dùng", "Vai trò", "Trạng thái", "Lịch hẹn", "Đơn cọc", ""].map((h) => (
                <th key={h} className="border-b border-white/10 px-4 py-3.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ash">Đang tải...</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center bg-gold/15 font-condensed text-sm font-bold text-gold">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-ivory">{u.name}</p>
                      <p className="text-xs text-ash">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => update(u.id, { role: e.target.value })}
                    className={`border bg-obsidian px-2.5 py-1.5 font-condensed text-[11px] uppercase tracking-[0.15em] focus:outline-none ${ROLE_CLS[u.role]}`}
                  >
                    {["user", "staff", "admin"].map((r) => (
                      <option key={r} value={r} className="bg-obsidian">{ROLE_LABEL[r]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex w-fit items-center gap-1.5 border px-2.5 py-1 font-condensed text-[10px] uppercase tracking-[0.15em] ${
                    u.status === "active" ? "border-emerald-800 text-emerald-300" : "border-red-900 text-red-300"
                  }`}>
                    {u.status === "active" ? <Unlock size={11} /> : <Lock size={11} />}
                    {u.status === "active" ? "Hoạt động" : "Đã khóa"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-ash">{u.bookings}</td>
                <td className="px-4 py-3 text-center text-ash">{u.orders}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => update(u.id, { status: u.status === "active" ? "locked" : "active" })}
                    className={`flex items-center gap-1.5 border px-3 py-2 font-condensed text-[11px] uppercase tracking-[0.15em] transition-colors ${
                      u.status === "active" ? "border-white/15 text-ash hover:border-red-800 hover:text-red-300" : "border-emerald-800/70 text-emerald-300 hover:bg-emerald-950/40"
                    }`}
                  >
                    <Shield size={12} />
                    {u.status === "active" ? "Khóa" : "Mở khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-ash/70">Hệ thống bảo vệ: không thể hạ quyền admin cuối cùng, không thể tự khóa chính mình.</p>
    </div>
  );
}
