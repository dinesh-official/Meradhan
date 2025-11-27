import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
import BlogView from "./BlogView";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";
export const revalidate = 0; // Revalidate the page every hour

export const generateMetadata = async () => {
  return await generatePagesMetaData("blog");
};
async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, sort } = await searchParams;

  return (
    <ViewPort>
      <div className="mb-16 container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blog</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <BlogView page={page} sort={sort} />
      </div>
    </ViewPort>
  );
}

export default page;
