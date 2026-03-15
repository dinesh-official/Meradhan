"use client";

import AccountViewPort from "../../../_components/wrapper/AccountViewPort";
import { KraInfoView } from "../_steps/1_IdentityValidation/2_kraInfo/KraInfoView";
import type { IKraDownloadResponse } from "@root/apiGateway";

/** Mock KRA data for KRA view test / screenshot (matches screenshot layout) */
const MOCK_KRA: IKraDownloadResponse = {
  id: 0,
  appPanNo: "AVEPK6139M",
  appName: "VIKAS KUKREJA",
  appDobDt: "30-05-1983",
  appEmail: "vikas.kukreja83@gmail.com",
  appMobNo: "9910286723",
  appGen: "M",
  appFName: "SURENDER PAL KUKREJA",
  appOcc: "Private Service",
  appOthOcc: null,
  appIncome: "5 Lakh - 10 Lakh",
  appMarStatus: "Married",
  appNationality: "Indian",
  appType: "I",
  appCorAdd1: "C O SURENDER PAL KUKREJA HOUSE NO 4",
  appCorAdd2: "7 GADARPUR OPPOSITR OLD WATER TANK",
  appCorAdd3: "SHIV MANDIR WARD GADARPUR POST OFF",
  appCorCity: "GADARPURA",
  appCorPincd: "263152",
  appCorState: "Uttarakhand",
  appCorCtry: "101",
  appPerAdd1: "C O SURENDER PAL KUKREJA HOUSE NO 4",
  appPerAdd2: "7 GADARPUR OPPOSITR OLD WATER TANK",
  appPerAdd3: "SHIV MANDIR WARD GADARPUR POST OFF",
  appPerCity: "GADARPURA",
  appPerPincd: "263152",
  appPerState: "Uttarakhand",
  appPerCtry: "101",
  isNameMatch: true,
  isDOBMatch: true,
  isPANMatch: true,
  isMobileMatch: true,
  isEmailMatch: true,
};

export default function KraPreviewPage() {
  return (
    <AccountViewPort showSideBar={false}>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-lg font-medium text-muted-foreground mb-4">
          KRA view test / screenshot preview
        </h1>
        <KraInfoView kra={MOCK_KRA} preview />
      </div>
    </AccountViewPort>
  );
}
