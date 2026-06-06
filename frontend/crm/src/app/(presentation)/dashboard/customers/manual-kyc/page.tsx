import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import ManualKycPageClient from "./ManualKycPageClient";

export default function ManualKycPage() {
  return (
    <Workspace actionKey="customers.kyc.edit">
      <ManualKycPageClient />
    </Workspace>
  );
}
