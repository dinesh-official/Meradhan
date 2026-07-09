import { IconType } from "react-icons";

export interface ContactInfoItem {
  icon: IconType;
  label: string;
  value: string;
  href?: string;
}

export interface AddressInfo {
  title: string;
  address: string;
}

export interface RegulatoryInfoItem {
  label: string;
  value: string;
  description: string | null;
}

export interface SocialMediaItem {
  name: string;
  href: string;
  icon: IconType;
  ariaLabel: string;
}

export interface SectionContent {
  title: string;
  description: string;
}