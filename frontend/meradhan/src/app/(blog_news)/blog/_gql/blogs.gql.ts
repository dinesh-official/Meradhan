import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";

export const blogsGql = `query Nodes($pagination: PaginationArg) {
  blogPosts_connection(pagination: $pagination) {
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
      }
      documentId
      createdAt
    }
  }
}`;

export type T_BLOGS_GQL_RESPONSE = {
  blogPosts_connection: {
    nodes: Array<BLOGS_NODE>;
  };
};

export type BLOGS_NODE = {
  Author?: {
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
  Category?: {
    Name: string;
  };
  documentId: string;
  createdAt: string;
};

export const fetchBlogsData = async () => {
  const { data } = await gqlClient.query<T_BLOGS_GQL_RESPONSE>({
    query: gql(blogsGql),
    variables: {
      pagination: {
        pageSize: 1000,
      },
    },
  });
  return data;
};
