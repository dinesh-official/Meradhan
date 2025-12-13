"use server";
import { gqlClient } from "@/core/connection/apollo-client";
import { convertUTCtoIST } from "@/global/utils/datetime.utils";
import { gql } from "@apollo/client";
import { Metadata } from "next";

type DynamicPagesGqlResponse = {
  dynamicPages: Array<{
    documentId: string;
    Title: string;
    Slug: string;
    Content: {
      id: string;
      Introduction: string;
      Content_1?: string;
      Content_2?: string;
    };
    MetaData: {
      id: string;
      Title: string;
      Description?: string;
      KeyWords?: string;
      Og_Image: {
        url: string;
      };
      Priority: string;
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }>;
};

const getDynamicPagesGql = gql`
  query DynamicPages(
    $pagination: PaginationArg
    $filters: DynamicPagesListFiltersInput
  ) {
    dynamicPages(pagination: $pagination, filters: $filters) {
      documentId
      Title
      Slug
      Content {
        id
        Introduction
        Content_1
        Content_2
      }
    }
  }
`;

const getDynamicPagesVariables = (slug: string) => ({
  variables: {
    pagination: {
      pageSize: 1,
    },
    filters: {
      Slug: {
        eq: slug,
      },
    },
  },
});

const getDynamicPagesMetaDataGql = gql`
  query DynamicPages(
    $pagination: PaginationArg
    $filters: DynamicPagesListFiltersInput
  ) {
    dynamicPages(pagination: $pagination, filters: $filters) {
      documentId
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
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const getDynamicPageDataGql = async (slug: string) => {
  const { data } = await gqlClient.query<DynamicPagesGqlResponse>({
    query: getDynamicPagesGql,
    ...getDynamicPagesVariables(slug),
  });
  return data?.dynamicPages?.[0];
};

export type DynamicPageData = Awaited<ReturnType<typeof getDynamicPageDataGql>>;

export const getDynamicPageMetaDataGql = async (
  slug: string
): Promise<Metadata> => {
  const { data } = await gqlClient.query<DynamicPagesGqlResponse>({
    query: getDynamicPagesMetaDataGql,
    ...getDynamicPagesVariables(slug),
  });
  const md = data?.dynamicPages?.[0]?.MetaData;
  const meta = data?.dynamicPages?.[0];

  return {
    title: md?.Title,
    description: md?.Description,
    keywords: md?.KeyWords,
    other: {
      "article:published_time": convertUTCtoIST(meta?.["createdAt"]) || "",
      "article:modified_time": convertUTCtoIST(meta?.["updatedAt"]) || "",
      "og:updated_time": convertUTCtoIST(meta?.["updatedAt"]) || "",
    },
    openGraph: {
      title: md?.Title,
      description: md?.Description,
      images: md?.Og_Image ? [md.Og_Image.url] : undefined,
    },
  };
};
