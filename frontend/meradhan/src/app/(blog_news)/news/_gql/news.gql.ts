import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";

export const newsGql = `
query Author($pagination: PaginationArg) {
  newsPosts_connection(pagination: $pagination) {
    nodes {
      Description
      Title
      Views
      documentId
      createdAt
      Author {
        Name
        Profile_Image {
          url
        }
      }
      Category {
        Name
      }
      Featured_Image {
        url
      }
    }
  }
}`;

export type T_NEWS_GQL_RESPONSE = {
  newsPosts_connection: {
    nodes: Array<NEWS_NODE>;
  };
};

export type NEWS_NODE = {
  Description: string;
  Title: string;
  Views: number;
  documentId: string;
  createdAt: string;
  Author?: {
    Name: string;
    Profile_Image: {
      url: string;
    };
  };
  Category?: {
    Name: string;
  };
  Featured_Image: {
    url: string;
  };
};

export const fetchNewsData = async () => {
  const {data} = await gqlClient.query<T_NEWS_GQL_RESPONSE>({
    query: gql(newsGql),
    variables: {
      pagination: {
        pageSize: 1000,
      },
    },
  });
  return data
};
