import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AurumLogo from "../components/brand/AurumLogo";
import { Magnetic } from "../components/fx";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="grain relative flex min-h-screen flex-col items-center justify-center bg-obsidian px-6 pt-20 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-[130px]"
        style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }}
      />
      <AurumLogo variant="icon" className="h-20 w-20 opacity-90" />
      <p className="mt-8 font-condensed text-xs uppercase tracking-[0.4em] text-oldgold">Đang chế tác</p>
      <h1 className="mt-4 font-display text-5xl text-ivory md:text-6xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {title}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ash">
        Phân xưởng AURUM đang hoàn thiện khu vực này. Quay lại trang chủ trong lúc chờ nhé.
      </p>
      <Magnetic>
        <Link to="/" className="mt-8 inline-flex items-center gap-3 border border-gold/50 px-8 py-4 font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-obsidian">
          <ArrowLeft size={16} /> Về trang chủ
        </Link>
      </Magnetic>
    </div>
  );
}
