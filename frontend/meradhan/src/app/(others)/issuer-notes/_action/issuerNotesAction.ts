"use server";
import apiServerCaller from "@/core/connection/apiServerCaller";
import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";
import apiGateway, { BondDetailsResponse } from "@root/apiGateway";
import { Metadata } from "next";

const isinSearchGql = `
query IssuerNotes_connection($pagination: PaginationArg, $filters: IssuerNotesListFiltersInput) {
  issuerNotes_connection(pagination: $pagination, filters: $filters) {
    nodes {
      Slug
      Logo {
        url
      }
      ISIN
      Issuer_Name
      documentId
    }
    pageInfo {
      total
      page
      pageSize
      pageCount
    }
  }
}
`;

const apiGate = new apiGateway.bondsApi.BondsApi(apiServerCaller);

export const fetchIssuerNotesGql = async (variables: {
  page: number;
  isinSearch?: string;
}) => {
  try {
    const { data } = await gqlClient.query<{
      issuerNotes_connection: {
        nodes: Array<{
          Slug: string;
          Logo: { url: string };
          ISIN: string;
          Issuer_Name: string;
          documentId: string;
          bondData: BondDetailsResponse;
        }>;
        pageInfo: {
          total: number;
          page: number;
          pageSize: number;
          pageCount: number;
        };
      };
    }>({
      query: gql(isinSearchGql),
      variables: {
        pagination: {
          page: variables.page,
          pageSize: 9,
        },
        filters: variables.isinSearch
          ? {
              Issuer_Name: {
                contains: variables.isinSearch,
              },
            }
          : undefined,
      },
    });

    const nodes = await Promise.all(
      (data?.issuerNotes_connection.nodes || []).map(async (note) => {
        let bondData: BondDetailsResponse | null = null;
        try {
          const bondDetails = await apiGate.getBondDetailsByIsin(
            JSON.parse(note.ISIN).value
          );
          bondData = bondDetails?.responseData || null;
        } catch (err) {
          console.error(
            `Error fetching bond details for ISIN ${note.ISIN}:`,
            err
          );
        }
        return {
          ...note,
          bondData,
        };
      })
    );
    return {
      nodes,
      pageInfo: data?.issuerNotes_connection?.pageInfo,
    };
  } catch (error) {
    console.error("Error    fetching issuer notes:", error);
    throw error;
  }
};

const isserNotesGql = `query IssuerNotes($pagination: PaginationArg, $filters: IssuerNotesListFiltersInput) {
  issuerNotes(pagination: $pagination, filters: $filters) {
    createdAt
    Slug
    documentId
    Images {
      url
    }
    Content {
      id
      Introduction
      Content_1
      Content_2
    }
    Faqs {
      id
      Question
      Answer
    }
    ISIN
    Issuer_Name
    Views
    Logo {
      url
    }
    updatedAt
  }
}`;

export type T_ISSHUER = {
  issuerNotes: Array<{
    createdAt: string;
    Slug: string;
    documentId: string;
    Images: Array<{
      url: string;
    }>;
    Content: {
      id: string;
      Introduction?: string;
      Content_1?: string;
      Content_2?: string;
    };
    Faqs: Array<{
      id: string;
      Question: string;
      Answer: string;
    }>;
    ISIN: string;
    Issuer_Name: string;
    Views: number;
    Logo: {
      url: string;
    };
    updatedAt: string;
  }>;
};

export const fetchIssuerNotesBySlugGql = async (slug: string) => {
  const { data } = await gqlClient.query<T_ISSHUER>({
    query: gql(isserNotesGql),
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
  if (data?.issuerNotes?.length === 0) {
    return null;
  }
  const bondDetails = await apiGate.getBondDetailsByIsin(
    JSON.parse(data!.issuerNotes?.[0].ISIN).value
  );
  return {
    data: data?.issuerNotes[0] || null,
    bondDetails: bondDetails.responseData,
  };
};

export const incrementIssuerNoteViews = async (
  documentId: string,
  views: number
) => {
  try {
    await gqlClient.mutate({
      mutation: gql`
        mutation UpdateIssuerNotesList(
          $documentId: ID!
          $data: IssuerNotesListInput!
        ) {
          updateIssuerNotesList(documentId: $documentId, data: $data) {
            Views
          }
        }
      `,
      variables: {
        documentId,
        data: {
          Views: views,
        },
      },
    });
  } catch (error) {
    console.error("Error incrementing issuer note views:", error);
  }
};

const issuerNotesSlugsGql = `query MetaData($filters: IssuerNotesListFiltersInput) {
  issuerNotes(filters: $filters) {
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
}`;

export const fetchIssuerNotesMetaData = async (
  slug: string
): Promise<Metadata> => {
  const { data } = await gqlClient.query<{
    issuerNotes: Array<{
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
  }>({
    query: gql(issuerNotesSlugsGql),
    variables: {
      filters: {
        Slug: {
          eq: slug,
        },
      },
    },
  });
  const metadata = data?.issuerNotes?.[0]?.MetaData;
  return {
    title: metadata?.Title || "Issuer Note",
    description: metadata?.Description || "",
    keywords: metadata?.KeyWords ? metadata.KeyWords.split(",") : [],
    openGraph: {
      title: metadata?.Title || "Issuer Note",
      description: metadata?.Description || "",
      images: metadata?.Og_Image ? [metadata.Og_Image.url] : undefined,
    },
  };
};
