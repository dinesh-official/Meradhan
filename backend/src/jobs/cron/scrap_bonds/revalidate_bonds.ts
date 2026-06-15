import { EmailCommunication } from "@communication/email_communication";
import { db } from "@core/database/database";
import { formatDateTime } from "@jobs/kra_worker/KraWorker.service";
import { absoluteDataYmdToIstIso } from "@modules/absolutedata/absolutedata.bonds.mapper";
import { NsdlBondProcessor } from "./nsdl_bond_processor";
import { NsdlBondService } from "./nsdl_bond_service";
import fs from "fs/promises";
import path from "path";

export const revalidateBonds = async () => {
  console.log("Revalidating bonds...");

  // Rebuild and revalidate bonds list from NSDL
  const service = new NsdlBondService();
  const raw = await service.fetchBondData();
  const outPath =
    path.basename(process.cwd()) === "backend"
      ? path.resolve(process.cwd(), "redemptions.txt")
      : path.resolve(process.cwd(), "backend", "redemptions.txt");
  await fs.writeFile(
    outPath,
    typeof raw === "string" ? raw : JSON.stringify(raw, null, 2),
    "utf8"
  );


  // helper functions
  const toISODate = (v?: string) => {
    if (!v) return undefined;
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
    return undefined;
  };

  const isRedemptionExpired = (date: string | Date) => {
    const d = date instanceof Date ? date : toISODate(date);
    if (!d) return false;
    return d.getTime() < Date.now();
  };

  const isYearOver9999 = (date: string | Date) => {
    console.log(date);

    const d = date instanceof Date ? date : toISODate(date);
    if (!d) return false;
    return d.getUTCFullYear() > 9999;
  };

  const asIsoString = (v?: string | Date | null) => {
    if (!v) return undefined;
    if (v instanceof Date) return v.toISOString();
    return String(v);
  };

  const yearOf = (v?: string | Date | null) => {
    const iso = asIsoString(v);
    if (!iso) return undefined;
    const d = toISODate(iso);
    return d?.getUTCFullYear();
  };

  const isSuspicious1999 = (parsedIso?: string | null, rawValue?: unknown) => {
    const y = yearOf(parsedIso ?? undefined);
    if (y !== 1999) return false;
    const raw = String(rawValue ?? "").trim();
    // Common NSDL placeholder/malformed patterns that previously collapsed to "99"
    return (
      raw === "99" ||
      raw === "1999" ||
      /[\/\-.]99$/.test(raw) || // dd-mm-99 etc
      /\b99\b/.test(raw)
    );
  };

  // Pre-fetch ISINs already in the 2 reference tables to limit schedule sync.
  const [couponRefIsins, redemptionRefIsins] = await Promise.all([
    db.dataBase.bondReferenceCouponPaymentDate.findMany({ select: { isin: true }, distinct: ["isin"] }),
    db.dataBase.bondReferenceRedemptionSchedule.findMany({ select: { isin: true }, distinct: ["isin"] }),
  ]);
  const knownIsins = new Set([
    ...couponRefIsins.map((r) => r.isin),
    ...redemptionRefIsins.map((r) => r.isin),
  ]);


  // Map raw rows -> parsed rows with error handling (includes Absolute Data when configured)
  const parsedRows: Array<
    Awaited<ReturnType<NsdlBondProcessor["parse"]>> & {
      _index: number;
      _raw: { dateOfAllotment: unknown; redemption: unknown };
    }
  > = [];

  for (let idx = 0; idx < raw.length; idx++) {
    const r = raw[idx]!;
    try {
      const parsed = await new NsdlBondProcessor(r).parse();
      parsedRows.push({
        ...parsed,
        _index: idx,
        _raw: {
          dateOfAllotment: r.DATE_OF_ALLOTMENT,
          redemption: r.REDEMPTION,
        },
      });
    } catch (error) {
      console.error(
        `Error processing bond at index ${idx} (ISIN: ${r.ISIN || "unknown"}):`,
        error,
      );
    }
  }

  const badDateSuspects = parsedRows.filter(
    (e) =>
      isSuspicious1999(asIsoString(e.maturityDate) ?? null, e._raw?.redemption) ||
      isSuspicious1999(asIsoString(e.redemptionDate) ?? null, e._raw?.redemption) ||
      isSuspicious1999(asIsoString(e.dateOfAllotment) ?? null, e._raw?.dateOfAllotment)
  );

  const missingMaturityNonPerpetual = parsedRows.filter((e) => {
    const rawName = String(e.instrumentName ?? "").toLowerCase();
    const looksPerpetual = rawName.includes(" perpetual ");
    return !looksPerpetual && !e.maturityDate;
  });

  const expired = parsedRows.filter(
    (e) => e.maturityDate && isRedemptionExpired(e.maturityDate)
  );
  const over9999 = parsedRows
    .filter((e) => e.maturityDate && isYearOver9999(e.maturityDate))
    .sort((a, b) =>
      (a.creditRating || "")
        .toString()
        .localeCompare((b.creditRating || "").toString())
    );
  const valid = parsedRows.filter(
    (e) =>
      (!e.maturityDate ||
        (!isRedemptionExpired(e.maturityDate) &&
          !isYearOver9999(e.maturityDate))) &&
      !!e.creditRating &&
      e.creditRating.toLowerCase() != "unrated"
  );
  const unrated = parsedRows.filter(
    (e) =>
      (!e.maturityDate ||
        (!isRedemptionExpired(e.maturityDate) &&
          !isYearOver9999(e.maturityDate))) &&
      (!e.creditRating || e.creditRating.toLowerCase() == "unrated")
  );

  const zeroValidCoupon = valid.filter((e) => Number(e.couponRate) == 0);
  const nonZeroValidCoupon = valid.filter((e) => Number(e.couponRate) !== 0);

  let updated = 0;
  let created = 0;

  let index = 0;

  const order = [
    ...nonZeroValidCoupon,
    ...zeroValidCoupon,
    ...unrated,
    ...over9999,
    // expired bonds are excluded — users cannot buy them and NSDL includes all historical bonds
  ];



  for (const e of order) {
    try {
      // Exclude internal fields from the data before upserting
      const { _index, _raw, _abItem, ...bondData } = e as any;

      // Check if bond exists and has ignoreAutoUpdate enabled
      const existingBond = await db.dataBase.bonds.findUnique({
        where: { isin: bondData.isin },
        select: { ignoreAutoUpdate: true },
      });

      // If bond exists and ignoreAutoUpdate is true, skip the update
      if (existingBond && existingBond.ignoreAutoUpdate === true) {
        console.log(`Skipping update for bond ${bondData.isin} (ignoreAutoUpdate is enabled)`);
        index++;
        continue;
      }

      // Use Prisma upsert for atomic create/update operation
      const result = await db.dataBase.bonds.upsert({
        where: { isin: bondData.isin },
        update: {
          ...bondData,
          sortedAt: index,
          ignoreAutoUpdate: existingBond?.ignoreAutoUpdate ?? false,
        },
        create: {
          ...bondData,
          sortedAt: index,
          ignoreAutoUpdate: false,
        },
      });

      // Reference Tables Sync
      if (_abItem) {
        const isinStr = bondData.isin as string;
        if (!knownIsins.has(isinStr)) {
          // Skip updating reference tables for bonds not previously managed via CRM.
        } else {
          const paymentSchedule = _abItem.coupon?.payment_schedule;
          const redemptionSchedule = _abItem.redemption_features?.schedule;
          const hasCoupon = Array.isArray(paymentSchedule) && paymentSchedule.length > 0;
          const hasRedemption = Array.isArray(redemptionSchedule) && redemptionSchedule.length > 0;



          if (hasCoupon || hasRedemption) {
            await db.dataBase.$transaction(async (tx) => {
              if (hasCoupon) {
                await tx.bondReferenceCouponPaymentDate.deleteMany({ where: { isin: isinStr } });


                await tx.bondReferenceCouponPaymentDate.createMany({
                  data: paymentSchedule!.map((r: any) => {
                    const paymentDate = r.payment_date
                      ? new Date(absoluteDataYmdToIstIso(r.payment_date)!)
                      : null;
                    const recordDate =
                      paymentDate && typeof r.record_days === "number"
                        ? new Date(paymentDate.getTime() - r.record_days * 24 * 60 * 60 * 1000)
                        : null;
                    return {
                      isin: isinStr,
                      interestPaymentDates: r.payment_date || "",
                      recordDays: r.record_days,
                      recordDate,
                      recordDateIst: recordDate,
                      dueDate: paymentDate,
                      dueDateIst: paymentDate,
                      raw: r,
                    };
                  }),
                });

              }

              if (hasRedemption) {
                await tx.bondReferenceRedemptionSchedule.deleteMany({ where: { isin: isinStr } });


                await tx.bondReferenceRedemptionSchedule.createMany({
                  data: redemptionSchedule!.map((r: any) => {
                    const startDate = r.start_date
                      ? new Date(absoluteDataYmdToIstIso(r.start_date)!)
                      : null;
                    const endDate = r.end_date
                      ? new Date(absoluteDataYmdToIstIso(r.end_date)!)
                      : null;
                    return {
                      isin: isinStr,
                      redemptionType: r.type || "UNKNOWN",
                      startDate,
                      startDateIst: startDate,
                      endDate,
                      endDateIst: endDate,
                      price: r.price,
                      amount: r.amount,
                      optionType: r.option_type,
                      optionFrequency: r.option_frequency,
                      raw: r,
                    };
                  }),
                });

              }
            });

          } else {

          }
        }
      }

      // Check if this was an update or create by comparing timestamps
      // If createdAt and updatedAt are the same, it was a create operation
      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }
    } catch (err) {
      console.error(`Failed to sync bond ${e.isin}:`, err);
    }
    index++;
  }

  const [couponCount, redemptionCount] = await Promise.all([
    db.dataBase.bondReferenceCouponPaymentDate.count(),
    db.dataBase.bondReferenceRedemptionSchedule.count(),
  ]);
  console.log(`[RefSync] Final table counts — bond_reference_coupon_payment_dates: ${couponCount}, bond_reference_redemption_schedule: ${redemptionCount}`);

  const emailContent = `
    Bond Data Processing Summary
    Total Bonds: ${parsedRows.length}
    Expired Bonds: ${expired.length}
    New Bonds Added: ${created}
    Bonds Updated: ${updated}
    Reference Coupon Rows (total): ${couponCount}
    Reference Redemption Rows (total): ${redemptionCount}
    \n
    Date Quality Checks
    Suspected "99→1999" date conversions: ${badDateSuspects.length}
    Missing maturity (non-perpetual): ${missingMaturityNonPerpetual.length}
    \n
    Top suspected rows (ISIN | raw_allotment | raw_redemption | parsed_allotment | parsed_maturity)
    ${badDateSuspects
      .slice(0, 20)
      .map(
        (e) =>
          `${e.isin} | ${String(e._raw?.dateOfAllotment ?? "")} | ${String(
            e._raw?.redemption ?? ""
          )} | ${String(e.dateOfAllotment ?? "")} | ${String(e.maturityDate ?? "")}`
      )
      .join("\n")}
    `;

  try {
    const emailer = new EmailCommunication();
    await emailer.sendEmail({
      // to: env.SMTP_SENDER,
      to: "sandeep.dhingra@meradhan.co,vikas.kukreja@meradhan.co,sourav@meradhan.co,mohammed.ali@meradhan.co,zahoor.ahmed@meradhan.co,dinesh.kumar@meradhan.co,sugandhan@meradhan.co",
      subject: "Absolute Data Bond Revalidation Summary " + formatDateTime(new Date()),
      text: emailContent,
    });
    console.log("Update email sent successfully.");
  } catch (err) {
    console.warn("Failed to send summary email:", err);
    console.log("Summary:\n", emailContent);
  }
};
