import { gqlClient } from "@/core/connection/apollo-client";
import { convertUTCtoIST } from "@/global/utils/datetime.utils";
import { gql } from "@apollo/client";
import { Metadata } from "next";

export const blogsGql = `query Nodes($pagination: PaginationArg, $blogCategoriesConnectionPagination2: PaginationArg, $sort: [String], $filters: BlogPostListFiltersInput) {
  blogPosts_connection(pagination: $pagination, sort: $sort, filters: $filters) {
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
      Category {
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
  blogCategories_connection(pagination: $blogCategoriesConnectionPagination2) {
    nodes {
      Name
      Slug
    }
    pageInfo {
      pageSize
    }
  }
}`;

export type T_BLOGS_GQL_RESPONSE = {
  blogPosts_connection: {
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
      Category: {
        Name: string;
        Slug: string;
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
  blogCategories_connection: {
    nodes: Array<{
      Name: string;
      Slug: string;
    }>;
    pageInfo: {
      pageSize: number;
    };
  };
};

export const fetchBlogsData = async ({
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
      Category: {
        Slug: {
          eq: categoryName,
        },
      },
    };
  }

  console.log(filters);

  const { data } = await gqlClient.query<T_BLOGS_GQL_RESPONSE>({
    query: gql(blogsGql),
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

const blogPostGql = `query BlogPosts($filters: BlogPostListFiltersInput, $pagination: PaginationArg) {
  blogPosts(filters: $filters, pagination: $pagination) {
    Description
    documentId
    Slug
    Title
    Views
    createdAt
    Tags
    Category {
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
}`;

export const fetchBlogPostData = async (slug: string) => {
  const { data } = await gqlClient.query<{
    blogPosts: Array<{
      Description: string;
      Slug: string;
      Title: string;
      Views: number;
      createdAt: string;
      documentId: string;
      Tags: Array<{
        name: string;
      }>;
      Category: {
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
  }>({
    query: gql(blogPostGql),
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
  return data?.blogPosts[0];
};

const blogPostmetaGql = `query MetaData($filters: BlogPostListFiltersInput) {
  blogPosts(filters: $filters) {
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
}`;

export const fetchBlogPostMetaData = async (
  slug: string
): Promise<Metadata> => {
  const { data } = await gqlClient.query<{
    blogPosts: Array<{
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
  }>({
    query: gql(blogPostmetaGql),
    variables: {
      filters: {
        Slug: {
          eq: slug,
        },
      },
    },
  });
  const post = data?.blogPosts?.[0];
  const metadata = post?.MetaData;

  if (!metadata?.Title) {
    return {};
  }
  return {
    title: metadata.Title,
    description: metadata?.Description,
    keywords: metadata?.KeyWords,

    openGraph: {
      title: metadata?.Title,
      description: metadata?.Description,
      images: metadata?.Og_Image
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

const relatedBlogsGql = `query Category($filters: BlogPostListFiltersInput, $pagination: PaginationArg) {
  blogPosts(filters: $filters, pagination: $pagination) {
    Category {
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
}`;

export const fetchReletedBlogs = async (
  categorySlug: string,
  excludeSlug: string
) => {
  const { data } = await gqlClient.query<{
    blogPosts: Array<{
      Category: {
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
  }>({
    query: gql(relatedBlogsGql),
    variables: {
      filters: {
        Category: {
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
  return data?.blogPosts;
};

const viewMutateGql = `mutation UpdateBlogPostList($documentId: ID!, $data: BlogPostListInput!) {
  updateBlogPostList(documentId: $documentId, data: $data) {
    Views
  }
}`;

export const addBlogViews = async (documentId: string, views: number) => {
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
