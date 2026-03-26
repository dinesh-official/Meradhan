import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";

import { getBlogCategoryMetaData } from "@/graphql/pagesMetaDataGql_Action";
import BlogView from "../../BlogView";
export const revalidate = 0; // Revalidate the page every hour

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ category: string }>;
}) => {
  const paramsResolved = await params;
  return await getBlogCategoryMetaData(paramsResolved.category);
};
async function page({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
  params: Promise<{ category: string }>;
}) {
  const { page, sort } = await searchParams;
  const { category } = await params;

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
              <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <BlogView page={page} sort={sort} categoryName={category} />
      </div>
    </ViewPort>
  );
}

export default page;
