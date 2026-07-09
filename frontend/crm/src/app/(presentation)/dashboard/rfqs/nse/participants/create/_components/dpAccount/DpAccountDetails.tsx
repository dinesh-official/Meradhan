import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DpAccountForm from "../account-forms/DpAccountForm";
import { DPAccountFormData, IDPAccountFormHook } from "./dpaccount";

const DPAccountDetails = ({ manager }: { manager: IDPAccountFormHook }) => {
  return (
    <div className="flex flex-col gap-4">
      <Accordion type="multiple" className="bg-gray-50 px-5 rounded-2xl">
        {manager.state.map((account: DPAccountFormData, idx: number) => (
          <AccordionItem key={account.id} value={account.id}>
            <AccordionTrigger>
              {account.dpid
                ? `${account.dpid}${account.id ? ` • ${account.id}` : ""}`
                : `Demat Account ${idx + 1}`}
            </AccordionTrigger>

            <AccordionContent>
              <DpAccountForm
                index={idx}
                account={account}
                onChange={(k, v) => manager.setDPAccountData(account.id, k, v)}
                onSetDefault={() => manager.setDefaultDPAccount(account.id)}
                onRemove={() => manager.removeDPAccount(account.id)}
                error={manager.errors?.[account.id] ?? {}}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default DPAccountDetails;
