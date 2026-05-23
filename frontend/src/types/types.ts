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

export interface Plan {
    id: string;
    user_id: string;
    title: string;
    initial_sentiment: string | null;
    intention: string | null;
    closing_sentiment: string | null;
    duration: number;
    created_at: string;
    is_complete: boolean;
    current_day: number | null;
    days_completed?: number;
    timelines?: PlanTimeline[];
}
