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
import { IssuerNoteCard } from "./_components/IssuerNoteCard";
import IssuerNotesSearchMode from "./_components/IssuerNotesSearchMode";

function page() {
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
          <div className="flex flex-col gap-5 mt-5">
            {/* <div className="gap-5 grid grid-cols-3 mt-5"> */}
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
          </div>
        </SectionWrapper>
      </div>
    </ViewPort>
  );
}

export default page;
