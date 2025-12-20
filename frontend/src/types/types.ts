export interface Devotion {
    id: number;
    content: string;
    scripture_ref?: string;
    mood?: string;
    created_at: string;
}

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    created_at?: string;
}
