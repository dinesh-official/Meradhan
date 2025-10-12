"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import CustomerManagementForm from "../_components/form/CustomerManagementForm";
import { useCustomerFromDataHook } from "../_components/form/useCustomerFormDataHook";
import { Button } from "@/components/ui/button";

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
          >
            Save New Customer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default NewCustomerView;
