import { gqlClient } from "@/core/connection/apollo-client";
import { convertUTCtoIST } from "@/global/utils/datetime.utils";
import { gql } from "@apollo/client";
import { Metadata } from "next";

export const NewsGql = `query Nodes($blogCategoriesConnectionPagination2: PaginationArg, $sort: [String], $filters: NewsPostListFiltersInput, $pagination: PaginationArg) {
  newsPosts_connection(sort: $sort, filters: $filters, pagination: $pagination) {
    nodes {
      Author {
        Name
        Profile_Image {
          url
        }
      }
      Description
      Featured_Image {
        url
      }
      Title
      Views
      news_category {
        Name
        Slug
      }
      documentId
      createdAt
      Slug
    }
    pageInfo {
      total
      page
      pageSize
      pageCount
    }
  }
  newsCategories_connection(pagination: $blogCategoriesConnectionPagination2) {
    nodes {
      Name
      Slug
    }
    pageInfo {
      pageSize
    }
  }
}`;

export type T_News_GQL_RESPONSE = {
  newsPosts_connection: {
    nodes: Array<{
      Author: {
        Name: string;
        Profile_Image: {
          url: string;
        };
      };
      Description: string;
      Featured_Image: {
        url: string;
      };
      Title: string;
      Views: number;
      news_category: {
        Slug: string;
        Name: string;
      };
      documentId: string;
      createdAt: string;
      Slug: string;
    }>;
    pageInfo: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
  newsCategories_connection: {
    nodes: Array<{
      Name: string;
      Slug: string;
    }>;
    pageInfo: {
      pageSize: number;
    };
  };
};

export const fetchNewsData = async ({
  page,
  sort,
  categoryName,
}: {
  page: number;
  sort?: string;
  categoryName?: string;
}) => {
  let sortQuery: string | undefined = undefined;
  if (sort === "view") {
    sortQuery = "Views:desc";
  } else if (sort === "latest") {
    sortQuery = "createdAt:desc";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filters: any;

  if (categoryName) {
    filters = {
      news_category: {
        Slug: {
          eq: categoryName,
        },
      },
    };
  }

  console.log(filters);

  const { data } = await gqlClient.query<T_News_GQL_RESPONSE>({
    query: gql(NewsGql),
    variables: {
      filters: filters,
      sort: sortQuery,
      pagination: {
        pageSize: 10,
        page: page,
      },
      blogCategoriesConnectionPagination2: {
        pageSize: 1000,
      },
    },
  });
  return data;
};

const newsPostGql = `query newsPosts_connection($filters: NewsPostListFiltersInput, $pagination: PaginationArg) {
  newsPosts_connection(filters: $filters, pagination: $pagination) {
nodes {
      Description
    documentId
    Slug
    Title
    Views
    createdAt
    Tags
    news_category {
      Name
      Slug
    }
    Featured_Image {
      url
    }
    Contents {
      id
      Introduction
      Content_1
      Content_2
    }
    Author {
      Facebook_Link
      Instagram_Link
      LinkedIn_Link
      Name
      Position
      X_Link
      Profile_Image {
        url
      }
    }
}
  }
}`;

export const fetchNewsPostData = async (slug: string) => {
  const { data } = await gqlClient.query<{
    newsPosts_connection: {
      nodes: Array<{
        Description: string;
        Slug: string;
        Title: string;
        Views: number;
        createdAt: string;
        documentId: string;
        Tags: Array<{
          name: string;
        }>;
        news_category: {
          Name: string;
          Slug: string;
        };
        Featured_Image: {
          url: string;
        };
        Contents: {
          id: string;
          Introduction: string;
          Content_1: string;
          Content_2: string;
        };
        Author: {
          Facebook_Link?: string;
          Instagram_Link?: string;
          LinkedIn_Link?: string;
          Name: string;
          Position?: string;
          X_Link?: string;
          Profile_Image: {
            url: string;
          };
        };
      }>;
    };
  }>({
    query: gql(newsPostGql),
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
  return data?.newsPosts_connection.nodes[0];
};

const newsPostmetaGql = `query MetaData($filters: NewsPostListFiltersInput) {
  newsPosts_connection(filters: $filters) {
    nodes {
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
    Author {
      Name
      Profile_Image {
        url
      }
    }
    Featured_Image {
      url
    }
    }
  }
}`;

export const fetchNewsPostMetaData = async (
  slug: string
): Promise<Metadata> => {
  const { data } = await gqlClient.query<{
    newsPosts_connection: {
      nodes: Array<{
        MetaData: {
          id: string;
          Title: string;
          Description?: string;
          KeyWords?: string;
          Og_Image?: {
            url: string;
          };
          Priority: string;
        };
        createdAt: string;
        updatedAt: string;
        Author: {
          Name: string;
          Profile_Image: {
            url: string;
          };
        };
        Featured_Image: {
          url: string;
        };
      }>;
    };
  }>({
    query: gql(newsPostmetaGql),
    variables: {
      filters: {
        Slug: {
          eq: slug,
        },
      },
    },
  });
  const post = data?.newsPosts_connection.nodes?.[0];
  const metadata = post?.MetaData;

  if (!metadata?.Title) {
    return {};
  }
  return {
    title: metadata.Title,
    description: metadata.Description,
    keywords: metadata.KeyWords,
    authors: post?.Author ? [{ name: post.Author.Name }] : undefined,
    openGraph: {
      title: metadata.Title,
      description: metadata.Description,
      images: metadata.Og_Image
        ? [
            {
              url: metadata.Og_Image.url,
            },
          ]
        : undefined,
      type: "article",
      publishedTime: post?.createdAt && convertUTCtoIST(post?.createdAt),
      modifiedTime: post?.updatedAt && convertUTCtoIST(post?.updatedAt),
    },
  };
};

const relatedNewsGql = `query Category($filters: NewsPostListFiltersInput, $pagination: PaginationArg) {
  newsPosts_connection(filters: $filters, pagination: $pagination) {
   nodes {
     news_category {
      Name
      Slug
    }
    Author {
      Name
      Position
      Profile_Image {
        url
      }
    }
    Description
    Featured_Image {
      url
    }
    Title
    Slug
    Views
    createdAt
  }
   }
}`;

export const fetchReletedNews = async (
  categorySlug: string,
  excludeSlug: string
) => {
  const { data } = await gqlClient.query<{
    newsPosts_connection: {
      nodes: Array<{
        news_category: {
          Name: string;
          Slug: string;
        };
        Author: {
          Name: string;
          Position: string;
          Profile_Image: {
            url: string;
          };
        };
        Description: string;
        Featured_Image: {
          url: string;
        };
        Title: string;
        Slug: string;
        Views: number;
        createdAt: string;
      }>;
    };
  }>({
    query: gql(relatedNewsGql),
    variables: {
      filters: {
        news_category: {
          Slug: {
            eq: categorySlug,
          },
        },
        and: [
          {
            Slug: {
              eqi: excludeSlug,
            },
          },
        ],
      },
      pagination: {
        pageSize: 5,
      },
    },
  });
  return data?.newsPosts_connection;
};

const viewMutateGql = `mutation UpdateNewsPostList($documentId: ID!, $data: NewsPostListInput!) {
  updateNewsPostList(documentId: $documentId, data: $data) {
    Views
  }
}`;

export const addNewsViews = async (documentId: string, views: number) => {
  return await gqlClient.mutate({
    mutation: gql(viewMutateGql),
    variables: {
      documentId: documentId,
      data: {
        Views: views,
      },
    },
  });
};
