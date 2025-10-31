import ViewPort from '@/global/components/wrapper/ViewPort'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FdHeader from './_conponents/FdHeader';
import ReturnsCalculationSection from '@/app/(index)/_components/ReturnsCalculationSection';
import FdCalculatorContent from './_conponents/FdCalculatorContent';
const page = () => {
  return (
     <ViewPort>
          <div className="mb-[1rem] container">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Fd Calculator</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
            <FdHeader />
            <ReturnsCalculationSection/>
            <FdCalculatorContent/>

        </ViewPort>
  )
}

export default page