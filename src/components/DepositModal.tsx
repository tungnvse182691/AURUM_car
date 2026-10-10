import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import type { CarWithBrand } from "../types";
import { formatVND } from "../mocks/db";
import { api } from "../services/api";
import { useAuthStore } from "../stores/useAuthStore";

const AMOUNTS = [50_000_000, 100_000_000, 200_000_000, 500_000_000];

export default function DepositModal({ car, open, onClose }: { car: CarWithBrand; open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState(AMOUNTS[1]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"form" | "busy" | "done" | "error">("form");
  const [errMsg, setErrMsg] = useState("");
  const [orderId, setOrderId] = useState("");
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = async () => {
    setState("busy");
    try {
      const res = await api.createDeposit({ carId: car.id, amount, name: name.trim(), phone: phone.trim(), userId: user?.id });
      setOrderId(res.data.id);
      setState("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Đặt cọc thất bại");
      setState("error");
    }
  };

  const valid = name.trim().length >= 2 && /^[0-9+\s]{9,12}$/.test(phone.trim());

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={onClose}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="grain relative max-h-[92vh] w-full max-w-lg overflow-y-auto border border-gold/30 bg-obsidian"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-gold/50 text-gold"><ShieldCheck size={17} /></span>
                <div>
                  <h3 className="font-condensed text-sm font-semibold uppercase tracking-[0.25em] text-ivory">Đặt cọc giữ xe</h3>
                  <p className="text-xs text-ash">{car.brandName} {car.model} — {formatVND(car.promoPrice ?? car.price)}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-ash hover:text-ivory" aria-label="Đóng"><X size={20} /></button>
            </div>

            {state === "done" ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                  <CheckCircle2 size={56} className="text-gold" />
                </motion.span>
                <h4 className="mt-6 font-display text-3xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Giữ xe thành công</h4>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-ash">
                  Mã giữ chỗ <span className="font-mono text-gold">{orderId}</span>. AURUM giữ xe cho anh trong 72 giờ — cọc hoàn lại 100% nếu đổi ý.
                </p>
                <button onClick={onClose} className="mt-8 bg-gold px-8 py-3.5 font-condensed text-xs font-semibold uppercase tracking-[0.22em] text-obsidian hover:bg-champagne">
                  Hoàn tất
                </button>
              </div>
            ) : (
              <div className="space-y-6 p-6">
                <div>
                  <p className="font-condensed text-xs uppercase tracking-[0.25em] text-ash">Số tiền đặt cọc</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {AMOUNTS.map((a) => (
                      <button key={a} onClick={() => setAmount(a)}
                        className={`border py-3.5 font-condensed text-sm tracking-[0.08em] transition-colors ${amount === a ? "border-gold bg-gold font-semibold text-obsidian" : "border-white/10 text-ivory/70 hover:border-gold/50"}`}>
                        {formatVND(a)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên *"
                    className="border border-white/15 bg-carbon px-4 py-3.5 text-sm text-ivory placeholder:text-ash/60 focus:border-gold focus:outline-none" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại *" inputMode="tel"
                    className="border border-white/15 bg-carbon px-4 py-3.5 text-sm text-ivory placeholder:text-ash/60 focus:border-gold focus:outline-none" />
                </div>
                <div className="border border-gold/25 bg-gold/5 p-4 text-xs leading-relaxed text-ivory/75">
                  <p className="flex gap-2"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-gold" /> Cam kết AURUM: hoàn cọc 100% trong 72 giờ nếu anh đổi ý. Không phí ẩn, hợp đồng điện tử gửi qua SMS.</p>
                </div>
                {state === "error" && <p className="text-sm text-red-300">{errMsg}</p>}
                <button onClick={submit} disabled={!valid || state === "busy"}
                  className="flex w-full items-center justify-center gap-2 bg-gold py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-50">
                  {state === "busy" ? <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</> : `Đặt cọc ${formatVND(amount)}`}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
