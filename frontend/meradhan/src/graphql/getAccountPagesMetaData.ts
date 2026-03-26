"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { gqlClient } from "@/core/connection/apollo-client";
import { convertUTCtoIST } from "@/global/utils/datetime.utils";
import { gql } from "@apollo/client";
import { Metadata } from "next";

const accountPageKycGql = `query MetaData($pagination: PaginationArg, $filters: AccountPagesMetadataListFiltersInput) {
  accountPagesMetadata(pagination: $pagination, filters: $filters) {
    MetaData {
      id
      Title
      Description
      KeyWords
      Og_Image {
        url
      }
      Priority
    }
    Slug
    createdAt
    updatedAt
  }
}`;

export type AccountPageMetaData = {
  accountPagesMetadata: Array<{
    MetaData: {
      id: string;
      Title: string;
      Description: any;
      KeyWords: any;
      Og_Image: any;
      Priority: string;
    };
    Slug: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export const getAccountPagesMetaData = async (
  slug: string
): Promise<Metadata> => {
  const data = await gqlClient.query<AccountPageMetaData>({
    query: gql(accountPageKycGql),
    variables: {
      filters: {
        Slug: {
          eq: slug,
        },
      },
      pagination: {
        limit: 1,
      },
    },
  });

  const accountPageMetaData = data?.data?.accountPagesMetadata?.[0];

  return {
    title: accountPageMetaData?.MetaData?.Title,
    description: accountPageMetaData?.MetaData?.Description,
    keywords: accountPageMetaData?.MetaData?.KeyWords,
    other: {
      "article:published_time":
        convertUTCtoIST(accountPageMetaData?.["createdAt"]) || "",
      "article:modified_time":
        convertUTCtoIST(accountPageMetaData?.["updatedAt"]) || "",
      "og:updated_time":
        convertUTCtoIST(accountPageMetaData?.["updatedAt"]) || "",
    },
    openGraph: {
      title: accountPageMetaData?.MetaData?.Title,
      description: accountPageMetaData?.MetaData?.Description,
      images: accountPageMetaData?.MetaData?.Og_Image
        ? [
            {
              url: accountPageMetaData.MetaData.Og_Image.url,
            },
          ]
        : [],
    },
  };
};
