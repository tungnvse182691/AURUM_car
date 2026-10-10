import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { api } from "../../services/api";
import { brands, formatVND } from "../../mocks/db";
import type { CarWithBrand } from "../../types";

const EMPTY = {
  brandId: "mercedes-amg",
  model: "",
  trim: "",
  year: new Date().getFullYear(),
  price: 5000000000,
  promoPrice: "",
  mileage: 0,
  extColor: "",
  intColor: "",
  transmission: "AT",
  fuel: "Xăng",
  engine: "",
  powerHp: 0,
  torqueNm: 0,
  drivetrain: "AWD",
  seats: 4,
  doors: 4,
  consumption: 0,
  description: "",
  features: "",
  images: "",
  status: "available",
  isNew: false,
  isFeatured: false,
};

type FormState = typeof EMPTY;

function CarForm({ initial, onSave, onClose }: { initial?: CarWithBrand; onSave: (body: Record<string, unknown>) => Promise<void>; onClose: () => void }) {
  const [f, setF] = useState<FormState>(() =>
    initial
      ? {
          ...EMPTY,
          brandId: initial.brandId,
          model: initial.model,
          trim: initial.trim,
          year: initial.year,
          price: initial.price,
          promoPrice: initial.promoPrice ? String(initial.promoPrice) : "",
          mileage: initial.mileage,
          extColor: initial.extColor,
          intColor: initial.intColor,
          transmission: initial.transmission,
          fuel: initial.fuel,
          engine: initial.engine,
          powerHp: initial.powerHp,
          torqueNm: initial.torqueNm,
          drivetrain: initial.drivetrain,
          seats: initial.seats,
          doors: initial.doors,
          consumption: initial.consumption,
          description: initial.description,
          features: initial.features.join("\n"),
          images: initial.images.join("\n"),
          status: initial.status,
          isNew: initial.isNew,
          isFeatured: initial.isFeatured,
        }
      : EMPTY,
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof FormState, v: unknown) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await onSave({
        ...f,
        price: Number(f.price),
        promoPrice: f.promoPrice ? Number(f.promoPrice) : undefined,
        year: Number(f.year),
        mileage: Number(f.mileage),
        powerHp: Number(f.powerHp),
        torqueNm: Number(f.torqueNm),
        seats: Number(f.seats),
        doors: Number(f.doors),
        consumption: Number(f.consumption),
        features: String(f.features).split("\n").map((x) => x.trim()).filter(Boolean),
        images: String(f.images).split("\n").map((x) => x.trim()).filter(Boolean),
      });
      onClose();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Lưu thất bại");
    } finally {
      setBusy(false);
    }
  };

  const inp = "w-full border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-ivory placeholder:text-ash/50 focus:border-gold focus:outline-none";
  const lbl = "font-condensed text-[11px] uppercase tracking-[0.2em] text-ash";

  const field = (label: string, el: React.ReactNode, span = false) => (
    <label className={`block ${span ? "sm:col-span-2" : ""}`}>
      <span className={lbl}>{label}</span>
      <div className="mt-1.5">{el}</div>
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {field("Hãng *", (
        <select value={f.brandId} onChange={(e) => set("brandId", e.target.value)} className={inp}>
          {brands.map((b) => <option key={b.id} value={b.id} className="bg-obsidian">{b.name}</option>)}
        </select>
      ))}
      {field("Model *", <input required value={f.model} onChange={(e) => set("model", e.target.value)} placeholder="VD: GT 63 S" className={inp} />)}
      {field("Trim", <input value={f.trim} onChange={(e) => set("trim", e.target.value)} placeholder="VD: 4-Door Coupé" className={inp} />)}
      {field("Năm", <input type="number" value={f.year} onChange={(e) => set("year", e.target.value)} className={inp} />)}
      {field("Giá bán (VND) *", <input required type="number" min={0} value={f.price} onChange={(e) => set("price", e.target.value)} className={inp} />)}
      {field("Giá khuyến mãi (VND)", <input type="number" min={0} value={f.promoPrice} onChange={(e) => set("promoPrice", e.target.value)} placeholder="Để trống nếu không có" className={inp} />)}
      {field("Động cơ", <input value={f.engine} onChange={(e) => set("engine", e.target.value)} placeholder="VD: V8 4.0L Biturbo" className={inp} />)}
      {field("Công suất (HP)", <input type="number" value={f.powerHp} onChange={(e) => set("powerHp", e.target.value)} className={inp} />)}
      {field("Mô-men xoắn (Nm)", <input type="number" value={f.torqueNm} onChange={(e) => set("torqueNm", e.target.value)} className={inp} />)}
      {field("Số km", <input type="number" min={0} value={f.mileage} onChange={(e) => set("mileage", e.target.value)} className={inp} />)}
      {field("Nhiên liệu", (
        <select value={f.fuel} onChange={(e) => set("fuel", e.target.value)} className={inp}>
          {["Xăng", "Dầu", "Hybrid", "Điện"].map((x) => <option key={x} className="bg-obsidian">{x}</option>)}
        </select>
      ))}
      {field("Hộp số", (
        <select value={f.transmission} onChange={(e) => set("transmission", e.target.value)} className={inp}>
          <option value="AT" className="bg-obsidian">Tự động</option>
          <option value="MT" className="bg-obsidian">Số sàn</option>
        </select>
      ))}
      {field("Màu ngoại thất", <input value={f.extColor} onChange={(e) => set("extColor", e.target.value)} className={inp} />)}
      {field("Màu nội thất", <input value={f.intColor} onChange={(e) => set("intColor", e.target.value)} className={inp} />)}
      {field("Trạng thái", (
        <select value={f.status} onChange={(e) => set("status", e.target.value)} className={inp}>
          <option value="available" className="bg-obsidian">Sẵn giao</option>
          <option value="reserved" className="bg-obsidian">Đã giữ chỗ</option>
          <option value="sold" className="bg-obsidian">Đã bán</option>
        </select>
      ))}
      {field("Dẫn động", <input value={f.drivetrain} onChange={(e) => set("drivetrain", e.target.value)} className={inp} />)}
      {field("Mô tả", <textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} className={inp} />, true)}
      {field("Trang bị (mỗi dòng 1 mục)", <textarea rows={3} value={f.features} onChange={(e) => set("features", e.target.value)} className={inp} />, true)}
      {field("Ảnh (mỗi dòng 1 URL Unsplash)", <textarea rows={2} value={f.images} onChange={(e) => set("images", e.target.value)} placeholder="https://images.unsplash.com/photo-..." className={inp} />, true)}
      <div className="flex gap-6 sm:col-span-2">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ivory/80">
          <input type="checkbox" checked={f.isNew} onChange={(e) => set("isNew", e.target.checked)} className="h-4 w-4 accent-[#D4AF37]" /> Xe mới 100%
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ivory/80">
          <input type="checkbox" checked={f.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="h-4 w-4 accent-[#D4AF37]" /> Nổi bật trang chủ
        </label>
      </div>
      {err && <p className="text-sm text-red-300 sm:col-span-2">{err}</p>}
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" onClick={onClose} className="border border-white/15 px-6 py-3 font-condensed text-xs uppercase tracking-[0.2em] text-ivory/70 hover:text-ivory">
          Hủy
        </button>
        <button type="submit" disabled={busy} className="bg-gold px-8 py-3 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-obsidian hover:bg-champagne disabled:opacity-60">
          {busy ? "Đang lưu..." : initial ? "Cập nhật" : "Thêm xe"}
        </button>
      </div>
    </form>
  );
}

export default function AdminCars() {
  const [cars, setCars] = useState<CarWithBrand[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | CarWithBrand | null>(null);
  const [del, setDel] = useState<CarWithBrand | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api.cars().then((r) => setCars(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = cars.filter((c) =>
    `${c.brandName} ${c.model} ${c.trim}`.toLowerCase().includes(q.toLowerCase()),
  );

  const save = async (body: Record<string, unknown>) => {
    if (modal === "add") await api.createCar(body);
    else if (modal) await api.updateCar(modal.id, body);
    load();
  };

  const doDelete = async () => {
    if (!del) return;
    setBusy(true);
    try {
      await api.deleteCar(del.id);
      setDel(null);
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-condensed text-xs uppercase tracking-[0.4em] text-gold">Kho xe</p>
          <h1 className="mt-2 font-display text-4xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Quản lý {cars.length} xe
          </h1>
        </div>
        <button onClick={() => setModal("add")} className="flex items-center gap-2 bg-gold px-6 py-3.5 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-obsidian hover:bg-champagne">
          <Plus size={15} /> Thêm xe
        </button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm xe..."
          className="w-full border border-white/15 bg-carbon py-3 pl-11 pr-4 text-sm text-ivory placeholder:text-ash/60 focus:border-gold focus:outline-none" />
      </div>

      <div className="mt-6 overflow-x-auto border border-white/10">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="bg-carbon font-condensed text-[11px] uppercase tracking-[0.2em] text-ash">
              {["Xe", "Năm", "Giá", "Trạng thái", "Lượt xem", "Nổi bật", ""].map((h) => (
                <th key={h} className="border-b border-white/10 px-4 py-3.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ash">Đang tải...</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={c.images[0]} alt="" className="h-11 w-16 object-cover" loading="lazy" />
                    <div>
                      <p className="text-ivory">{c.brandName} {c.model}</p>
                      <p className="text-xs text-ash">{c.trim}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ash">{c.year}</td>
                <td className="px-4 py-3 font-condensed text-gold">{formatVND(c.promoPrice ?? c.price)}</td>
                <td className="px-4 py-3">
                  <span className={`border px-2.5 py-1 font-condensed text-[10px] uppercase tracking-[0.15em] ${
                    c.status === "available" ? "border-emerald-800 text-emerald-300" : c.status === "sold" ? "border-white/15 text-ash" : "border-gold/50 text-gold"
                  }`}>
                    {c.status === "available" ? "Sẵn giao" : c.status === "sold" ? "Đã bán" : "Giữ chỗ"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ash">{c.views.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3">{c.isFeatured ? <span className="text-gold">★</span> : <span className="text-ash/40">—</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => setModal(c)} className="p-2 text-ash hover:text-gold" aria-label="Sửa"><Pencil size={15} /></button>
                    <button onClick={() => setDel(c)} className="p-2 text-ash hover:text-red-300" aria-label="Xóa"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* add/edit modal */}
      {modal && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="my-8 w-full max-w-3xl border border-gold/30 bg-obsidian p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-3xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {modal === "add" ? "Thêm xe mới" : `Sửa ${modal.brandName} ${modal.model}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-ash hover:text-ivory" aria-label="Đóng"><X size={20} /></button>
            </div>
            <CarForm initial={modal === "add" ? undefined : modal} onSave={save} onClose={() => setModal(null)} />
          </div>
        </div>
      )}

      {/* delete confirm */}
      {del && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setDel(null)}>
          <div className="w-full max-w-md border border-white/15 bg-obsidian p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <Trash2 size={32} className="mx-auto text-red-300" />
            <h3 className="mt-4 font-display text-2xl text-ivory" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Xóa xe này?</h3>
            <p className="mt-2 text-sm text-ash">{del.brandName} {del.model} {del.year} sẽ bị xóa khỏi kho. Không thể hoàn tác.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setDel(null)} className="border border-white/15 px-6 py-3 font-condensed text-xs uppercase tracking-[0.2em] text-ivory/70">Hủy</button>
              <button onClick={doDelete} disabled={busy} className="bg-red-900 px-6 py-3 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-red-100 hover:bg-red-800 disabled:opacity-60">
                {busy ? "Đang xóa..." : "Xóa xe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
