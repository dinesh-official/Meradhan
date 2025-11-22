import ViewPort from "@/global/components/wrapper/ViewPort";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import BondIsinView from "../../../_components/BondIsinView";
import apiGateway from "@root/apiGateway";
import apiServerCaller from "@/core/connection/apiServerCaller";
import { redirect } from "next/navigation";
import { generateBondInfoPageMetaData } from "@/graphql/pagesMetaDataGql_Action";

export const revalidate = 0;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ isin: string }>;
}) => {
  const { isin } = await params;
  return await generateBondInfoPageMetaData(isin);
};

async function page({ params }: { params: Promise<{ isin: string }> }) {
  const { isin } = await params;

  const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
  const { responseData } = await apiCaller.getBondDetailsByIsin(isin);

  if (!responseData) {
    redirect("/404");
  }

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
              <BreadcrumbLink href="/bonds">Bonds</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{isin}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <BondIsinView bond={responseData} />
      </div>
    </ViewPort>
  );
}

export default page;
