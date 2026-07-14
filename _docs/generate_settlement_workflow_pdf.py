#!/usr/bin/env python3
"""Generate business understanding PDF for Order Settlement Stage Workflow."""

from datetime import date
from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parent / "MeraDhan-Order-Settlement-Workflow-Business-Guide.pdf"


class BizPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(90, 90, 90)
        self.cell(0, 8, "MeraDhan | Order Settlement Workflow - Business Guide", align="L")
        self.ln(4)
        self.set_draw_color(30, 64, 175)
        self.set_line_width(0.4)
        self.line(15, self.get_y(), 195, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Confidential  |  {date.today().isoformat()}  |  Page {self.page_no()}/{{nb}}", align="C")

    def h1(self, text: str):
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(30, 64, 175)
        self.multi_cell(0, 9, text)
        self.ln(2)

    def h2(self, text: str):
        self.ln(2)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(15, 23, 42)
        self.multi_cell(0, 7, text)
        self.ln(1)

    def h3(self, text: str):
        self.ln(1)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(30, 64, 175)
        self.multi_cell(0, 6, text)
        self.ln(0.5)

    def body(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, text)
        self.ln(1.5)

    def bullet(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        x = self.get_x()
        self.cell(6, 5.5, "-")
        self.multi_cell(0, 5.5, text)
        self.ln(0.5)

    def callout(self, title: str, text: str):
        self.set_fill_color(239, 246, 255)
        self.set_draw_color(30, 64, 175)
        y0 = self.get_y()
        self.set_x(15)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(30, 64, 175)
        self.multi_cell(180, 6, title, fill=True)
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 30, 30)
        self.set_x(15)
        self.multi_cell(180, 5.2, text, fill=True)
        self.ln(3)

    def table(self, headers, rows, col_widths=None):
        if col_widths is None:
            w = 180 / len(headers)
            col_widths = [w] * len(headers)
        self.set_font("Helvetica", "B", 9)
        self.set_fill_color(30, 64, 175)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True, align="C")
        self.ln()
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(30, 30, 30)
        fill = False
        for row in rows:
            self.set_fill_color(248, 250, 252) if fill else self.set_fill_color(255, 255, 255)
            # Estimate row height from tallest cell
            line_h = 5
            max_lines = 1
            for i, cell in enumerate(row):
                lines = self.multi_cell(col_widths[i], line_h, str(cell), dry_run=True, output="LINES")
                max_lines = max(max_lines, len(lines))
            row_h = max(line_h * max_lines, 7)
            if self.get_y() + row_h > 275:
                self.add_page()
            y = self.get_y()
            x = 15
            for i, cell in enumerate(row):
                self.set_xy(x, y)
                self.multi_cell(col_widths[i], line_h, str(cell), border=1, fill=fill)
                x += col_widths[i]
            self.set_y(y + row_h)
            fill = not fill
        self.ln(2)


def build():
    pdf = BizPDF(format="A4", unit="mm")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_left_margin(15)
    pdf.set_right_margin(15)

    # ── Cover ──
    pdf.add_page()
    pdf.ln(40)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 64, 175)
    pdf.cell(0, 8, "MERADHAN  |  OPERATIONS & PRODUCT", align="C")
    pdf.ln(18)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(15, 23, 42)
    pdf.multi_cell(0, 10, "Order Settlement Workflow", align="C")
    pdf.ln(2)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(30, 64, 175)
    pdf.multi_cell(0, 8, "Business Understanding Guide", align="C")
    pdf.ln(10)
    pdf.set_draw_color(30, 64, 175)
    pdf.set_line_width(0.8)
    pdf.line(60, pdf.get_y(), 150, pdf.get_y())
    pdf.ln(12)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(60, 60, 60)
    pdf.multi_cell(
        0,
        6,
        "How post-payment bond settlement works on NSE RFQ,\n"
        "what happens when a step fails, and how Operations resumes safely.",
        align="C",
    )
    pdf.ln(20)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"Document date: {date.today().strftime('%d %B %Y')}", align="C")
    pdf.ln(6)
    pdf.cell(0, 6, "Audience: Product, Operations, CRM Admins, Leadership", align="C")
    pdf.ln(6)
    pdf.cell(0, 6, "Status: Live workflow (stage-based settlement)", align="C")

    # ── 1. Purpose ──
    pdf.add_page()
    pdf.h1("1. Purpose of this document")
    pdf.body(
        "After a customer successfully pays for a bond order, MeraDhan must complete a "
        "regulated settlement journey with the exchange (NSE RFQ) and, for some payments, "
        "route funds via Razorpay. This document explains that journey in business terms -- "
        "not as engineering design notes."
    )
    pdf.body(
        "It covers: why stage tracking was introduced, what each step means commercially, "
        "the hard rules when something fails, how automatic recovery and manual CRM resume "
        "work, and what changed recently so Operations can trust the Settlement Pipeline screen."
    )

    # ── 2. Business problem ──
    pdf.h1("2. Business problem we solved")
    pdf.h2("Before")
    pdf.bullet("Payment success triggered a long chain of settlement actions.")
    pdf.bullet("If one middle step failed (for example Deal Accept), the system often could not safely continue from that point.")
    pdf.bullet("Retries risked restarting from the beginning -- with risk of duplicate exchange activity.")
    pdf.bullet("Ops could not clearly see which step succeeded, which failed, or what the exchange returned.")

    pdf.h2("After")
    pdf.bullet("Settlement is tracked as a fixed sequence of business stages.")
    pdf.bullet("Each stage stores status, retries, request summary, and response / error.")
    pdf.bullet("Resume always starts at the first incomplete or failed stage.")
    pdf.bullet("Successful earlier stages are never re-run.")
    pdf.bullet("CRM shows a Settlement Pipeline timeline with Continue for controlled resume.")

    # ── 3. When this starts ──
    pdf.h1("3. When this workflow starts")
    pdf.body(
        "This workflow begins only after payment is confirmed as successful (captured). "
        "It is not the customer's checkout flow. It is the back-office settlement automation "
        "that turns a paid order into a completed exchange deal (and optional PG routing)."
    )
    pdf.callout(
        "Business boundary",
        "Payment capture / abandoned-order recovery remains a separate process. "
        "This guide is only about post-payment NSE settlement stages and resume.",
    )

    # ── 4. Pipeline ──
    pdf.h1("4. Settlement pipeline (business sequence)")
    pdf.body(
        "Every paid order moves through the stages below in order. "
        "A later stage must not be treated as complete while an earlier stage is still failed or pending."
    )
    pdf.table(
        ["#", "Stage", "Business meaning", "Outcome when successful"],
        [
            ["1", "Add ISIN", "Create / register the RFQ for this ISIN and quantity on NSE.", "RFQ number and deal context available"],
            ["2", "Quote Accept", "Accept the negotiation quote for the trade.", "Negotiation accepted; trade can be proposed"],
            ["3", "Deal Propose", "Propose the deal to the exchange with price and accruals.", "Deal proposed on NSE"],
            ["4", "Deal Accept", "Confirm / accept the deal on NSE.", "Deal accepted; order can move to in-progress"],
            ["5", "PG Routing", "For netbanking only: route payment via Razorpay to the linked path.", "Transfer created, or step skipped if not netbanking"],
        ],
        [12, 32, 78, 58],
    )
    pdf.body(
        "After all required stages succeed, the system runs post-settlement actions "
        "(settled-order sync and order receipt email) -- these are completion activities, "
        "not separate timeline stages on the CRM card."
    )

    # ── 5. Golden rules ──
    pdf.add_page()
    pdf.h1("5. Golden business rules")
    pdf.h2("Rule 1 -- Hard stop on failure")
    pdf.body(
        "If any stage fails, the pipeline stops immediately. "
        "No later stage is executed in that run. "
        "Example: if Deal Accept fails, PG Routing must not run in the same attempt."
    )
    pdf.h2("Rule 2 -- Resume from the broken step only")
    pdf.body(
        "Automatic recovery and manual CRM Continue both start at the first stage that is not successful "
        "(usually the failed step). Earlier successful stages are skipped."
    )
    pdf.h2("Rule 3 -- Move forward only after success")
    pdf.body(
        "Only when the failed / pending stage succeeds may the system continue to the next stages "
        "in the same job. If it fails again, it stops again at that stage."
    )
    pdf.h2("Rule 4 -- Same rule for auto and manual")
    pdf.body(
        "Whether settlement was triggered by payment webhook, reconciliation, cron backstop, "
        "or CRM Continue -- the sequential dependency is identical."
    )
    pdf.callout(
        "One-line policy",
        "A broken step is a hard stop until it becomes SUCCESS. Then, and only then, the flow may continue.",
    )

    # ── 6. Triggers ──
    pdf.h1("6. How settlement is triggered")
    pdf.table(
        ["Trigger", "Who / what", "Business intent"],
        [
            ["Payment success", "System after capture", "Start settlement immediately for a newly paid order"],
            ["Payment reconciliation", "Backstop job", "Recover paid orders that did not start settlement cleanly"],
            ["Stage reconciliation cron", "Every 30 minutes", "Retry stuck incomplete pipelines without waiting for Ops"],
            ["CRM Continue", "Ops / Admin on order details", "Manually resume from the failed / next incomplete step"],
        ],
        [42, 48, 90],
    )

    pdf.h2("Automatic run")
    pdf.bullet("Starts from the first incomplete stage (often Add ISIN on a fresh order).")
    pdf.bullet("Runs forward while stages succeed.")
    pdf.bullet("Stops on first failure and keeps that stage marked Failed.")

    pdf.h2("Manual CRM Continue")
    pdf.bullet("Ops reviews the Settlement Pipeline and clicks Continue.")
    pdf.bullet("System confirms, then queues the same settlement worker.")
    pdf.bullet("Worker resumes at the failed / next incomplete stage.")
    pdf.bullet("If that stage still fails, later stages still do not run.")
    pdf.bullet("Manual Continue can retry even if automatic max attempts (5) were reached.")

    # ── 7. Status model ──
    pdf.add_page()
    pdf.h1("7. Stage statuses (what Ops sees)")
    pdf.table(
        ["Status", "Meaning for business"],
        [
            ["Not started", "This step has not been attempted yet."],
            ["Waiting", "This step is currently being processed."],
            ["Done", "This step completed successfully."],
            ["Skipped", "Step not required for this payment method (typically PG Routing for non-netbanking). Marked only after earlier stages succeed."],
            ["Failed", "Step failed. Pipeline stopped here. Resume retries from here."],
            ["Next", "UI hint: this is the stage Continue will target."],
        ],
        [35, 145],
    )
    pdf.body("Each stage also shows Retries X/5 -- how many times the system has attempted that step.")

    # ── 8. Payment method ──
    pdf.h1("8. Payment method and PG Routing")
    pdf.h2("Netbanking")
    pdf.body(
        "PG Routing is a real settlement step. After Deal Accept succeeds, the system creates "
        "the Razorpay route transfer. If routing fails, the order stays incomplete at PG Routing."
    )
    pdf.h2("Non-netbanking (UPI / card / other)")
    pdf.body(
        "The Razorpay route API is not called. PG Routing is marked Skipped only after all prior "
        "NSE stages have succeeded. It must not appear as Done while Deal Accept (or any earlier stage) is Failed."
    )
    pdf.callout(
        "Why this matters",
        "Earlier, non-netbanking orders could show PG Routing as Done immediately at seed time. "
        "That looked like the pipeline had moved past a failure. That misleading behaviour was corrected.",
    )

    # ── 9. CRM ──
    pdf.h1("9. CRM Settlement Pipeline (Ops view)")
    pdf.bullet("Horizontal timeline of all five stages with timestamps and retry counts.")
    pdf.bullet("Click a stage to open request / response / error details.")
    pdf.bullet("Next-step strip shows the stage to resume, last error (if any), and a single Continue button.")
    pdf.bullet("Continue asks for confirmation before queueing resume.")
    pdf.bullet("Successful earlier steps are skipped on resume (shown in helper copy).")

    # ── 10. Scenarios ──
    pdf.add_page()
    pdf.h1("10. Worked examples")
    pdf.h3("Example A -- Happy path (UPI)")
    pdf.bullet("Payment captured -> Add ISIN -> Quote Accept -> Deal Propose -> Deal Accept -> PG Routing Skipped -> receipt.")
    pdf.bullet("All NSE stages Done; PG shows Skipped.")

    pdf.h3("Example B -- Failure at Deal Accept")
    pdf.bullet("Stages 1-3 Done; Deal Accept Failed; PG Routing remains not started (not Done).")
    pdf.bullet("Cron or CRM Continue retries Deal Accept only.")
    pdf.bullet("If Deal Accept fails again -> still stop; PG still not started.")
    pdf.bullet("If Deal Accept succeeds -> then PG Routing is skipped (non-netbanking) or executed (netbanking).")

    pdf.h3("Example C -- Manual resume after max automatic retries")
    pdf.bullet("Automatic attempts may stop after 5 tries per stage to protect exchange systems.")
    pdf.bullet("Ops can still press Continue; manual resume is allowed to try again.")
    pdf.bullet("If the step fails again, the pipeline still does not advance.")

    pdf.h3("Example D -- What must never happen")
    pdf.bullet("Deal Accept Failed while PG Routing shows Done because the API was never needed.")
    pdf.bullet("Resume skipping a failed Deal Accept and executing later steps.")
    pdf.bullet("Restarting Add ISIN when Add ISIN already succeeded.")

    # ── 11. Changes ──
    pdf.h1("11. Recent changes (business summary)")
    pdf.table(
        ["Change", "Why it matters to the business"],
        [
            ["Stage-based settlement runner", "Safe resume without restarting the full chain"],
            ["Hard stop on failure", "No accidental forward progress after a break"],
            ["Manual Continue = same rules as auto", "Ops control without breaking exchange safety"],
            ["PG Routing not pre-marked Done", "Timeline no longer looks complete past a failed step"],
            ["Skipped vs Done in CRM", "Clear that non-netbanking routing was intentionally not run"],
            ["Repair of older misleading PG rows", "Opening / resuming an order corrects stale Done status"],
            ["Failed stages re-attempted on resume", "A prior failure is not silently treated as success"],
            ["Force retry on CRM Continue", "Ops can unblock after automatic max attempts"],
            ["Clearer job outcome logging", "Failed settlement is not reported as a successful job"],
        ],
        [70, 110],
    )

    # ── 12. Roles ──
    pdf.add_page()
    pdf.h1("12. Roles & responsibilities")
    pdf.table(
        ["Role", "Responsibility"],
        [
            ["System (auto)", "Start settlement after payment; stop on failure; cron backstop every 30 minutes"],
            ["CRM Operations", "Monitor Settlement Pipeline; use Continue after investigating errors"],
            ["Product / Leadership", "Treat stage timeline as source of truth for settlement progress"],
            ["Engineering support", "Investigate NSE / Razorpay errors shown in stage details; do not ask Ops to re-run from Add ISIN if earlier stages are Done"],
        ],
        [45, 135],
    )

    # ── 13. Glossary ──
    pdf.h1("13. Glossary")
    pdf.table(
        ["Term", "Simple meaning"],
        [
            ["NSE RFQ", "Exchange mechanism used to negotiate and settle the bond trade"],
            ["ISIN", "Identifier of the bond instrument being traded"],
            ["Settlement stage", "One tracked step in the post-payment automation pipeline"],
            ["Resume", "Continue from the first incomplete/failed stage without redoing successful ones"],
            ["PG Routing", "Razorpay fund-routing step used for netbanking payments"],
            ["Force resume", "Manual Continue that can retry even after automatic attempt limits"],
            ["Idempotent skip", "If a step already truly succeeded, do not call the exchange again"],
        ],
        [40, 140],
    )

    # ── Close ──
    pdf.h1("14. Closing statement")
    pdf.body(
        "The settlement workflow is designed so that commercial and operational teams can answer, "
        "at any time: Where is this paid order in exchange settlement? What failed? What happens next?"
    )
    pdf.body(
        "The answer must always be consistent with one policy: "
        "do not advance past a broken step until that step succeeds."
    )
    pdf.ln(6)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(30, 64, 175)
    pdf.multi_cell(0, 6, "End of document")

    pdf.output(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
