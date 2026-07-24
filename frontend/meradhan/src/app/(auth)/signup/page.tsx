import { Card } from "@/components/ui/card";
import ViewPort from "@/global/components/wrapper/ViewPort";
import { generatePagesMetaData } from "@/graphql/pagesMetaDataGql_Action";
import SignUpForm from "./SignUpForm";
import SignupReasonsPanel from "./_components/SignupReasonsPanel";

export const revalidate = 0; // Revalidate the page every hour

export const generateMetadata = async () => {
  return await generatePagesMetaData("signup");
};
function page() {
  return (
    <ViewPort headerOnly>
      <div className="flex justify-center items-center bg-muted py-10 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)]">
        <div className="container">
          <Card className="grid lg:grid-cols-2 p-0 lg:p-0 border-0 w-full overflow-hidden">
            <SignUpForm />
            <SignupReasonsPanel />
          </Card>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
