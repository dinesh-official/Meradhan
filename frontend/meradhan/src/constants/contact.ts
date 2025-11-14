import type {
    AddressInfo,
    RegulatoryInfoItem,
    SectionContent,
    SocialMediaItem
} from "@/types/contact";
import { FaInstagramSquare } from "react-icons/fa";
import {
    FaFacebook,
    FaLinkedin,
    FaPhone,
    FaPinterest,
    FaXTwitter,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

export const CONTACT_INFO = {
    phone: {
        icon: FaPhone,
        label: "Phone",
        value: "+91 9873373195",
        href: "tel:+91 9873373195",
    },
    email: {
        icon: MdEmail,
        label: "Email",
        value: "support@meradhan.co",
        href: "mailto:support@meradhan.co",
    },
    grievances: {
        icon: MdEmail,
        label: "Email",
        value: "compliance@meradhan.co",
        href: "mailto:compliance@meradhan.co",
    },
    phone2: {
        icon: FaPhone,
        label: "Phone",
        value: "+91 22-69826918 (9am - 6pm)",
        href: "tel:+91 22-69826918",
    },
} as const;

export const ADDRESSES: Record<string, AddressInfo> = {
    registered: {
        title: "Registered Address",
        address: "2703, Ashok Tower 'D', Dr. SSR Marg, Parel, Mumbai- 400012, Maharashtra",
    },
    communication: {
        title: "Communication Address",
        address: "TBQ, Suite No 511, 5th floor, Tower 2A, North Annex, One World Centre, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013 (India)",
    },
} as const;

export const REGULATORY_INFO: readonly RegulatoryInfoItem[] = [
    {
        label: "SEBI Registration No.:",
        value: "INZ00033023",
        description: "Stock Broker",
    },
    {
        label: "BSE Member ID:",
        value: "6963",
        description: "Debt Segment",
    },
    {
        label: "NSE Member ID:",
        value: "90480",
        description: "Debt Segment",
    },
    {
        label: "CIN:",
        value: "U66190MH2025PTC441753",
        description: null,
    },
] as const;

export const SOCIAL_MEDIA_LINKS: readonly SocialMediaItem[] = [
    {
        name: "Facebook",
        href: "https://www.facebook.com/MeraDhanCo/",
        icon: FaFacebook,
        ariaLabel: "Facebook",
    },
    {
        name: "Instagram",
        href: "https://www.instagram.com/meradhan/",
        icon: FaInstagramSquare,
        ariaLabel: "Instagram",
    },
    {
        name: "Pinterest",
        href: "https://in.pinterest.com/meradhanco/",
        icon: FaPinterest,
        ariaLabel: "Pinterest",
    },
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/company/meradhan/",
        icon: FaLinkedin,
        ariaLabel: "LinkedIn",
    },
    {
        name: "Twitter",
        href: "https://x.com/MeraDhanCo",
        icon: FaXTwitter,
        ariaLabel: "Twitter (X)",
    },
] as const;

export const SECTION_CONTENT: Record<string, SectionContent> = {
    hero: {
        title: "Contact Us",
        description: "Connect with our team for quick, expert support.",
    },
    help: {
        title: "Need Help?",
        description: "Connect with our team for quick, expert support.",
    },
} as const;