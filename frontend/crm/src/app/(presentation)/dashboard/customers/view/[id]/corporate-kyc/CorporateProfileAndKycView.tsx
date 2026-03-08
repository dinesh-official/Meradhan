"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import LabelView from "@/global/elements/wrapper/LabelView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { encodeId } from "@/global/utils/url.utils";
import apiGateway from "@root/apiGateway";
import { useQueries } from "@tanstack/react-query";
import { Building2, FileDown, IdCardIcon, NotebookPen, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  AddressSection,
  AuthorisedSignatoriesSection,
  BankAccountsSection,
  DematAccountsSection,
  DirectorsSection,
  DocumentUrlsSection,
  PromotersSection,
} from "./_components/CorporateKycSections";

export default function CorporateProfileAndKycView({
  profileId,
}: {
  profileId: number;
}) {
  const api = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);

  const [customerQuery, corporateKycQuery] = useQueries({
    queries: [
      {
        queryKey: ["fetchCustomer", profileId],
        queryFn: async () => {
          const res = await api.customerInfoById(profileId);
          return res.data.responseData;
        },
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["corporateKyc", profileId],
        queryFn: async () => {
          const res = await api.getCorporateKyc(profileId);
          return res.data.responseData;
        },
        refetchOnWindowFocus: false,
      },
    ],
  });

  const customer = customerQuery.data;
  const corporateKyc = corporateKycQuery.data;
  const isLoading = customerQuery.isLoading;
  const encodedId = encodeId(profileId);
  const isCorporate = customer?.userType === "CORPORATE";

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const handlePrintPdf = () => {
    window.print();
  };

  const printDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fmt = (v: string | undefined | null) =>
    v != null && v !== "" ? String(v) : "—";

  return (
    <div className="flex flex-col gap-6 corporate-kyc-print-view" id="corporate-kyc-print-content">
      {/* Clean print-only header: logo + date */}
      <div className="hidden corporate-kyc-print-header print:block print:pb-4  print:border-gray-300">
        <Image
          src="/images/pdfheader.png"
          alt="MeraDhan"
          width={800}
          height={120}
          className="w-full max-w-full h-auto object-contain print:block"
        />
        <p className="print:block text-sm text-muted-foreground mt-2">Printed on: {printDate}</p>
      </div>

      <div className="print:hidden">
        <PageInfoBar
          showBack
          title="Corporate Customer"
          description="Profile and corporate KYC data"
          actions={
            <div className="flex flex-wrap gap-2 justify-center items-center md:w-auto w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrintPdf}
              >
                <FileDown className="h-4 w-4" /> Print / Save as PDF
              </Button>
              {!isCorporate && (
                <AllowOnlyView permissions={["view:customerkyc"]}>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/customers/view/${encodedId}/kyc`}>
                      <IdCardIcon className="h-4 w-4" /> View KYC Data
                    </Link>
                  </Button>
                </AllowOnlyView>
              )}
              <Button variant="default" asChild>
                <Link href="/dashboard/rfqs/nse">
                  <NotebookPen className="h-4 w-4" /> View RFQs
                </Link>
              </Button>
              {isCorporate && (
                <AllowOnlyView permissions={["edit:customer"]}>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/customers/${encodedId}/corporate-kyc`}>
                      <Pencil className="h-4 w-4" />
                      {corporateKyc ? "Edit Corporate KYC" : "Add Corporate KYC"}
                    </Link>
                  </Button>
                </AllowOnlyView>
              )}
            </div>
          }
        />
      </div>

      {/* Screen: card-based layout (hidden when printing) */}
      <div className="print:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Key details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <LabelView title="Name">
                <p>
                  {[customer?.firstName, customer?.middleName, customer?.lastName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </p>
              </LabelView>
              <LabelView title="Username">
                <p>{customer?.userName ?? "—"}</p>
              </LabelView>
              <LabelView title="Email">
                <p>{customer?.emailAddress ?? "—"}</p>
              </LabelView>
              <LabelView title="Phone">
                <p>{customer?.phoneNo ?? "—"}</p>
              </LabelView>
              <LabelView title="Company">
                <p>{corporateKyc?.entityName ?? "—"}</p>
              </LabelView>
              <LabelView title="PAN Number">
                <p>{corporateKyc?.panNumber ?? "—"}</p>
              </LabelView>
            </div>
          </CardContent>
        </Card>

        {!isCorporate ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>
                This customer is not a corporate user. Corporate KYC is only
                available for user type &quot;CORPORATE&quot;.
              </p>
            </CardContent>
          </Card>
        ) : !corporateKycQuery.isLoading && !corporateKyc ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No corporate KYC data has been added for this customer yet.</p>
              <AllowOnlyView permissions={["edit:customer"]}>
                <Button asChild variant="link" className="mt-2">
                  <Link href={`/dashboard/customers/${encodedId}/corporate-kyc`}>
                    Add Corporate KYC
                  </Link>
                </Button>
              </AllowOnlyView>
            </CardContent>
          </Card>
        ) : corporateKyc ? (
          <>
            <AddressSection data={corporateKyc} />
            <DocumentUrlsSection data={corporateKyc} />
            <BankAccountsSection data={corporateKyc} />
            <DematAccountsSection data={corporateKyc} />
            <DirectorsSection data={corporateKyc} />
            <PromotersSection data={corporateKyc} />
            <AuthorisedSignatoriesSection data={corporateKyc} />
          </>
        ) : null}
      </div>

      {/* Print only: table layout (hidden on screen) */}
      <div className="hidden print-table-only print:block">
        <table className="corporate-kyc-print-table">
          <tbody>
            <tr><td className="corporate-kyc-print-label">Name</td><td>{fmt([customer?.firstName, customer?.middleName, customer?.lastName].filter(Boolean).join(" "))}</td></tr>
            <tr><td className="corporate-kyc-print-label">Username</td><td>{fmt(customer?.userName)}</td></tr>
            <tr><td className="corporate-kyc-print-label">Email</td><td>{fmt(customer?.emailAddress)}</td></tr>
            <tr><td className="corporate-kyc-print-label">Phone</td><td>{fmt(customer?.phoneNo)}</td></tr>
            <tr><td className="corporate-kyc-print-label">Company</td><td>{fmt(corporateKyc?.entityName)}</td></tr>
            <tr><td className="corporate-kyc-print-label">PAN Number</td><td>{fmt(corporateKyc?.panNumber)}</td></tr>
          </tbody>
        </table>

        {corporateKyc && (
          <>
            <h2 className="corporate-kyc-print-section-title">Correspondence address</h2>
            <table className="corporate-kyc-print-table">
              <tbody>
                <tr><td className="corporate-kyc-print-label">Full address</td><td>{fmt(corporateKyc.correspondenceFullAddress)}</td></tr>
                <tr><td className="corporate-kyc-print-label">Line 1</td><td>{fmt(corporateKyc.correspondenceLine1)}</td></tr>
                <tr><td className="corporate-kyc-print-label">Line 2</td><td>{fmt(corporateKyc.correspondenceLine2)}</td></tr>
                <tr><td className="corporate-kyc-print-label">City</td><td>{fmt(corporateKyc.correspondenceCity)}</td></tr>
                <tr><td className="corporate-kyc-print-label">District</td><td>{fmt(corporateKyc.correspondenceDistrict)}</td></tr>
                <tr><td className="corporate-kyc-print-label">State</td><td>{fmt(corporateKyc.correspondenceState)}</td></tr>
                <tr><td className="corporate-kyc-print-label">PIN code</td><td>{fmt(corporateKyc.correspondencePinCode)}</td></tr>
              </tbody>
            </table>

            {(corporateKyc.bankAccounts?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Bank accounts</h2>
                {corporateKyc.bankAccounts.map((acc, i) => (
                  <table key={acc.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Account holder name</td><td>{fmt(acc.accountHolderName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Account number</td><td>{fmt(acc.accountNumber)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Bank name</td><td>{fmt(acc.bankName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">IFSC code</td><td>{fmt(acc.ifscCode)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Branch</td><td>{fmt(acc.branch)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Primary account</td><td>{acc.isPrimaryAccount ? "Yes" : "No"}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}

            {(corporateKyc.dematAccounts?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Demat accounts</h2>
                {corporateKyc.dematAccounts.map((acc, i) => (
                  <table key={acc.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Depository</td><td>{fmt(acc.depository)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Account holder name</td><td>{fmt(acc.accountHolderName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">DP ID</td><td>{fmt(acc.dpId)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Client ID</td><td>{fmt(acc.clientId)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Account type</td><td>{fmt(acc.accountType)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Primary</td><td>{acc.isPrimary ? "Yes" : "No"}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}

            {(corporateKyc.directors?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Directors</h2>
                {corporateKyc.directors.map((dir, i) => (
                  <table key={dir.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Full name</td><td>{fmt(dir.fullName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">PAN</td><td>{fmt(dir.pan)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Designation</td><td>{fmt(dir.designation)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">DIN</td><td>{fmt(dir.din)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Email</td><td>{fmt(dir.email)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Mobile</td><td>{fmt(dir.mobile)}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}

            {(corporateKyc.promoters?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Promoters</h2>
                {corporateKyc.promoters.map((p, i) => (
                  <table key={p.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Full name</td><td>{fmt(p.fullName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">PAN</td><td>{fmt(p.pan)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Designation</td><td>{fmt(p.designation)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Email</td><td>{fmt(p.email)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Mobile</td><td>{fmt(p.mobile)}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}

            {(corporateKyc.authorisedSignatories?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Authorised signatories</h2>
                {corporateKyc.authorisedSignatories.map((s, i) => (
                  <table key={s.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Full name</td><td>{fmt(s.fullName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">PAN</td><td>{fmt(s.pan)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Designation</td><td>{fmt(s.designation)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Email</td><td>{fmt(s.email)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Mobile</td><td>{fmt(s.mobile)}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
