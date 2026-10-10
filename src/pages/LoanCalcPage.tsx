import { useState } from "react";
import LoanCalculator from "../components/LoanCalculator";
import { SectionHead, Reveal } from "../components/fx";
import { formatVNDShort } from "../utils/loan";

const PRESETS = [3_000_000_000, 5_000_000_000, 8_000_000_000, 12_000_000_000, 20_000_000_000];

export default function LoanCalcPage() {
  const [price, setPrice] = useState(8_000_000_000);

  return (
    <div className="bg-obsidian pt-28">
      <div className="mx-auto max-w-4xl px-6 pb-24">
        <SectionHead
          kicker="Tài chính"
          title={<>Tính toán <em className="text-gold">trả góp</em> minh bạch</>}
        />
        <Reveal delay={0.1}>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-ash">
            Kéo thanh trượt để xem số tiền trả hàng tháng theo thời gian thực. AURUM liên kết 12 ngân hàng với lãi suất ưu đãi từ 4%/năm.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10">
          <p className="font-condensed text-xs uppercase tracking-[0.3em] text-ash">Giá xe dự kiến</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPrice(p)}
                className={`border px-5 py-2.5 font-condensed text-sm tracking-[0.12em] transition-colors ${
                  price === p ? "border-gold bg-gold font-semibold text-obsidian" : "border-white/15 text-ivory/75 hover:border-gold/60 hover:text-ivory"
                }`}
              >
                {formatVNDShort(p)}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={1_000_000_000}
            max={30_000_000_000}
            step={100_000_000}
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
            className="mt-4 w-full cursor-pointer accent-[#D4AF37]"
          />
        </Reveal>

        <Reveal delay={0.2} className="mt-8">
          <LoanCalculator carPrice={price} />
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mt-6 text-center text-xs leading-relaxed text-ash/70">
            * Kết quả chỉ mang tính tham khảo. Lãi suất thực tế phụ thuộc vào hồ sơ tín dụng và chính sách ngân hàng tại thời điểm vay.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
