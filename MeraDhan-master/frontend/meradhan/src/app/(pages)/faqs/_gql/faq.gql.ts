import { gqlClient } from "@/core/connection/apollo-client"
import { gql } from "@apollo/client"

export const faqGql = `
query FaqS_connection($pagination: PaginationArg) {
  faqS_connection(pagination: $pagination) {
    nodes {
      documentId
      Question
      Answer
      createdAt
      updatedAt
      publishedAt
    }
    pageInfo {
      total
    }
  }
}
`

export type T_FAQ_GQL_RESPONSE = {
    faqS_connection: {
        nodes: Array<FAQ_NODE>
        pageInfo: {
            total: number
        }
    }
}

export type FAQ_NODE = {
    documentId: string
    Question: string
    Answer: string
    createdAt: string
    updatedAt: string
    publishedAt: string
}


export const fetchFaqData = async () => {
    const { data } = await gqlClient.query<T_FAQ_GQL_RESPONSE>({
        query: gql(faqGql),
        variables: {
            "pagination": {
                "pageSize": 1000
            }
        }
    });
    return data
}