"use client";

import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import NewRfqForm, { SchemaType } from "./forms/NewRfqForm";
import { useCreateRfqHook } from "./forms/useCreateRfqHook";

function NewRfqFormView() {
  const { newRfqMutation } = useCreateRfqHook();
  const handleFormSubmit = (data: SchemaType) => {
    newRfqMutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Create New RFQ"
        description="Create a new Request for Quote record"
        showBack
      />

      <NewRfqForm
        onSubmit={handleFormSubmit}
        isLoading={newRfqMutation.isPending}
      />
    </div>
  );
}

export default NewRfqFormView;
