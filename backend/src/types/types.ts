export interface Devotion {
    id: number;
    user_id: string;
    content: string;
    scripture_ref?: string;
    mood?: string;
    created_at: string;
}

export interface Streak {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_devotion_date: string;
}
