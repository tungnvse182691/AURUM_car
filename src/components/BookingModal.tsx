import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import type { CarWithBrand } from "../types";
import { api } from "../services/api";

const SLOTS = ["09:00", "10:30", "13:30", "15:00", "16:30", "18:00"];

function nextDays(n: number) {
  const out: { value: string; label: string; dow: string }[] = [];
  const dows = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().slice(0, 10);
    out.push({ value, label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, dow: dows[d.getDay()] });
  }
  return out;
}

export default function BookingModal({ car, open, onClose }: { car: CarWithBrand; open: boolean; onClose: () => void }) {
  const days = useMemo(() => nextDays(14), []);
  const [date, setDate] = useState(days[0].value);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"form" | "busy" | "done" | "error">("form");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const reset = () => {
    setState("form");
    setErrMsg("");
  };

  const submit = async () => {
    setState("busy");
    try {
      await api.bookTestDrive({ carId: car.id, date, slot, name: name.trim(), phone: phone.trim(), note: note.trim() });
      setState("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Đặt lịch thất bại");
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
                <span className="flex h-10 w-10 items-center justify-center border border-gold/50 text-gold"><CalendarCheck size={17} /></span>
                <div>
                  <h3 className="font-condensed text-sm font-semibold uppercase tracking-[0.25em] text-ivory">Đặt lịch lái thử</h3>
                  <p className="text-xs text-ash">{car.brandName} {car.model} {car.year}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-ash hover:text-ivory" aria-label="Đóng"><X size={20} /></button>
            </div>

            {state === "done" ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                  <CheckCircle2 size={56} className="text-gold" />
                </motion.span>
                <h4 className="mt-6 font-display text-3xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Đã nhận lịch hẹn</h4>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-ash">
                  Chuyên gia AURUM sẽ gọi xác nhận cho <span className="text-ivory">{phone}</span> trước giờ hẹn. Anh đến showroom 86 Nguyễn Huệ, Quận 1 — cà phê đã pha sẵn.
                </p>
                <button onClick={() => { reset(); onClose(); }} className="mt-8 bg-gold px-8 py-3.5 font-condensed text-xs font-semibold uppercase tracking-[0.22em] text-obsidian hover:bg-champagne">
                  Tuyệt vời
                </button>
              </div>
            ) : (
              <div className="space-y-6 p-6">
                <div>
                  <p className="font-condensed text-xs uppercase tracking-[0.25em] text-ash">Chọn ngày</p>
                  <div className="mt-3 grid grid-cols-7 gap-1.5">
                    {days.map((d) => (
                      <button key={d.value} onClick={() => setDate(d.value)}
                        className={`flex flex-col items-center border py-2.5 transition-colors ${date === d.value ? "border-gold bg-gold text-obsidian" : "border-white/10 text-ivory/70 hover:border-gold/50"}`}>
                        <span className="text-[10px] uppercase">{d.dow}</span>
                        <span className="mt-0.5 text-xs font-semibold">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-condensed text-xs uppercase tracking-[0.25em] text-ash">Chọn giờ</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {SLOTS.map((s) => (
                      <button key={s} onClick={() => setSlot(s)}
                        className={`border py-3 font-condensed text-sm tracking-[0.1em] transition-colors ${slot === s ? "border-gold bg-gold font-semibold text-obsidian" : "border-white/10 text-ivory/70 hover:border-gold/50"}`}>
                        {s}
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
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (bằng lái, xe muốn so sánh...)" rows={2}
                  className="w-full border border-white/15 bg-carbon px-4 py-3.5 text-sm text-ivory placeholder:text-ash/60 focus:border-gold focus:outline-none" />
                {state === "error" && <p className="text-sm text-red-300">{errMsg}</p>}
                <button onClick={submit} disabled={!valid || state === "busy"}
                  className="flex w-full items-center justify-center gap-2 bg-gold py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-obsidian hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-50">
                  {state === "busy" ? <><Loader2 size={16} className="animate-spin" /> Đang gửi...</> : "Xác nhận đặt lịch"}
                </button>
                <p className="text-center text-[11px] text-ash/70">Miễn phí · Không cần đặt cọc · Hủy linh hoạt trước 4 giờ</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
