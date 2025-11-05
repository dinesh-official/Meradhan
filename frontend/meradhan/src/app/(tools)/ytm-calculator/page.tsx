import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FdCalculatorContent from "../fd-calculator/_conponents/FdCalculatorContent";
import FdHeader from "../fd-calculator/_conponents/FdHeader";
import XirrCalculator from "./_components/XirrCalculator";
import ViewPort from "@/global/components/wrapper/ViewPort";

function YtmCalculator() {
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

      <FdHeader />
      <XirrCalculator />
      <FdCalculatorContent />
    
    </ViewPort>
  );
}

export default YtmCalculator;
