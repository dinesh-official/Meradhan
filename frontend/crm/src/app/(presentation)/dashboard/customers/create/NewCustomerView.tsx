"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import CustomerManagementForm from "../_components/manageCustomer/form/CustomerManagementForm";
import { useCustomerFromDataHook } from "../_components/manageCustomer/form/useCustomerFormDataHook";

function NewCustomerView() {
  const manager = useCustomerFromDataHook();
  return (
    <div className="max-w-3xl mt-6 mx-auto">
      <Card>
        <CardContent>
          <CustomerManagementForm manager={manager} />
        </CardContent>
        <CardFooter>
          <Button
            onClick={manager.validateCustomerData}
            className="md:w-auto w-full"
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
