export interface Devotion {
    id: string;
    content: string;
    scripture_ref?: string;
    mood?: string;
    created_at: string;
    is_encrypted?: boolean;
    is_shared?: boolean;
    share_token?: string | null;
    shared_at?: string | null;
}

export interface SharedDevotion {
    id: string;
    encrypted_shared_content: string;
    scripture_ref?: string | null;
    mood?: string | null;
    created_at: string;
    shared_at: string;
    author: {
        full_name: string;
    };
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
