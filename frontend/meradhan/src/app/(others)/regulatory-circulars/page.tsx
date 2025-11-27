import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
import {
  getDynamicPageDataGql,
  getDynamicPageMetaDataGql,
} from "@/graphql/getDynamicPageDataGql";
import { cn } from "@/lib/utils";
import RegulatoryCirculars from "./RegulatoryCirculars";
import PageTitleDesc from "@/global/components/basic/page/PageTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import {
  fetchRegulatoryCircularsByCategoryGql,
  fetchRegulatoryCircularsCategoriesGql,
} from "./_actions/reg-cir";
import Pagination from "./_components/Pagination";
export const revalidate = 0;
export const generateMetadata = async () => {
  return await getDynamicPageMetaDataGql("regulatory-circulars");
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
  const data = await fetchRegulatoryCircularsByCategoryGql({
    slug: (await params).category,
    page: (await searchParams).page ? parseInt((await searchParams).page!) : 1,
  });
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
              <BreadcrumbPage>Regulatory Circulars</BreadcrumbPage>
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

          <RegulatoryCirculars categories={categories} data={data.data || []} />
          <Pagination pageInfo={data.pageInfo} />
        </SectionWrapper>
      </div>
    </ViewPort>
  );
};

export default page;
