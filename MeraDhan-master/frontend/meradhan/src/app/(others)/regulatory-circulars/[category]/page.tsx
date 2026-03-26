import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PageTitleDesc from "@/global/components/basic/page/PageTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { getDynamicPageDataGql } from "@/graphql/getDynamicPageDataGql";
import { cn } from "@/lib/utils";
import {
  fetchRegulatoryCircularsByCategoryGql,
  fetchRegulatoryCircularsCategoriesGql,
  fetchRegulatoryCircularsMetaDataGql,
} from "../_actions/reg-cir";
import RegulatoryCirculars from "../RegulatoryCirculars";

export const revalidate = 0;
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ category: string }>;
}) => {
  const { category } = await params;
  return await fetchRegulatoryCircularsMetaDataGql(category);
};

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const pageData = await getDynamicPageDataGql("regulatory-circulars");
  const categories = await fetchRegulatoryCircularsCategoriesGql();

  const { category } = await params;
  const search = await searchParams;

  return (
    <ViewPort>
      <div className="container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/regulatory-circulars">
                Regulatory Circulars
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <SectionWrapper>
          <div className={cn("mb-20 ")}>
            <PageTitleDesc
              title={pageData?.Title || "Glossary"}
              description={pageData?.Content.Introduction || ""}
            />
          </div>
          <RegulatoryCirculars
            categories={categories}
            category={category}
            search={search.search || ""}
          />
        </SectionWrapper>
      </div>
    </ViewPort>
  );
};

export default page;
