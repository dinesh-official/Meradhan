import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SectionTitleDesc from "@/global/components/basic/section/SectionTitleDesc";
import SectionWrapper from "@/global/components/basic/section/SectionWrapper";
import ViewPort from "@/global/components/wrapper/ViewPort";
import IssuerNotesSearchMode from "./_components/IssuerNotesSearchMode";
import IssuerNotesView from "./_components/IssuerNotesView";
import { fetchIssuerNotesGql } from "./_action/issuerNotesAction";
import { getDynamicPageMetaDataGql } from "@/graphql/getDynamicPageDataGql";
import Pagination from "./_components/Pagination";

export const revalidate = 0; // Revalidate the page every hour
export const generateMetadata = async () => {
  return await getDynamicPageMetaDataGql("issuer-notes");
};

async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { search, page } = await searchParams;
  const data = await fetchIssuerNotesGql({
    page: page ? parseInt(page) : 1,
    isinSearch: search,
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
              <BreadcrumbPage>Issuer Notes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <SectionWrapper>
          <SectionTitleDesc
            title={
              <>
                Issuer
                <span className="font-semibold text-secondary"> Notes</span>
              </>
            }
            description="Simple explanations of bond and fixed-income terms"
          />

          <IssuerNotesSearchMode />
          <IssuerNotesView data={data} />
          <Pagination
            pageInfo={{
              pageCount: data?.pageInfo?.pageCount,
              page: data?.pageInfo?.page,
            }}
          />
        </SectionWrapper>
      </div>
    </ViewPort>
  );
}

export default page;
