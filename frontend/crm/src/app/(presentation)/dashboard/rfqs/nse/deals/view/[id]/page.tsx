import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import NSEDealView from "./NSEDealView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

const page = () => {
  return (
    <Workspace>
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="Rfq Details"
          description="a small detachment of troops or police."
          showBack
        />
        <NSEDealView />
      </div>
    </Workspace>
  );
};

export default page;
