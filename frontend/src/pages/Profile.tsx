import { supabase } from "../auth/supabase";
export default function Profile() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-serif mb-4">Profile</h1>
            <button
                onClick={() => supabase.auth.signOut()}
                className="text-red-600 underline"
            >
                Sign Out
            </button>
        </div>
    );
}
