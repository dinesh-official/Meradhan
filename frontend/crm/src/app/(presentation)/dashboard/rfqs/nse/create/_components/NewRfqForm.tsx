"use client";

import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import NewRfqForm, { SchemaType } from "./forms/NewRfqForm";

function NewRfqFormView() {
  const handleFormSubmit = (data: SchemaType) => {
    console.log("Form submitted:", data);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Create New RFQ"
        description="Create a new Request for Quote record"
        showBack
      />
      <NewRfqForm onSubmit={handleFormSubmit} />;
    </div>
  );
}

export default NewRfqFormView;
