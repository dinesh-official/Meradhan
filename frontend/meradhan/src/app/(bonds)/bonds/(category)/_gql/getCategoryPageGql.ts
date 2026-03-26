import { gqlClient } from "@/core/connection/apollo-client";
import { convertUTCtoIST } from "@/global/utils/datetime.utils";
import { gql } from "@apollo/client";
import { Metadata } from "next";

const getBondCategoryPageGql = `
query BondCategories($pagination: PaginationArg, $filters: BondCategoryFiltersInput) {
  bondCategories(pagination: $pagination, filters: $filters) {
    documentId
    Title
    Description
    Slug
    createdAt
    updatedAt
    publishedAt
  }
}
`;

const getBondCategoryPageGqlVariables = async (slug: string) => {
  return {
    filters: {
      Slug: {
        eq: slug,
      },
    },
    pagination: {
      page: 1,
      pageSize: 1,
    },
  };
};

export const fetchBondCategoryPageData = async (slug: string) => {
  const variables = await getBondCategoryPageGqlVariables(slug);

  const { data } = await gqlClient.query({
    query: gql(getBondCategoryPageGql),
    variables: variables,
  });

  return data;
};

const bondCategoryGql = gql`
  query BondCategories(
    $filters: BondCategoryFiltersInput
    $pagination: PaginationArg
  ) {
    bondCategories(filters: $filters, pagination: $pagination) {
      createdAt
      updatedAt
      Category
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
    }
  }
`;

export type BondCategoryMetaData = {
  bondCategories: Array<{
    createdAt: string;
    updatedAt: string;

    MetaData: {
      id: string;
      Title: string;
      Description: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      KeyWords: any;
      Og_Image?: {
        url: string;
      };
      Priority: string;
    };
  }>;
};

export const generateBondCategoryMetaData = async (
  name: string
): Promise<Metadata> => {
  const { data } = await gqlClient.query<BondCategoryMetaData>({
    query: bondCategoryGql,
    variables: {
      filters: {
        Category: {
          eq: name,
        },
      },
      pagination: {
        pageSize: 1,
      },
    },
  });

  const md = data?.bondCategories[0]?.MetaData;
  const meta = data?.bondCategories[0];

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
      images: md?.Og_Image ? [md.Og_Image.url] : [],
    },
  };
};
