export interface Devotion {
    id: string;
    user_id: string;
    content: string;
    encrypted_content?: string;
    is_encrypted: boolean;
    encryption_version?: number;
    scripture_ref?: string;
    mood?: string;
    created_at: string;
    share_token?: string | null;
    encrypted_shared_content?: string | null;
    is_shared?: boolean;
    shared_at?: string | null;
}

export interface UserEncryptionKey {
    user_id: string;
    encrypted_key: string;
    key_version: number;
    created_at: string;
    updated_at: string;
}

export interface UserPreferences {
    user_id: string;
    has_seen_encryption_notice: boolean;
    created_at: string;
    updated_at: string;
}

export interface Streak {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_devotion_date: string;
}

export interface Plan {
    id: string;
    user_id: string;
    title: string;
    initial_sentiment: string | null;
    intention: string | null;
    closing_sentiment: string | null;
    duration: number;
    created_at: string;
}

export interface PlanTimeline {
    id: string;
    plan_id: string;
    day_number: number;
    bible_verse: string | null;
    verse_content: string | null;
    encouragement_from_verse: string | null;
    read: boolean;
    devotion_id: string | null;
    created_at: string;
    modified_at: string;
}
