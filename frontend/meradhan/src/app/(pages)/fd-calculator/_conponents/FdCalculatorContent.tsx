import React from "react";

const FdCalculatorContent = () => {


  return (
    <section>
      <div className="container ">
        <div className="article md:py-12">
          <h3>1. What is an FD Calculator?</h3>
          <p>
            An FD Calculator estimates how much your deposit will grow over a
            chosen tenure at a given interest rate. It supports common payout
            frequencies (Monthly, Quarterly, Half-yearly, Yearly) and can show
            either interest-payout plans or cumulative (reinvested) growth.
          </p>

          <h3>2. How to Use the MeraDhan FD Calculator</h3>
          <ul>
            <li>
              Select the payout frequency: Monthly, Quarterly, Half-yearly, or
              Yearly.
            </li>
            <li>Enter the deposit (investment) amount.</li>
            <li>Choose the start date and the tenure (months/years).</li>
            <li>Enter the offered annual interest rate (p.a.).</li>
            <li>
              Click <em>Calculate</em> to view the estimated maturity value and
              total interest earned.
            </li>
          </ul>

          <h3>3. Calculating Returns in Excel (Optional)</h3>
          <p>
            Prefer doing it manually? You can approximate FD growth with Excel:
          </p>
          <ul>
            <li>
              For cumulative FDs, use periodic compounding:
              <br />
              <code>
                =Principal * (1 +
                Rate/CompoundsPerYear)^(CompoundsPerYear*Years)
              </code>
            </li>
            <li>
              For interest-payout FDs (monthly/quarterly, etc.), compute
              periodic interest:
              <br />
              <code>
                Periodic Interest = Principal * (Rate/CompoundsPerYear)
              </code>
            </li>
            <li>
              If you have irregular cash flows (top-ups/withdrawals), you can
              use
              <strong> XIRR</strong>:
              <br />
              List outflows as negative and inflows as positive, then use
              <code> XIRR(values, dates, [guess])</code>.
            </li>
          </ul>

          <h3>4. When to Use FD vs. XIRR</h3>
          <p>
            Use the FD Calculator for standard fixed deposits with a fixed rate
            and regular compounding or payouts. Use <strong>XIRR</strong> when
            your cash flows are irregular (e.g., SIP-like deposits or partial
            withdrawals) and you want an annualized return that factors in
            timing.
          </p>

          <h3>5. CAGR vs. FD (and XIRR)</h3>
          <p>
            <strong>CAGR</strong> assumes smooth, lump-sum growth between a
            start and end value. It’s great for a single buy-and-hold scenario.{" "}
            <strong>XIRR</strong> is better when deposits/withdrawals happen on
            different dates. The <strong>FD Calculator</strong> focuses on
            fixed-rate, bank-style deposits with defined compounding or periodic
            interest payouts.
          </p>

          <h3>6. Benefits of Using the FD Calculator</h3>
          <ul>
            <li>
              <strong>Accurate Estimates:</strong> See maturity value and total
              interest for chosen tenure and frequency.
            </li>
            <li>
              <strong>Annualized View:</strong> Understand effective annual
              yield under different compounding options.
            </li>
            <li>
              <strong>Planning:</strong> Compare plans and align payouts
              (monthly/quarterly) to your cash-flow needs.
            </li>
            <li>
              <strong>Easy & Fast:</strong> Get instant results without manual
              math.
            </li>
          </ul>

          <h3>7. Important Notes & Disclaimer</h3>
          <ul>
            <li>
              Actual bank/NBFC rates, compounding rules, and TDS (tax) may
              affect your real returns.
            </li>
            <li>
              This tool provides estimates for education/planning and is not
              financial advice.
            </li>
            <li>
              Always verify current rates, penalties, and terms with your
              provider before investing.
            </li>
          </ul>

          <h3>8. Need Help?</h3>
          <p>
            For feedback or support, write to{" "}
            <strong>support@meradhan.co</strong>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FdCalculatorContent;
