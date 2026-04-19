import {Globe} from "lucide-react";

export const Status = {
    PUBLISHED: "Publié",
    WAITING_PUBLISH: "En attente de publication",
    DRAFT: "Brouillon",
} as const;

export type StatusType = (typeof Status)[keyof typeof Status];

export const NotionSyncStatus = {
    SYNCED: "Synchronisé avec Notion",
    SYNCING: "En cours de synchronisation",
    ERROR: "Erreur de synchronisation",
} as const;

export type NotionSyncStatusType = (typeof NotionSyncStatus)[keyof typeof NotionSyncStatus];

export const Platform = {
    BLOG: "Blog",
    LINKEDIN: "LinkedIn",
    TWITTER: "Twitter",
    INSTAGRAM: "Instagram",
} as const;

export type PlatformType = (typeof Platform)[keyof typeof Platform];

export const PlatformConfig: Record<PlatformType, { label: string; subLabel: string; maxLength: number; icon: React.ReactNode; color: string; bg: string }> = {
    [Platform.LINKEDIN]: {
        label: "LinkedIn",
        subLabel: "Post Pro & Carousel",
        maxLength: 3000,
        icon: <Globe size={14}/>,
        color: "text-blue-700",
        bg: "bg-blue-100",
    },
    [Platform.INSTAGRAM]: {
        label: "Instagram",
        subLabel: "Post & Story",
        maxLength: 2200,
        icon: <Globe size={14}/>,
        color: "text-purple-700",
        bg: "bg-purple-100",
    },
    [Platform.BLOG]: {
        label: "Blog",
        subLabel: "Article de blog",
        maxLength: 5000,
        icon: <Globe size={14}/>,
        color: "text-yellow-700",
        bg: "bg-yellow-100",
    },
    [Platform.TWITTER]: {
        label: "Twitter",
        subLabel: "Tweet & Thread",
        maxLength: 280,
        icon: <Globe size={14}/>,
        color: "text-cyan-700",
        bg: "bg-cyan-100",
    },
};

export interface Content {
    id: number;
    title: string;
    body?: string;
    platform?: PlatformType;
    date: string;
    seo?: ContentSeo;
    status: StatusType;
    notion?: ContentNotion;
}

export interface ContentSeo {
    score: number;
    review?: string;
    keywords?: string[];
}

export interface ContentNotion {
    notionSyncStatus: NotionSyncStatusType;
    notionPageId?: string;
}

export interface ContentIdea {
    id: number;
    title: string;
    description: string;
    topic?: Topic;
    platform: PlatformType;
    createdAt: string;
    updatedAt?: string;
}

export interface Topic {
    id: number;
    name: string;
    description?: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StatCard {
    label: string;
    value: string;
    icon: React.ReactNode;
}

export interface CurationItems {
    id: number;
    title: string;
    lastFetchedAt: string;
    summary?: string;
    source?: CurationSource;
}

export interface CurationSource {
    id: number;
    name: string;
    sourceUrl: string;
    sourceType: string;
    lastFetchedAt: string;
    createdAt: string;
}

export interface User {
    id: string;
    lastname: string;
    firstname: string;
    email: string;
    password: string | null;
    role: UserRole;
    createdAt: string;
    cloudSpace?: CloudSpace;
}

export enum UserRole {
    ADMIN = "admin",
    PUBLIC = "public",
}

export interface CloudSpace {
    id: string;
    notion_token: string
}