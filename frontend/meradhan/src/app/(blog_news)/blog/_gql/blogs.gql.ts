import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";

export const blogsGql = `query Nodes($pagination: PaginationArg) {
  blogPosts_connection(pagination: $pagination) {
    nodes {
      Author {
        Facebook_Link
        Instagram_Link
        LinkedIn_Link
        Bio
        MetaData {
          Description
          KeyWords
          Priority
          Og_Image {
            url
          }
        }
        Name
        documentId
        publishedAt
        updatedAt
      }
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
    Facebook_Link: string;
    Instagram_Link: string;
    LinkedIn_Link: string;
    Bio?: string;
    MetaData: {
      Description?: string;
      KeyWords?: string;
      Priority: string;
      Og_Image: {
        url: string;
      };
    };
    Name: string;
    documentId: string;
    publishedAt: string;
    updatedAt: string;
  };
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
