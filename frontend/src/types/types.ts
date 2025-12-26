export interface Devotion {
    id: string;
    content: string;
    scripture_ref?: string;
    mood?: string;
    created_at: string;
    is_encrypted?: boolean;
}

export interface UserPreferences {
    user_id: string;
    has_seen_encryption_notice: boolean;
    theme_preference?: "light" | "dark" | "system";
    created_at?: string;
    updated_at?: string;
}

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    created_at?: string;
}
