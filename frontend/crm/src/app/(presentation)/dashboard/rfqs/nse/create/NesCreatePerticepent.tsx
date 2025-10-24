"use client";

import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import NewRfqForm from "./components/NewRfqForm";

const NseCreateParticipant = () => {

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Create New RFQ"
        description="Create a new Request for Quote record"
        showBack
      />
<NewRfqForm/>
    </div>
  );
};

export default NseCreateParticipant;
