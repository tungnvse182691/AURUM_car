import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Car, CalendarCheck, ShoppingBag, Users, LogOut, Menu, X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import RoleGuard from "../RoleGuard";
import AurumLogo from "../brand/AurumLogo";
import type { User } from "../../types";

const MENU: { to: string; label: string; icon: React.ElementType; roles: User["role"][] }[] = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, roles: ["admin", "staff"] },
  { to: "/admin/cars", label: "Kho xe", icon: Car, roles: ["admin"] },
  { to: "/admin/bookings", label: "Lịch lái thử", icon: CalendarCheck, roles: ["admin", "staff"] },
  { to: "/admin/orders", label: "Đơn cọc", icon: ShoppingBag, roles: ["admin", "staff"] },
  { to: "/admin/users", label: "Người dùng", icon: Users, roles: ["admin"] },
];

function Sidebar({ onNav }: { onNav?: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col bg-coal">
      <Link to="/" className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <AurumLogo variant="icon" className="h-9 w-9" />
        <div>
          <p className="font-cinzel text-sm font-bold tracking-[0.3em] text-ivory" style={{ fontFamily: "'Cinzel', serif" }}>AURUM</p>
          <p className="font-condensed text-[10px] uppercase tracking-[0.25em] text-gold">Quản trị</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-6">
        {MENU.filter((m) => user && m.roles.includes(user.role)).map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            end={m.to === "/admin"}
            onClick={onNav}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 font-condensed text-[13px] uppercase tracking-[0.18em] transition-colors ${
                isActive ? "bg-gold/10 text-gold border-l-2 border-gold" : "text-ivory/65 hover:bg-white/5 hover:text-ivory border-l-2 border-transparent"
              }`
            }
          >
            <m.icon size={17} /> {m.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link to="/" className="flex items-center gap-2 px-4 py-2.5 text-xs text-ash hover:text-ivory">
          <ArrowLeft size={14} /> Về trang chủ
        </Link>
        <div className="mt-2 flex items-center justify-between px-4 py-2">
          <div>
            <p className="text-sm text-ivory">{user?.name}</p>
            <p className="font-condensed text-[10px] uppercase tracking-[0.2em] text-gold">{user?.role}</p>
          </div>
          <button onClick={() => { logout(); navigate("/"); }} className="text-ash hover:text-red-300" aria-label="Đăng xuất">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  // noindex cho trang quản trị
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
  return (
    <RoleGuard roles={["admin", "staff"]}>
      <div className="min-h-screen bg-obsidian lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-0 h-screen"><Sidebar /></div>
        </aside>
        {/* mobile topbar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-obsidian/95 px-5 py-4 backdrop-blur lg:hidden">
          <span className="font-cinzel text-sm font-bold tracking-[0.3em] text-ivory" style={{ fontFamily: "'Cinzel', serif" }}>AURUM · ADMIN</span>
          <button onClick={() => setOpen(!open)} className="text-ivory" aria-label="Menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        {open && (
          <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
            <div className="h-full w-72" onClick={(e) => e.stopPropagation()}>
              <Sidebar onNav={() => setOpen(false)} />
            </div>
          </div>
        )}
        <main className="min-w-0">
          <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
