import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";

const reg_cer_MetaDataGql = `
query Nodes($pagination: PaginationArg, $filters: RegulatoryCircularsCategoryFiltersInput) {
  regulatoryCircularsCategories_connection(pagination: $pagination, filters: $filters) {
    nodes {
      createdAt
      updatedAt
      Slug
      Title
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
}
`;

export const fetchRegulatoryCircularsMetaDataGql = async (
  categorySlug: string
) => {
  const { data } = await gqlClient.query<{
    regulatoryCircularsCategories_connection: {
      nodes: Array<{
        createdAt: string;
        updatedAt: string;
        Slug: string;
        Title: string;
        MetaData: {
          id: string;
          Title: string;
          Description: string;
          KeyWords: string;
          Og_Image?: {
            url: string;
          };
          Priority: string;
        };
      }>;
    };
  }>({
    query: gql(reg_cer_MetaDataGql),
    variables: {
      filters: {
        Slug: {
          eq: categorySlug,
        },
      },
      pagination: {
        limit: 1,
      },
    },
  });
  const meraData = data?.regulatoryCircularsCategories_connection.nodes[0];
  return {
    title: meraData?.Title,
    description: meraData?.MetaData?.Description || "",
    keywords: meraData?.MetaData?.KeyWords || "",
    openGraph: {
      title: meraData?.MetaData?.Title || meraData?.Title,
      description: meraData?.MetaData?.Description || "",
      images: meraData?.MetaData?.Og_Image
        ? [
            {
              url: meraData.MetaData.Og_Image.url,
            },
          ]
        : [],
    },
  };
};

const categoryListGql = `query Nodes($pagination: PaginationArg) {
  regulatoryCircularsCategories_connection(pagination: $pagination) {
    nodes {
      Title
      Slug
    }
  }
}`;

export type T_RegulatoryCircularsCategories_GQL_RESPONSE = {
  regulatoryCircularsCategories_connection: {
    nodes: Array<{
      Title: string;
      Slug: string;
    }>;
  };
};

export const fetchRegulatoryCircularsCategoriesGql = async () => {
  const { data } =
    await gqlClient.query<T_RegulatoryCircularsCategories_GQL_RESPONSE>({
      query: gql(categoryListGql),
      variables: {
        pagination: {
          limit: 100,
        },
      },
    });
  return data?.regulatoryCircularsCategories_connection?.nodes;
};

const pageDataGql = `query RegulatoryCirculars_connection($pagination: PaginationArg, $filters: RegulatoryCircularsListFiltersInput) {
  regulatoryCirculars_connection(pagination: $pagination, filters: $filters) {
    pageInfo {
      total
      page
      pageSize
      pageCount
    }
    nodes {
      documentId
      Name
      FileSource
      File {
        url
        name
      }
      Circular_Number
      Circular_Date
      regulatory_circulars_category {
        Title
        Slug
        Logo {
          url
        }
      }
      createdAt
      updatedAt
      publishedAt
    }
  }
}`;

export type T_RegulatoryCirculars_GQL_RESPONSE = {
  documentId: string;
  Name: string;
  FileSource: string;
  File: {
    url: string;
    name: string;
  };
  Circular_Number: string;
  Circular_Date: string;
  regulatory_circulars_category: {
    Title: string;
    Slug: string;
    Logo: {
      url: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}[];

const generateFilter = ({
  search,
  category,
  from,
  to,
}: {
  search?: string;
  category: string;
  from?: string;
  to?: string;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};
  console.log(search, category, from, to);

  if (category.toLowerCase() != "all") {
    filter["regulatory_circulars_category"] = {
      Slug: {
        eq: category,
      },
    };
  }

  if (from) {
    filter["Circular_Date"] = {
      ...(filter["Circular_Date"] || {}),
      gte: from,
    };
  }

  if (to) {
    filter["Circular_Date"] = {
      ...(filter["Circular_Date"] || {}),
      lte: to,
    };
  }

  if (search) {
    filter["Name"] = {
      contains: search,
    };
  }

  return filter;
};

export const fetchRegulatoryCircularsByCategoryGql = async ({
  slug,
  page = 1,
  from,
  to,
  search,
}: {
  slug?: string;
  page?: number;
  from?: string;
  to?: string;
  search?: string;
}) => {
  const filter = generateFilter({
    category: slug || "all",
    from,
    to,
    search,
  });
  console.log(filter);

  const { data } = await gqlClient.query<{
    regulatoryCirculars_connection: {
      pageInfo: {
        total: number;
        page: number;
        pageSize: number;
        pageCount: number;
      };
      nodes: T_RegulatoryCirculars_GQL_RESPONSE;
    };
  }>({
    query: gql(pageDataGql),
    variables: {
      filters: filter,
      pagination: {
        pageSize: 3,
        page: page,
      },
    },
  });

  return {
    data: data?.regulatoryCirculars_connection.nodes,
    pageInfo: data?.regulatoryCirculars_connection.pageInfo,
  };
};
