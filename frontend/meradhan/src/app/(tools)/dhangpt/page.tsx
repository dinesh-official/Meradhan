import ViewPort from "@/global/components/wrapper/ViewPort";
import DhanGpt from "./_components/DhanGpt";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";

export const revalidate = 0; // Revalidate the page every hour

export const generateMetadata = async () => {
  return await generatePagesMetaData("dhangpt");
};

const page = () => {
  return (
    <ViewPort headerOnly>
      <DhanGpt />
    </ViewPort>
  );
};

export default page;
