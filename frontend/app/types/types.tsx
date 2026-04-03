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

export interface Content {
    id: number;
    title: string;
    body: string;
    contentType: string;
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