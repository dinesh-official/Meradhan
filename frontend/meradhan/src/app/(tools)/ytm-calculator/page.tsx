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
import FdHeader from "../fd-calculator/_conponents/FdHeader";
import XirrCalculator from "./_components/XirrCalculator";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

export const revalidate = 0;
export const generateMetadata = async () => {
  return await getDynamicPageMetaDataGql("ytm-calculator");
};

const page = async () => {
  const headerData = await getDynamicPageDataGql("ytm-calculator");
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
              <BreadcrumbPage>YTM Calculator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <FdHeader
        title={headerData?.Title || ""}
        description={headerData?.Content?.Introduction || ""}
        content={headerData?.Content?.Content_1 || ""}
      />
      <XirrCalculator showFlowChart={false} showChart={false} />
      {/* <FdCalculatorContent /> */}

      <section className="mb-10 mt-10">
        <div
          className="container article "
          dangerouslySetInnerHTML={{
            __html: sanitizeStrapiHTML(headerData?.Content.Content_2),
          }}
        />
      </section>
    </ViewPort>
  );
};

export default page;
