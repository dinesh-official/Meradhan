/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EventDataFilterRoot {
  event_date?: EventDate;
  category?: Category;
  country?: Country;
  importance_rating?: ImportanceRating;
}

export interface EventDate {
  between: string[];
}

export interface Category {
  in: any[];
}

export interface Country {
  in: any[];
}

export interface ImportanceRating {
  in: any[];
}

export interface EconomicDataConnectionRoot {
  economicCalendars_connection: EconomicDataConnection;
}

export interface EconomicDataConnection {
  nodes: EconomicData[];
  pageInfo: PageInfo;
  __typename: string;
}

export interface EconomicData {
  documentId: string;
  event_time: string;
  event_name: string;
  country: string;
  category: string;
  importance_rating: string;
  actual_val: string;
  forecast_val: string;
  previous_val: string;
  author: Author;
  event_date: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  __typename: string;
}

export interface Author {
  Name: string;
  __typename: string;
}

export interface PageInfo {
  pageSize: number;
  pageCount: number;
  total: number;
  __typename: string;
}
