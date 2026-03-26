import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
import EconomicCalender from "./EconomicCalender";
import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";
import { getDynamicPageMetaDataGql } from "@/graphql/getDynamicPageDataGql";

export const revalidate = 0;
export async function generateMetadata() {
  return await getDynamicPageMetaDataGql("economic-calendar");
}
async function page() {
  const category = await gqlClient.query<{
    economicCalendars: Array<{
      country: string;
      category: string;
    }>;
  }>({
    query: gql(`query EconomicCalendars($pagination: PaginationArg) {
  economicCalendars(pagination: $pagination) {
    country
    category
  }
}`),
    variables: {
      pagination: {
        pageSize: 100000000,
      },
    },
  });

  const categories = Array.from(
    new Set(category.data?.economicCalendars.map((item) => item.category))
  );

  const countries = Array.from(
    new Set(category.data?.economicCalendars.map((item) => item.country))
  );

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
              <BreadcrumbPage>Economic Calendar</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <EconomicCalender categoryList={categories} countryList={countries} />
      </div>
    </ViewPort>
  );
}

export default page;
