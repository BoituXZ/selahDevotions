export interface Devotion {
    id: string;
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
