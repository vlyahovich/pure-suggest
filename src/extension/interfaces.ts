export interface Dict {
    [propName: string] : any;
}

export interface SuggestItem {
    id: string;
    image?: string;
    title: string;
    subtitle?: string;
    selected?: boolean;
}