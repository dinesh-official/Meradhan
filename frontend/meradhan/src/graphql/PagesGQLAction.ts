import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";

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

async function slugBasedPagesGQLData(
  slug:
    | "about-us"
    | "disclaimer"
    | "terms-of-use"
    | "privacy-policy"
    | "cookie-policy"
) {
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

export default slugBasedPagesGQLData;
