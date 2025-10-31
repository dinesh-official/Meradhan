import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
 import { cn } from "@/lib/utils";
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

        <div className="py-14">
          <h1
            className={cn(
              "text-4xl text-center font-medium",
              "quicksand-medium"
            )}
          >
            Issuer
            <span className="font-semibold text-secondary"> Notes</span>
          </h1>
          <p className="text-center mt-2">
            Simple explanations of bond and fixed-income terms
          </p>
          <IssuerNotesSearchMode />
          <div className="flex flex-col gap-5 mt-5">
            {/* <div className="grid grid-cols-3 gap-5 mt-5"> */}
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
            <IssuerNoteCard gridMode={false}></IssuerNoteCard>
          </div>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
