import React from 'react'

const FdCalculatorDoc = () => {
  return (
     <div className="max-w-[70%] space-y-12 text-slate-800 mx-auto mt-[4rem] mb-[4rem]">
        <section>
          <h3 className="text-2xl md:text-3xl font-semibold">
            What is an FD Calculator?
          </h3>
          <p className="mt-3 text-[15px] md:text-[16px] leading-relaxed max-w-[1050px]">
            The Extended Internal Rate of Return (XIRR) is a powerful tool for
            calculating investment returns when multiple transactions occur at
            different times. Unlike simple rate calculations, XIRR accounts for
            varying investment amounts and intervals, making it especially
            useful for SIPs and other investments with irregular cash flows.
          </p>
        </section>

        <section>
          <h3 className="text-2xl md:text-3xl font-semibold">
            How to Use the MeraDhan FD Calculator:
          </h3>
          <ol className="mt-4 list-decimal pl-6 space-y-2 text-[15px] md:text-[16px] max-w-[1000px]">
            <li>
              Select the frequency: Choose from Monthly, Quarterly, Half-yearly,
              or Yearly.
            </li>
            <li>Enter the start date of your transaction.</li>
            <li>Enter the investment amount.</li>
            <li>Provide the maturity date and amount.</li>
            <li>Click calculate to view the XIRR.</li>
          </ol>
        </section>

        <section>
          <h3 className="text-2xl md:text-3xl font-semibold">
            Calculating XIRR in Excel:
          </h3>
          <p className="mt-3 text-[15px] md:text-[16px]">
            To manually calculate XIRR in Excel:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-[15px] md:text-[16px] max-w-[1000px]">
            <li>
              List all transactions in one column (outflows as negative, inflows
              as positive).
            </li>
            <li>Enter corresponding dates in the adjacent column.</li>
            <li>
              Use the formula:{" "}
              <code className="rounded bg-slate-100 px-2 py-0.5">
                XIRR(values, dates, [guess])
              </code>{" "}
              to compute the result.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl md:text-3xl font-semibold">
            When to Use FD?
          </h3>
          <p className="mt-3 text-[15px] md:text-[16px] leading-relaxed max-w-[1100px]">
            XIRR is ideal when your investment transactions are spread over
            time, such as SIPs or irregular deposits and withdrawals. It
            provides a more accurate measure of your investment growth,
            considering the timing of each cash flow.
          </p>
        </section>

        <section>
          <h3 className="text-2xl md:text-3xl font-semibold">
            Difference between CAGR and FD
          </h3>
          <p className="mt-3 text-[15px] md:text-[16px] leading-relaxed max-w-[1150px]">
            CAGR (Compounded Annual Growth Rate) measures the fixed annual
            growth of an investment, suitable for uniform transactions. However,
            XIRR is more accurate when investments vary in amount or frequency,
            making it the preferred metric for SIPs and other irregular
            investments.
          </p>
        </section>

        {/* Benefits of Using the FD Calculator */}
        <section>
          <h3 className="text-2xl md:text-3xl font-semibold">
            Benefits of Using the FD Calculator
          </h3>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-[15px] md:text-[16px] max-w-[1000px]">
            <li>Handles irregular cash flows and dates with precision.</li>
            <li>
              Gives a realistic picture of returns compared to simple interest
              methods.
            </li>
            <li>
              Great for SIPs, step-up investments, and goal-based planning.
            </li>
            <li>Quick, clean interface to test multiple scenarios.</li>
          </ul>
        </section>
      </div>
  )
}

export default FdCalculatorDoc