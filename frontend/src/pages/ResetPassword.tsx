import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { supabase } from "../auth/supabase";
import { useAuth } from "../AuthProvider";
import { toast } from "sonner";
import { validatePassword } from "../lib/validation";

export default function ResetPassword() {
    const navigate = useNavigate();
    const { session: authSession } = useAuth();
    const [isReady, setIsReady] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let resolved = false;
        let invalidTimer: ReturnType<typeof setTimeout> | null = null;

        const resolve = () => {
            if (resolved) return;
            resolved = true;
            if (invalidTimer) clearTimeout(invalidTimer);
            setIsReady(true);
        };

        // Primary: catch the PASSWORD_RECOVERY event directly
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") resolve();
        });

        invalidTimer = setTimeout(() => {
            if (!resolved) setIsInvalid(true);
        }, 6000);

        return () => {
            if (invalidTimer) clearTimeout(invalidTimer);
            subscription.unsubscribe();
        };
    }, []);

    // Fallback: AuthProvider reliably captures PASSWORD_RECOVERY and updates its
    // session — watch it in case our own subscription missed the event
    useEffect(() => {
        if (authSession && !isReady && !isInvalid) {
            setIsReady(true);
        }
    }, [authSession, isReady, isInvalid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const validation = validatePassword(password);
        if (!validation.isValid) {
            validation.errors.forEach((err) => toast.error(err));
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success("Password updated!");
            navigate("/dashboard", { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl shadow-2xl p-8 border border-stone-100 dark:border-stone-800">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif text-stone-800 dark:text-stone-100 mb-2">
                        Selah.
                    </h1>
                    <p className="text-stone-600 dark:text-stone-400">
                        {isInvalid
                            ? "This link is no longer valid."
                            : isReady
                            ? "Choose a new password."
                            : "Verifying your reset link…"}
                    </p>
                </div>

                {!isReady && !isInvalid && (
                    <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-stone-300 dark:border-stone-600 border-t-stone-700 dark:border-t-stone-300 rounded-full animate-spin" />
                    </div>
                )}

                {isInvalid && (
                    <div className="text-center space-y-4">
                        <p className="text-stone-500 dark:text-stone-400 text-sm">
                            This reset link has expired or is invalid. Request a new one from the login page.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-block text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline transition"
                        >
                            Back to login
                        </Link>
                    </div>
                )}

                {isReady && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 dark:text-stone-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400 transition placeholder:text-stone-400 dark:placeholder:text-stone-500"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                Minimum 8 characters, 1 uppercase letter, 1 special character
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 dark:text-stone-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400 transition placeholder:text-stone-400 dark:placeholder:text-stone-500"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            className="w-full bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-3 rounded-lg font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "..." : "Update Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
