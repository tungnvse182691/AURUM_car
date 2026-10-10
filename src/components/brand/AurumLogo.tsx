/**
 * AURUM — "The Gilded Apex" emblem
 * Monogram A + crown apex + diamond crossbar, double-circle badge.
 * Variants: "full" (emblem + stacked wordmark) | "icon" (emblem only) | "mono" (single-color)
 */

type LogoVariant = "full" | "icon" | "mono";

interface AurumLogoProps {
  variant?: LogoVariant;
  /** gold glow drop-shadow on dark backgrounds */
  glow?: boolean;
  /** monochrome color for "mono" variant */
  monoColor?: string;
  className?: string;
}

const GOLD_STOPS = [
  { offset: "0%", color: "#8A6A2F" },
  { offset: "22%", color: "#C9A227" },
  { offset: "40%", color: "#F6E27A" },
  { offset: "55%", color: "#E8C66A" },
  { offset: "75%", color: "#B48A3C" },
  { offset: "100%", color: "#6E5320" },
] as const;

function EmblemPaths({ fill, diamondFill }: { fill: string; diamondFill: string }) {
  return (
    <g>
      <circle cx="100" cy="100" r="94" fill="none" stroke={fill} strokeWidth="3" />
      <circle cx="100" cy="100" r="82" fill="none" stroke={fill} strokeWidth="1.5" />
      {/* crown */}
      <path d="M82 70 L87 52 L93 62 L100 48 L107 62 L113 52 L118 70 Z" fill={fill} />
      {/* A */}
      <path d="M100 66 L142 150 L124 150 L100 98 L76 150 L58 150 Z" fill={fill} />
      {/* diamond crossbar */}
      <path d="M100 106 L114 120 L100 134 L86 120 Z" fill={diamondFill} />
    </g>
  );
}

export default function AurumLogo({
  variant = "full",
  glow = false,
  monoColor = "#C9A227",
  className = "",
}: AurumLogoProps) {
  const gid = `aurumGold-${variant}-${glow ? "glow" : "flat"}`;
  const isMono = variant === "mono";
  const paint = isMono ? monoColor : `url(#${gid})`;
  const diamond = isMono ? monoColor : "#F6E27A";

  const emblem = (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Aurum logo">
      <defs>
        {!isMono && (
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            {GOLD_STOPS.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        )}
        {glow && !isMono && (
          <filter id={`${gid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#D4AF37" floodOpacity="0.35" />
          </filter>
        )}
      </defs>
      <g filter={glow && !isMono ? `url(#${gid}-glow)` : undefined}>
        <EmblemPaths fill={paint} diamondFill={diamond} />
      </g>
    </svg>
  );

  if (variant === "icon" || variant === "mono") return emblem;

  // full: emblem + stacked wordmark
  return (
    <span className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <svg viewBox="0 0 200 200" className="h-20 w-20" role="img" aria-label="Aurum emblem">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            {GOLD_STOPS.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
          {glow && (
            <filter id={`${gid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#D4AF37" floodOpacity="0.35" />
            </filter>
          )}
        </defs>
        <g filter={glow ? `url(#${gid}-glow)` : undefined}>
          <EmblemPaths fill={`url(#${gid})`} diamondFill="#F6E27A" />
        </g>
      </svg>
      <span
        className="font-cinzel text-2xl font-bold tracking-[0.35em] text-ivory"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        AURUM
      </span>
    </span>
  );
}
