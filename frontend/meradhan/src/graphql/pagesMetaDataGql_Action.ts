/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import apiServerCaller from "@/core/connection/apiServerCaller";
import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";
import apiGateway from "@root/apiGateway";
import { Metadata } from "next";

const pageMetaDataGql = `
query PagesMetaData($filters: PagesMetaDataListFiltersInput, $pagination: PaginationArg) {
  pagesMetaData(filters: $filters, pagination: $pagination) {
    MetaData {
      id
      Title
      Description
      Keywords
      Priority
      Author {
        Name
      }
      Slug
      Og_Image {
        url
      }
    }
  }
}
`;

type PagesMetaDataResponse = {
  pagesMetaData: Array<{
    MetaData: {
      id: string;
      Title: string;
      Description: string;
      Keywords: Array<{
        name: string;
      }>;
      Priority: number;
      Author: {
        Name: string;
      };
      Slug: string;
      Og_Image: {
        url: string;
      };
    };
  }>;
};

export const generatePagesMetaData = async (
  slug: string
): Promise<Metadata> => {
  try {
    const { data } = await gqlClient.query<PagesMetaDataResponse>({
      query: gql(pageMetaDataGql),
      variables: {
        filters: {
          MetaData: {
            Slug: {
              eq: slug,
            },
          },
        },
        pagination: {
          limit: 1,
        },
      },
    });

    const metadata = data?.pagesMetaData?.[0]?.MetaData;
    console.log(metadata);

    if (!data?.pagesMetaData?.[0]?.MetaData?.Title) {
      return {};
    }

    return {
      title: metadata?.Title,
      description: metadata?.Description,
      keywords: metadata?.Keywords?.map((k) => k.name).join(", "),
      authors: metadata?.Author ? [{ name: metadata.Author.Name }] : undefined,
      openGraph: {
        title: metadata?.Title,
        description: metadata?.Description,
        // images: metadata?.Og_Image ? [metadata.Og_Image.url] : undefined,
      },
    };
  } catch (e) {
    console.log(e);

    return {};
  }
};

function fillTemplate(template: string, data: any): string {
  return template.replace(/\[([\w]+)\]/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : "";
  });
}

export const generateBondInfoPageMetaData = async (
  isin: string
): Promise<Metadata> => {
  const gqlCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
  const bond = await gqlCaller.getBondDetailsByIsin(isin);

  const bondData = bond.responseData;

  try {
    const { data } = await gqlClient.query<PagesMetaDataResponse>({
      query: gql(pageMetaDataGql),
      variables: {
        filters: {
          MetaData: {
            Slug: {
              eq: "bonds/detail/[isin]",
            },
          },
        },
        pagination: {
          limit: 1,
        },
      },
    });

    const metadata = data?.pagesMetaData?.[0]?.MetaData;
    console.log(metadata);

    if (!data?.pagesMetaData?.[0]?.MetaData?.Title) {
      return {};
    }

    return {
      title: fillTemplate(metadata?.Title || "", bondData),
      description: fillTemplate(metadata?.Description || "", bondData),
      keywords: metadata?.Keywords?.map((k) => k.name).join(", "),
      authors: metadata?.Author ? [{ name: metadata.Author.Name }] : undefined,
      openGraph: {
        title: fillTemplate(metadata?.Title || "", bondData),
        description: fillTemplate(metadata?.Description || "", bondData),
        // images: metadata?.Og_Image ? [metadata.Og_Image.url] : undefined,
      },
    };
  } catch (e) {
    console.log(e);

    return {};
  }
};
