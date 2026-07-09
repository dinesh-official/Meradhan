import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";
import { T_ISSHUER } from "./issuerNotesAction";

const isshueNotesWithListGql = `query IssuerNotes($pagination: PaginationArg, $filters: IssuerNotesListFiltersInput) {
  issuerNotes(pagination: $pagination, filters: $filters) {
    Issuer_Name
    documentId
    Logo {
      url
    }
    ISIN
    Views
    Slug
  }
}`;
export const fetchIssuerNotesWatchList = async (ids: string[]) => {
  console.log(ids);

  const { data } = await gqlClient.query<T_ISSHUER>({
    query: gql(isshueNotesWithListGql),
    variables: {
      pagination: { pageSize: 10000 },
      filters: {
        documentId: { in: ids },
      },
    },
  });
  console.log(data);

  const issuerNotes = data?.issuerNotes;
  if (!issuerNotes || issuerNotes.length === 0) {
    return [];
  }

  return issuerNotes;
};
