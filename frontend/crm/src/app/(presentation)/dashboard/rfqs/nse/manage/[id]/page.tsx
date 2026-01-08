import Workspace from "@/global/elements/nav-sidebar/WorkSpace";
import NSEDealView from "./NSEDealView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date: string }>;
}) => {
  const { id } = await params;
  const { date } = await searchParams;
  return (
    <Workspace>
      <div className="flex flex-col gap-5">
        <PageInfoBar
          title="RFQ Details"
          description="a small detachment of troops or police."
          showBack
        />
        <NSEDealView id={id} date={date} />
      </div>
    </Workspace>
  );
};

export default page;
