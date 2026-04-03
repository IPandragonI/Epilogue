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

export interface StatCard {
    label: string;
    value: string;
    icon: React.ReactNode;
}