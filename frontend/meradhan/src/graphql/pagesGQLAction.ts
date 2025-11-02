import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";
import { Metadata } from "next";

type T_SLUG_BASED_PAGES_DATA = {
  pages: Array<T_PAGE_DATA>;
};

export type T_PAGE_DATA = {
  Content: string;
  Description: string;
  Slug: string;
  Title: string;
  documentId: string;
};
type slugType =
  | "about-us"
  | "disclaimer"
  | "terms-of-use"
  | "privacy-policy"
  | "cookie-policy";

async function slugBasedPagesGQLData(slug: slugType) {
  const GQLQuery = `query Pages($filters: PagesListFiltersInput) {
  pages(filters: $filters) {
    Content
    Description
    Slug
    Title
    documentId
  }
}
  `;

  const { data } = await gqlClient.query<T_SLUG_BASED_PAGES_DATA>({
    query: gql(GQLQuery),
    variables: {
      filters: {
        Slug: {
          eq: slug,
        },
      },
    },
  });

  return data?.pages?.[0];
}

type T_SLUG_BASE_METADATA = {
  pages: Array<Page_MetaData>;
};
type Page_MetaData = {
  MetaData: {
    Description: string;
    KeyWords: string;
    Og_Image: {
      url: string;
    };
    Priority: string;
    Title: string;
    id: string;
  };
  createdAt: string;
  updatedAt: string;
};

export async function slugBasedGQLMetaData(slug: slugType) {
  const MetaDataGQLQuery = `query Pages($filters: PagesListFiltersInput) {
  pages(filters: $filters) {
    MetaData {
      Description
      KeyWords
      Og_Image {
        url
      }
      Priority
      Title
      id
    }
    createdAt
    updatedAt
  }
}`;

  const { data } = await gqlClient.query<T_SLUG_BASE_METADATA>({
    query: gql(MetaDataGQLQuery),
    variables: {
      filters: {
        Slug: {
          eq: slug,
        },
      },
    },
  });
  const pageMetaData = data?.pages?.[0];

  return {
    title: pageMetaData?.MetaData.Title,
    description: pageMetaData?.MetaData.Description,
    keywords: pageMetaData?.MetaData.KeyWords,
  } as Metadata;
}

export default slugBasedPagesGQLData;
