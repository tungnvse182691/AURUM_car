import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { loanBreakdown, formatVNDShort } from "../utils/loan";
import { formatVNDFull } from "../mocks/db";
import { CountUp } from "./fx";

interface Props {
  carPrice: number;
  compact?: boolean;
}

const TERMS = [12, 24, 36, 48, 60, 72, 84];

export default function LoanCalculator({ carPrice, compact = false }: Props) {
  const [downPct, setDownPct] = useState(30);
  const [rate, setRate] = useState(8.5);
  const [months, setMonths] = useState(60);

  const calc = useMemo(() => loanBreakdown(carPrice, downPct, rate, months), [carPrice, downPct, rate, months]);

  const sliderCls =
    "w-full accent-[#D4AF37] cursor-pointer";

  return (
    <div className={`border border-white/10 bg-obsidian/70 backdrop-blur ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center border border-gold/50 text-gold">
          <Calculator size={17} />
        </span>
        <div>
          <h3 className="font-condensed text-sm font-semibold uppercase tracking-[0.25em] text-ivory">Tính trả góp</h3>
          <p className="text-xs text-ash">Giá xe: {formatVNDFull(carPrice)}</p>
        </div>
      </div>

      <div className={`mt-6 space-y-5 ${compact ? "" : "md:space-y-6"}`}>
        <div>
          <div className="flex justify-between font-condensed text-xs uppercase tracking-[0.2em]">
            <span className="text-ash">Trả trước</span>
            <span className="text-gold">{downPct}% · {formatVNDShort((carPrice * downPct) / 100)}</span>
          </div>
          <input type="range" min={10} max={80} step={5} value={downPct} onChange={(e) => setDownPct(+e.target.value)} className={`${sliderCls} mt-2`} />
        </div>
        <div>
          <div className="flex justify-between font-condensed text-xs uppercase tracking-[0.2em]">
            <span className="text-ash">Lãi suất / năm</span>
            <span className="text-gold">{rate.toFixed(1).replace(".", ",")}%</span>
          </div>
          <input type="range" min={4} max={15} step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} className={`${sliderCls} mt-2`} />
        </div>
        <div>
          <span className="font-condensed text-xs uppercase tracking-[0.2em] text-ash">Kỳ hạn</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {TERMS.map((t) => (
              <button
                key={t}
                onClick={() => setMonths(t)}
                className={`border px-3.5 py-2 font-condensed text-xs tracking-[0.15em] transition-colors ${
                  months === t ? "border-gold bg-gold text-obsidian font-semibold" : "border-white/15 text-ash hover:border-gold/60 hover:text-ivory"
                }`}
              >
                {t}T
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="font-condensed text-xs uppercase tracking-[0.25em] text-ash">Trả hàng tháng</p>
        <p className="mt-1 font-condensed text-4xl font-semibold text-gold">
          <CountUp key={`${downPct}-${rate}-${months}-${carPrice}`} to={Math.round(calc.monthly)} />
          <span className="ml-1.5 text-base text-ash">₫</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="border border-white/10 p-3">
            <p className="text-ash">Vay ngân hàng</p>
            <p className="mt-1 font-semibold text-ivory">{formatVNDShort(calc.loanAmount)}</p>
          </div>
          <div className="border border-white/10 p-3">
            <p className="text-ash">Tổng lãi phải trả</p>
            <p className="mt-1 font-semibold text-ivory">{formatVNDShort(calc.totalInterest)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
