/** Monthly payment (PMT): P * r(1+r)^n / ((1+r)^n - 1) */
export function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

export interface LoanBreakdown {
  monthly: number;
  totalInterest: number;
  totalPaid: number;
  loanAmount: number;
}

export function loanBreakdown(
  carPrice: number,
  downPct: number,
  annualRatePct: number,
  months: number,
): LoanBreakdown {
  const down = (carPrice * downPct) / 100;
  const loanAmount = carPrice - down;
  const monthly = monthlyPayment(loanAmount, annualRatePct, months);
  const totalPaid = monthly * months + down;
  return { monthly, totalInterest: totalPaid - carPrice, totalPaid, loanAmount };
}

/** Format "12,1 tỷ" style for sliders */
export function formatVNDShort(n: number): string {
  if (n >= 1_000_000_000) {
    const t = n / 1_000_000_000;
    return `${t % 1 === 0 ? t : t.toFixed(1).replace(".", ",")} tỷ`;
  }
  return `${Math.round(n / 1_000_000)} tr`;
}
