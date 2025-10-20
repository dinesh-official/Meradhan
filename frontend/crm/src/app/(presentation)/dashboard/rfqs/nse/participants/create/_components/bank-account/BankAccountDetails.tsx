import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BankAccountForm from "../account-forms/BankAccountForm";
import { BankAccountFormData, IBankAccountFormHook } from "./backAccount";

const BankAccountDetails = ({ manager }: { manager: IBankAccountFormHook }) => {
  return (
    <Accordion type="multiple" className="bg-gray-50 px-4 rounded-2xl" defaultValue={manager.state.map((e)=>e.id)} >
      {manager.state.map((account: BankAccountFormData, idx: number) => (
        <AccordionItem key={account.id} value={account.id}  >
          <AccordionTrigger>
            {account.bankname
              ? `${account.bankname} • ${account.accountnumber ?? ""}`
              : `Bank Account ${idx + 1}`}
          </AccordionTrigger>

          <AccordionContent>
            <BankAccountForm
              index={idx}
              account={account}
              onChange={(k, v) => manager.setBankAccountData(account.id, k, v)}
              onSetDefault={() => manager.setDefaultBankAccount(account.id)}
              onRemove={() => manager.removeBankAccount(account.id)}
              error={manager.errors[idx]}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default BankAccountDetails;
