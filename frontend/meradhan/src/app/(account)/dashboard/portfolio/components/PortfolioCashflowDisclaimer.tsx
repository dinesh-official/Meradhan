export default function PortfolioCashflowDisclaimer() {
  return (
    <aside
      className="mt-6 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-slate-700"
      aria-label="Important disclaimer"
    >
      <h2 className="mb-2 text-base font-semibold text-slate-900">
        Important Disclaimer
      </h2>
      <p className="leading-relaxed">
        All coupon payments (interest) and redemption/maturity proceeds are
        credited directly by the Issuer/RTA through the Depository system to
        the bank account registered with your Demat account. MeraDhan acts
        solely as an Online Bond Platform Provider (OBPP) and does not hold,
        receive, process, or control such payouts. Investors are advised to
        ensure that their Demat-linked bank account details are accurate,
        active, and updated at all times. Any delay or failure in receipt of
        coupon or redemption proceeds due to incorrect or outdated bank account
        details shall be the responsibility of the investor.
      </p>
    </aside>
  );
}
