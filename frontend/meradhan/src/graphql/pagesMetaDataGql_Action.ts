import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";
import { Metadata } from "next";

export type AppRoute =
    | "index"
    | "blog"
    | "news"
    | "bonds"
    | "faqs"
    | "login"
    | "signup"
    | "forgot-password"
    | "reset-password"
    | "contact-us"
    | "dhangpt";


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
  }
}
`


type PagesMetaDataResponse = {

    pagesMetaData: Array<{
        MetaData: {
            id: string
            Title: string
            Description: string
            Keywords: Array<{
                name: string
            }>
            Priority: number
            Author: {
                Name: string
            }
            Slug: string
            Og_Image: {
                url: string
            }
        }
    }>
}




export const generatePagesMetaData = async (slug: AppRoute): Promise<Metadata> => {

    try {
        const { data } = await gqlClient.query<PagesMetaDataResponse>({
            query: gql(pageMetaDataGql),
            variables: {
                "filters": {
                    "MetaData": {
                        "Slug": {
                            "eq": slug
                        }
                    }
                },
                "pagination": {
                    "limit": 1
                }
            }
        });

        const metadata = data?.pagesMetaData?.[0]?.MetaData;
        if (!data?.pagesMetaData?.[0]?.MetaData.Title) {
            return {};
        }
        // console.log(metadata);


        return {
            title: metadata?.Title,
            description: metadata?.Description,
            keywords: metadata?.Keywords?.map(k => k.name).join(", "),
            authors: metadata?.Author ? [{ name: metadata.Author.Name }] : undefined,
            openGraph: {
                title: metadata?.Title,
                description: metadata?.Description,
                // images: metadata?.Og_Image ? [metadata.Og_Image.url] : undefined,
            },
        }
    } catch {
        return {}
    }
}