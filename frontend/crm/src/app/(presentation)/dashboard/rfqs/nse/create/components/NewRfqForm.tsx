import { Card, CardContent } from "@/components/ui/card";
import NseIsinPicker from "@/global/elements/autocomplete/NseIsinPicker";
import { SelectNseParticipant } from "@/global/elements/autocomplete/SelectNseParticipant";
import { InputField } from "@/global/elements/inputs/InputField";
import React from "react";

function NewRfqForm() {
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-2">
          <NseIsinPicker>
            <InputField label="ISIN" id="ISIN" readonly />
          </NseIsinPicker>
          <SelectNseParticipant/>
        </div>
      </CardContent>
    </Card>
  );
}

export default NewRfqForm;
