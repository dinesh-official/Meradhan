"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";
import LeadFormManagementForm from "../_components/form/LeadFormManagementForm";
import { useLeadFormDataHook } from "../_components/form/useLeadFormDataHook";
import { Button } from "@/components/ui/button";

function NewLeadView() {
  const manager = useLeadFormDataHook();
  return (
    <div className="max-w-3xl mt-6 mx-auto">
      <Card>
        <CardContent>
          <LeadFormManagementForm manager={manager} />
        </CardContent>
              <CardFooter>
                  <Button className="md:w-auto w-full" >Save Lead</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default NewLeadView;
