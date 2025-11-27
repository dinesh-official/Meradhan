import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
import NewsView from "./NewsView";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";

export const revalidate = 0; // Revalidate the page every hour
export const generateMetadata = async () => {
  return await generatePagesMetaData("news");
};
async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, sort } = await searchParams;

  return (
    <ViewPort>
      <div className="mb-16 md:w-[80%] container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>News</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <NewsView page={page} sort={sort} />
      </div>
    </ViewPort>
  );
}

export default page;
