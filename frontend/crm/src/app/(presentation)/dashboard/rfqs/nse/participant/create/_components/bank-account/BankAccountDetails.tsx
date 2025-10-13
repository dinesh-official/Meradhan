import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import BankAccountForm from "../account-forms/BankAccountForm";
import {
  BankAccountFormData,
  IBankAccountFormHook,
} from "./backAccount";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BankAccountDetails = ({ manager }: { manager: IBankAccountFormHook }) => {
  return (
    <div className="flex flex-col gap-4">
      <Accordion type="multiple">
        {manager.state.map((account: BankAccountFormData, idx: number) => (
          <AccordionItem key={account.id} value={account.id}>
            <AccordionTrigger>
              {account.bankName
                ? `${account.bankName} • ${account.accountNumber ?? ""}`
                : `Account ${idx + 1}`}
            </AccordionTrigger>

            <AccordionContent>
              <Card>
                <CardContent>
                  <BankAccountForm
                    index={idx}
                    account={account}
                    onChange={(k, v) =>
                      manager.setBankAccountData(account.id, k, v)
                    }
                    onSetDefault={() =>
                      manager.setDefaultBankAccount(account.id)
                    }
                    onRemove={() => manager.removeBankAccount(account.id)}
                    error={manager.errors?.[account.id] ?? {}}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default BankAccountDetails;
