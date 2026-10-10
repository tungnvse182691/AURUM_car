import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { IMG } from "../mocks/db";
import AurumLogo from "../components/brand/AurumLogo";
import { Magnetic } from "../components/fx";

const DEMO = [
  { role: "Admin", email: "admin@aurum.vn" },
  { role: "Staff", email: "staff@aurum.vn" },
  { role: "Khách", email: "user@aurum.vn" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  };

  const fill = (em: string) => {
    setEmail(em);
    setPassword("aurum123");
    setError("");
  };

  return (
    <div className="grid min-h-screen bg-obsidian lg:grid-cols-2">
      {/* left: image */}
      <div className="grain relative hidden overflow-hidden lg:block">
        <img src={IMG.accent} alt="AURUM showroom" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-obsidian/40 to-obsidian" />
        <div className="absolute inset-0 bg-obsidian/30" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <p className="font-condensed text-xs uppercase tracking-[0.4em] text-champagne">Private circle</p>
          <p className="mt-4 font-display text-4xl leading-tight text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            "Chào mừng trở lại <em className="text-gold">bộ sưu tập</em> của anh."
          </p>
        </div>
      </div>

      {/* right: form */}
      <div className="flex items-center justify-center px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md">
          <Link to="/" className="inline-block"><AurumLogo variant="full" /></Link>
          <h1 className="mt-10 font-display text-4xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Đăng nhập
          </h1>
          <p className="mt-2 text-sm text-ash">Truy cập garage cá nhân, lịch lái thử và ưu đãi thành viên.</p>
          <p className="mt-1.5 text-sm text-ash">
            Chưa có tài khoản? <Link to="/auth/register" className="text-gold hover:underline">Đăng ký ngay</Link>
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full border border-white/15 bg-carbon py-4 pl-11 pr-4 text-sm text-ivory placeholder:text-ash/60 focus:border-gold focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full border border-white/15 bg-carbon py-4 pl-11 pr-4 text-sm text-ivory placeholder:text-ash/60 focus:border-gold focus:outline-none"
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </motion.p>
            )}

            <Magnetic>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 bg-gold py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian transition-colors hover:bg-champagne disabled:opacity-60"
              >
                {busy ? "Đang xác thực..." : <>Vào garage <ArrowRight size={16} /></>}
              </button>
            </Magnetic>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="font-condensed text-xs uppercase tracking-[0.3em] text-ash">Tài khoản demo — bấm để điền</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  onClick={() => fill(d.email)}
                  className={`border px-3 py-3 text-left transition-colors ${email === d.email ? "border-gold bg-gold/10" : "border-white/10 hover:border-gold/50"}`}
                >
                  <p className="font-condensed text-xs font-semibold uppercase tracking-[0.15em] text-gold">{d.role}</p>
                  <p className="mt-1 truncate text-[11px] text-ash">{d.email}</p>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center font-mono text-[11px] text-ash/70">mật khẩu: aurum123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
