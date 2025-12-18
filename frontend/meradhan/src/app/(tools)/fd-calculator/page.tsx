import ReturnsCalculationSection from "@/app/(index)/_components/ReturnsCalculationSection";
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
import FdHeader from "./_conponents/FdHeader";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

export const revalidate = 0;
export const generateMetadata = async () => {
  return await getDynamicPageMetaDataGql("fd-calculator");
};

const page = async () => {
  const headerData = await getDynamicPageDataGql("fd-calculator");
  return (
    <ViewPort>
      <div className="mb-4 container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>FD Calculator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <FdHeader
        title={headerData?.Title || ""}
        description={headerData?.Content?.Introduction || ""}
        content={headerData?.Content?.Content_1 || ""}
      />
      <ReturnsCalculationSection />
      {/* <FdCalculatorContent /> */}
      <section>
        <div
          className="container article"
          dangerouslySetInnerHTML={{
            __html: sanitizeStrapiHTML(headerData?.Content.Content_2),
          }}
        />
      </section>
    </ViewPort>
  );
};

export default page;
