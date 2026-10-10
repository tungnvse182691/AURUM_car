import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User as UserIcon, Mail, Phone, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { IMG } from "../mocks/db";
import AurumLogo from "../components/brand/AurumLogo";
import { Magnetic } from "../components/fx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({ name, email, phone, password });
      navigate("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full border border-white/15 bg-carbon py-4 pl-11 pr-4 text-sm text-ivory placeholder:text-ash/60 focus:border-gold focus:outline-none";

  return (
    <div className="grid min-h-screen bg-obsidian lg:grid-cols-2">
      <div className="grain relative hidden overflow-hidden lg:block">
        <img src={IMG.garage} alt="AURUM private garage" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-obsidian/40 to-obsidian" />
        <div className="absolute inset-0 bg-obsidian/30" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <p className="font-condensed text-xs uppercase tracking-[0.4em] text-champagne">Private circle</p>
          <p className="mt-4 font-display text-4xl leading-tight text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Gia nhập <em className="text-gold">giới thượng lưu</em> của AURUM.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md">
          <Link to="/" className="inline-block"><AurumLogo variant="full" /></Link>
          <h1 className="mt-10 font-display text-4xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Tạo tài khoản
          </h1>
          <p className="mt-2 text-sm text-ash">
            Đã có tài khoản? <Link to="/auth/login" className="text-gold hover:underline">Đăng nhập</Link>
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="relative">
              <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên" className={inputCls} />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" className={inputCls} />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (≥ 6 ký tự)" className={inputCls} />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </motion.p>
            )}

            <Magnetic>
              <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 bg-gold py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian hover:bg-champagne disabled:opacity-60">
                {busy ? "Đang tạo..." : <>Gia nhập AURUM <ArrowRight size={16} /></>}
              </button>
            </Magnetic>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
