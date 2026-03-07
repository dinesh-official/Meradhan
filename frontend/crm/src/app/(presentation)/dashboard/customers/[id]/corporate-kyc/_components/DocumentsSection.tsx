"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";

export function DocumentsSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, setField } = hook;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents (URLs)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Balance sheet copy URL"
          value={form.balanceSheetCopyUrl ?? ""}
          onChangeAction={(v) => setField("balanceSheetCopyUrl", v)}
        />
        <InputField
          label="Certificate of incorporation URL"
          value={form.certificateOfIncorporationUrl ?? ""}
          onChangeAction={(v) => setField("certificateOfIncorporationUrl", v)}
        />
        <InputField
          label="Memorandum copy URL"
          value={form.memorandumCopyUrl ?? ""}
          onChangeAction={(v) => setField("memorandumCopyUrl", v)}
        />
        <InputField
          label="Board resolution copy URL"
          value={form.boardResolutionCopyUrl ?? ""}
          onChangeAction={(v) => setField("boardResolutionCopyUrl", v)}
        />
        <InputField
          label="GST copy URL"
          value={form.gstCopyUrl ?? ""}
          onChangeAction={(v) => setField("gstCopyUrl", v)}
        />
        <InputField
          label="Client master holding copy URL"
          value={form.clientMasterHoldingCopyUrl ?? ""}
          onChangeAction={(v) => setField("clientMasterHoldingCopyUrl", v)}
        />
        <InputField
          label="Annual income"
          value={form.annualIncome ?? ""}
          onChangeAction={(v) => setField("annualIncome", v)}
        />
        <InputField
          label="Share holding pattern copy URL"
          value={form.shareHoldingPatternCopyUrl ?? ""}
          onChangeAction={(v) => setField("shareHoldingPatternCopyUrl", v)}
        />
        <InputField
          label="Certificate of commencement of business URL"
          value={form.certificateOfCommencementOfBizUrl ?? ""}
          onChangeAction={(v) =>
            setField("certificateOfCommencementOfBizUrl", v)
          }
        />
        <InputField
          label="Articles of association URL"
          value={form.articlesOfAssociationUrl ?? ""}
          onChangeAction={(v) => setField("articlesOfAssociationUrl", v)}
        />
        <InputField
          label="GST number"
          value={form.gstNumber ?? ""}
          onChangeAction={(v) => setField("gstNumber", v)}
        />
        <InputField
          label="Directors list copy URL"
          value={form.directorsListCopyUrl ?? ""}
          onChangeAction={(v) => setField("directorsListCopyUrl", v)}
        />
        <InputField
          label="Power of attorney copy URL"
          value={form.powerOfAttorneyCopyUrl ?? ""}
          onChangeAction={(v) => setField("powerOfAttorneyCopyUrl", v)}
        />
        <InputField
          label="Documents type"
          value={form.documentsType ?? ""}
          onChangeAction={(v) => setField("documentsType", v)}
        />
      </CardContent>
    </Card>
  );
}
