import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AurumLogo from "./brand/AurumLogo";
import { Magnetic } from "./fx";

const NAV = [
  { to: "/", label: "Trang chủ" },
  { to: "/cars", label: "Bộ sưu tập" },
  { to: "/compare", label: "So sánh" },
  { to: "/loan-calculator", label: "Trả góp" },
  { to: "/favorites", label: "Yêu thích" },
  { to: "/contact", label: "Liên hệ" },
];

function GoldButton({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Magnetic>
      <Link
        to={to}
        data-cursor="Đặt lịch"
        className="group inline-flex items-center gap-2 bg-gold px-6 py-3 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian transition-colors hover:bg-champagne"
      >
        {children}
        <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </Magnetic>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "border-b border-white/10 bg-obsidian/85 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3" data-cursor="Trang chủ">
            <AurumLogo variant="icon" glow={scrolled} className="h-11 w-11" />
            <span className="font-cinzel text-lg font-bold tracking-[0.32em] text-ivory" style={{ fontFamily: "'Cinzel', serif" }}>
              AURUM
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `group relative font-condensed text-[13px] font-medium uppercase tracking-[0.28em] transition-colors ${
                    isActive ? "text-gold" : "text-ivory/75 hover:text-ivory"
                  }`
                }
              >
                {n.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:block">
            <GoldButton to="/test-drive">Lái thử</GoldButton>
          </div>

          <button onClick={() => setOpen(!open)} className="text-ivory lg:hidden" aria-label="Menu">
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-20 z-40 border-b border-white/10 bg-obsidian/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col px-6 py-6">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `border-b border-white/5 py-4 font-condensed text-base uppercase tracking-[0.25em] ${
                      isActive ? "text-gold" : "text-ivory/80"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <Link to="/test-drive" className="mt-6 bg-gold px-6 py-3 text-center font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian">
                Đặt lịch lái thử
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-coal">
      {/* mega typography CTA */}
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-20 text-center">
        <p className="font-condensed text-xs uppercase tracking-[0.4em] text-oldgold">Trải nghiệm đỉnh cao</p>
        <Link to="/test-drive" data-cursor="Đặt lịch">
          <h2
            className="mt-4 font-condensed text-[16vw] font-semibold uppercase leading-none tracking-tight text-transparent transition-all duration-500 hover:text-gold md:text-[9rem]"
            style={{ WebkitTextStroke: "1px rgba(212,175,55,0.55)" }}
          >
            Lái thử
          </h2>
        </Link>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ash">
          Đặt lịch lái thử private cùng chuyên gia của AURUM — cà phê, đường chạy riêng và chiếc xe trong mơ của anh.
        </p>
      </div>

      <div className="gold-hairline mx-auto max-w-7xl" />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <AurumLogo variant="icon" className="h-10 w-10" />
            <span className="font-cinzel text-base font-bold tracking-[0.32em] text-ivory" style={{ fontFamily: "'Cinzel', serif" }}>AURUM</span>
          </div>
          <p className="mt-4 font-display text-lg italic text-ash" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            &ldquo;Driven by Gold.&rdquo;
          </p>
        </div>
        <div>
          <h4 className="font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-gold">Khám phá</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ash">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to} className="transition-colors hover:text-ivory">{n.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-gold">Showroom</h4>
          <ul className="mt-4 space-y-3 text-sm text-ash">
            <li className="flex gap-2.5"><MapPin size={15} className="mt-0.5 shrink-0 text-champagne" /> 86 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</li>
            <li className="flex gap-2.5"><Phone size={15} className="mt-0.5 shrink-0 text-champagne" /> 1900 6868</li>
            <li className="flex gap-2.5"><Clock size={15} className="mt-0.5 shrink-0 text-champagne" /> 8:00 – 21:00 mỗi ngày</li>
          </ul>
        </div>
        <div>
          <h4 className="font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-gold">Dành cho đối tác</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ash">
            <li><Link to="/auth/login" className="transition-colors hover:text-ivory">Cổng nhân viên</Link></li>
            <li><Link to="/auth/login" className="transition-colors hover:text-ivory">Cổng quản trị</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs tracking-wider text-ash/70 md:flex-row">
          <span>© 2026 AURUM. All rights reserved.</span>
          <span className="font-condensed uppercase tracking-[0.3em]">Est. 2026 · Saigon</span>
        </div>
      </div>
    </footer>
  );
}
