import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X } from "lucide-react";
import DpAccountForm from "../account-forms/DpAccountForm";
import { DPAccountFormData, IDPAccountFormHook } from "./dpaccount";

const DPAccountDetails = ({ manager }: { manager: IDPAccountFormHook }) => {
  return (
    <div className="flex flex-col gap-4">
      <Accordion type="multiple">
        {manager.state.map((account: DPAccountFormData, idx: number) => (
          <AccordionItem key={account.id} value={account.id}>
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full">
                <span>
                  {account.dpid
                    ? `${account.dpid}${account.id ? ` • ${account.id}` : ""}`
                    : `DP Account ${idx + 1}`}
                </span>

                {/* Remove Button */}
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // prevents accordion toggle when clicking remove
                      manager.removeDPAccount(account.id);
                    }}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
                  >
                    <X className="w-4 h-4" /> Remove
                  </button>
                )}
              </div>
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
