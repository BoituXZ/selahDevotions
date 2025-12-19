import { supabase } from "./auth/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// A generic wrapper for fetch
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    // 1. Get the current session token
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        throw new Error("Not authenticated");
    }

    // 2. Add headers
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
    };

    // 3. Fire request
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // 4. Handle errors
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Something went wrong");
    }

    return response.json();
}

// The clean interface you will use in your components
export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
    post: <T>(endpoint: string, body: any) =>
        request<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        }),
};
