/* eslint-disable @typescript-eslint/no-explicit-any */
import { gql } from "@apollo/client";
import { EconomicDataConnectionRoot, EventDataFilterRoot } from "./data";
import { gqlClient } from "@/core/connection/apollo-client";

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body);
  return new Response(JSON.stringify(await getEconomicData({ filter: body })), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
const queryGql = gql`
  query Nodes(
    $pagination: PaginationArg
    $sort: [String]
    $filters: EconomicCalendarFiltersInput
  ) {
    economicCalendars_connection(
      pagination: $pagination
      sort: $sort
      filters: $filters
    ) {
      nodes {
        documentId
        event_time
        event_name
        country
        category
        importance_rating
        actual_val
        forecast_val
        previous_val
        event_date
        createdAt
        updatedAt
        publishedAt
      }
      pageInfo {
        pageSize
        pageCount
        total
      }
    }
  }
`;

const getEconomicData = async ({
  filter,
}: {
  filter?: EventDataFilterRoot;
}) => {
  console.log({
    filters: filter,
    pagination: {
      pageSize: 1000000000,
    },
    sort: ["event_date:asc"],
  });

  const { data } = await gqlClient.query<EconomicDataConnectionRoot>({
    query: queryGql,
    variables: {
      filters: filter,
      pagination: {
        pageSize: 1000000000,
      },
      sort: ["event_date:asc", "event_time:asc"],
    },
  });

  data?.economicCalendars_connection?.nodes?.forEach((item: any) => {
    try {
      const [hours, minutes] = item.event_time.split(":");
      item.event_time = `${hours}:${minutes}`;
    } catch (error) {
      console.log(error);
    }
  });

  return data || [];
};
