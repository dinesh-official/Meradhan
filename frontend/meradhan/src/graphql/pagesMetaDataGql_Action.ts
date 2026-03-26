/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import apiServerCaller from "@/core/connection/apiServerCaller";
import { gqlClient } from "@/core/connection/apollo-client";
import { convertUTCtoIST } from "@/global/utils/datetime.utils";
import { gql } from "@apollo/client";
import apiGateway from "@root/apiGateway";
import { Metadata } from "next";

const pageMetaDataGql = `
query PagesMetaData($filters: PagesMetaDataListFiltersInput, $pagination: PaginationArg) {
  pagesMetaData(filters: $filters, pagination: $pagination) {
    MetaData {
      id
      Title
      Description
      Keywords
      Priority
      Author {
        Name
      }
      Slug
      Og_Image {
        url
      }
    }
    updatedAt
    publishedAt
    createdAt
  }
}
`;

type PagesMetaDataResponse = {
  pagesMetaData: Array<{
    MetaData: {
      id: string;
      Title: string;
      Description: string;
      Keywords: Array<{
        name: string;
      }>;
      Priority: number;
      Author: {
        Name: string;
      };
      Slug: string;
      Og_Image: {
        url: string;
      };
    };
    updatedAt: string;
    publishedAt: string;
    createdAt: string;
  }>;
};

export const generatePagesMetaData = async (
  slug: string,
): Promise<Metadata> => {
  try {
    const { data } = await gqlClient.query<PagesMetaDataResponse>({
      query: gql(pageMetaDataGql),
      variables: {
        filters: {
          MetaData: {
            Slug: {
              eq: slug,
            },
          },
        },
        pagination: {
          limit: 1,
        },
      },
    });

    const metadata = data?.pagesMetaData?.[0]?.MetaData;

    if (!data?.pagesMetaData?.[0]?.MetaData?.Title) {
      return {};
    }

    return {
      title: metadata?.Title,
      description: metadata?.Description,
      keywords: metadata?.Keywords?.map((k) => k.name).join(", "),
      authors: metadata?.Author ? [{ name: metadata.Author.Name }] : undefined,
      other: {
        "article:published_time":
          convertUTCtoIST(data.pagesMetaData?.[0]?.["createdAt"]) || "",
        "article:modified_time":
          convertUTCtoIST(data.pagesMetaData?.[0]?.["updatedAt"]) || "",
        "og:updated_time":
          convertUTCtoIST(data.pagesMetaData?.[0]?.["updatedAt"]) || "",
      },
      openGraph: {
        title: metadata?.Title,
        description: metadata?.Description,
        images: metadata?.Og_Image ? [metadata.Og_Image.url] : undefined,
      },
    };
  } catch (e) {
    console.log(e);
    return {};
  }
};

function fillTemplate(template: string, data: any): string {
  return template.replace(/\[([\w]+)\]/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : "";
  });
}

export const generateBondInfoPageMetaData = async (
  isin: string,
  slug?: string,
): Promise<Metadata> => {
  const gqlCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
  const bond = await gqlCaller.getBondDetailsByIsin(isin);

  const bondData = bond.responseData;

  try {
    const { data } = await gqlClient.query<PagesMetaDataResponse>({
      query: gql(pageMetaDataGql),
      variables: {
        filters: {
          MetaData: {
            Slug: {
              eq: slug || "bonds/detail/[isin]",
            },
          },
        },
        pagination: {
          limit: 1,
        },
      },
    });

    const metadata = data?.pagesMetaData?.[0]?.MetaData;
    console.log(metadata);

    if (!data?.pagesMetaData?.[0]?.MetaData?.Title) {
      return {};
    }

    return {
      title: fillTemplate(metadata?.Title || "", bondData),
      description: fillTemplate(metadata?.Description || "", bondData),
      keywords: metadata?.Keywords?.map((k) => k.name).join(", "),
      authors: metadata?.Author ? [{ name: metadata.Author.Name }] : undefined,
      other: {
        "article:published_time":
          convertUTCtoIST(bondData?.["createdAt"]) || "",
        "article:modified_time": convertUTCtoIST(bondData?.["updatedAt"]) || "",
        "og:updated_time": convertUTCtoIST(bondData?.["updatedAt"]) || "",
      },
      openGraph: {
        title: fillTemplate(metadata?.Title || "", bondData),
        description: fillTemplate(metadata?.Description || "", bondData),
        // images: metadata?.Og_Image ? [metadata.Og_Image.url] : undefined,
      },
    };
  } catch (e) {
    console.log(e);

    return {};
  }
};

const pageMetaDataGql_Category = `query Author($pagination: PaginationArg, $filters: BlogCategoryFiltersInput) {
  blogCategories(pagination: $pagination, filters: $filters) {
    Author {
      Name
      Profile_Image {
        url
      }
    }
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
    publishedAt
    createdAt
    updatedAt
  }
}`;

export const getBlogCategoryMetaData = async (
  categorySlug: string,
): Promise<Metadata> => {
  try {
    const { data } = await gqlClient.query<{
      blogCategories: Array<{
        Author: {
          Name: string;
          Profile_Image: {
            url: string;
          };
        };
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
        publishedAt: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>({
      query: gql(pageMetaDataGql_Category),
      variables: {
        pagination: {
          limit: 1,
        },
        filters: {
          Slug: {
            eq: categorySlug,
          },
        },
      },
    });

    const metadata = data?.blogCategories?.[0]?.MetaData;
    const author = data?.blogCategories?.[0]?.Author;

    if (!data?.blogCategories?.[0]?.MetaData?.Title) {
      return {};
    }
    const meta = data?.blogCategories?.[0];

    return {
      title: metadata?.Title,
      description: metadata?.Description,
      keywords: metadata?.KeyWords,
      authors: author ? [{ name: author.Name }] : undefined,
      other: {
        "article:published_time": convertUTCtoIST(meta?.["createdAt"]) || "",
        "article:modified_time": convertUTCtoIST(meta?.["updatedAt"]) || "",
        "og:updated_time": convertUTCtoIST(meta?.["updatedAt"]) || "",
      },
      openGraph: {
        title: metadata?.Title,
        description: metadata?.Description,
        // images: metadata?.Og_Image ? [metadata.Og_Image.url] : undefined,
      },
    };
  } catch (e) {
    console.log(e);

    return {};
  }
};

const pageMetaDataGql_NewsCategory = `query Author($pagination: PaginationArg) {
  newsCategories(pagination: $pagination) {
    Author {
      Name
      Profile_Image {
        url
      }
    }
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
    publishedAt
    createdAt
    updatedAt
  }
}`;

export const getNewsCategoryMetaData = async (
  categorySlug: string,
): Promise<Metadata> => {
  try {
    const { data } = await gqlClient.query<{
      newsCategories: Array<{
        Author: {
          Name: string;
          Profile_Image: {
            url: string;
          };
        };
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
        publishedAt: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>({
      query: gql(pageMetaDataGql_NewsCategory),
      variables: {
        pagination: {
          limit: 1,
        },
        filters: {
          Slug: {
            eq: categorySlug,
          },
        },
      },
    });

    const metadata = data?.newsCategories?.[0]?.MetaData;
    const author = data?.newsCategories?.[0]?.Author;

    if (!data?.newsCategories?.[0]?.MetaData?.Title) {
      return {};
    }
    const meta = data.newsCategories?.[0];

    return {
      title: metadata?.Title,
      description: metadata?.Description,
      keywords: metadata?.KeyWords,
      authors: author ? [{ name: author.Name }] : undefined,
      other: {
        "article:published_time": convertUTCtoIST(meta?.["createdAt"]) || "",
        "article:modified_time": convertUTCtoIST(meta?.["updatedAt"]) || "",
        "og:updated_time": convertUTCtoIST(meta?.["updatedAt"]) || "",
      },
      openGraph: {
        title: metadata?.Title,
        description: metadata?.Description,
        // images: metadata?.Og_Image ? [metadata.Og_Image.url] : undefined,
      },
    };
  } catch (e) {
    console.log(e);

    return {};
  }
};
