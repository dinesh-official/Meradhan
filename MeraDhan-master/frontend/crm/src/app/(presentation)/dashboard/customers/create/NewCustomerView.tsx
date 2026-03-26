"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import CustomerManagementForm from "../_components/manageCustomer/form/CustomerManagementForm";
import { useCustomerFromDataHook } from "../_components/manageCustomer/form/useCustomerFormDataHook";

function NewCustomerView({
  popup,
  onCustomerCreated,
}: { popup?: boolean; onCustomerCreated?: () => void }) {
  const manager = useCustomerFromDataHook(undefined, !popup, onCustomerCreated);
  return (
    <div className="mx-auto mt-6">
      <Card className={popup ? "border-none " : ""}>
        <CardContent>
          <CustomerManagementForm manager={manager} />
        </CardContent>
        <CardFooter>
          <Button
            onClick={manager.validateCustomerData}
            className="w-full md:w-auto"
            disabled={manager.createCustomerMutation.isLoading}
          >
            Save New Customer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default NewCustomerView;
