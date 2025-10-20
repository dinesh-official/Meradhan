import { ActivityTypes } from "./analytics";



export type ActivityType = (typeof ActivityTypes)[number];


export interface PageViewDetails {
  url: string;
  title: string;
  query?: string;
  referrer?: string;
  screen: { width: number; height: number };
  browser: string;
  os: string;
}

export interface ClickDetails {
  label?: string;
  id?: string;
  tag: string;
  text?: string;
}

export interface ScrollDepthDetails {
  percent: number;
}

export interface HeartbeatDetails {
  visible: DocumentVisibilityState;
}

export interface PageDurationDetails {
  duration: number; // in seconds
  url: string;
}

export interface CustomDetails {
  [key: string]: unknown;
}

export type ActivityDetails =
  | PageViewDetails
  | ClickDetails
  | ScrollDepthDetails
  | HeartbeatDetails
  | PageDurationDetails
  | CustomDetails;

export interface Activity {
  type: ActivityType;
  details: ActivityDetails;
  time: string;
}
