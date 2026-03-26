import ViewPort from "@/global/components/wrapper/ViewPort";
import GlossaryView from "./GlossaryView";
import {
  getDynamicPageDataGql,
  getDynamicPageMetaDataGql,
} from "@/graphql/getDynamicPageDataGql";

export const revalidate = 0;
export async function generateMetadata() {
  return await getDynamicPageMetaDataGql("glossary");
}
async function page() {
  const data = await getDynamicPageDataGql("glossary");

  return (
    <ViewPort>
      <GlossaryView pageData={data} />
    </ViewPort>
  );
}

export default page;
