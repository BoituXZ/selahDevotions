import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { supabase } from "../auth/supabase";
import { useAuth } from "../AuthProvider";
import { toast } from "sonner";
import VerificationPending from "../components/VerificationPending";
import { validatePassword } from "../lib/validation";

export default function Auth() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, loading: authLoading } = useAuth();

    const [mode, setMode] = useState<"login" | "register">(
        searchParams.get("mode") === "register" ? "register" : "login"
    );
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showVerificationPending, setShowVerificationPending] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    // If user is already authenticated, redirect to dashboard
    if (authLoading) return null;
    if (user) return <Navigate to="/dashboard" replace />;

    const switchMode = (newMode: "login" | "register") => {
        setMode(newMode);
        navigate(`/auth?mode=${newMode}`, { replace: true });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Welcome back!");
            navigate("/dashboard", { replace: true });
        }
        setLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !name || !confirmPassword) return;

        // Password confirmation check
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        // Enhanced password validation
        const validation = validatePassword(password);
        if (!validation.isValid) {
            // Show all validation errors
            validation.errors.forEach(error => toast.error(error));
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            // Show verification UI instead of switching to login tab
            setRegisteredEmail(email);
            setShowVerificationPending(true);
            toast.success("Account created! Please check your email.");
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (resendCooldown > 0) {
            toast.error(`Please wait ${resendCooldown} seconds before resending`);
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: registeredEmail,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Verification email sent! Check your inbox.");

            // Start 60-second cooldown
            setResendCooldown(60);
            const interval = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        setLoading(false);
    };

    const handleSubmit = mode === "login" ? handleLogin : handleRegister;

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center p-4">
            {showVerificationPending ? (
                <VerificationPending
                    email={registeredEmail}
                    onBackToLogin={() => {
                        setShowVerificationPending(false);
                        setMode("login");
                        // Clear form
                        setName("");
                        setEmail("");
                        setPassword("");
                        setConfirmPassword("");
                    }}
                    onResend={handleResendVerification}
                    resendCooldown={resendCooldown}
                    loading={loading}
                />
            ) : (
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 border border-stone-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif text-stone-800 mb-2">
                        Selah.
                    </h1>
                    <p className="text-stone-600">
                        {mode === "login"
                            ? "Welcome back to your sanctuary."
                            : "Begin your journey of reflection."}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6 bg-stone-100 p-1 rounded-lg">
                    <button
                        onClick={() => switchMode("login")}
                        className={`flex-1 py-2 rounded-md font-medium transition ${
                            mode === "login"
                                ? "bg-stone-900 text-white"
                                : "text-stone-600 hover:bg-stone-200"
                        }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => switchMode("register")}
                        className={`flex-1 py-2 rounded-md font-medium transition ${
                            mode === "register"
                                ? "bg-stone-900 text-white"
                                : "text-stone-600 hover:bg-stone-200"
                        }`}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input (Register Only) */}
                    {mode === "register" && (
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-stone-700 mb-2"
                            >
                                Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                    <User size={18} />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
                                    placeholder="Your Name"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Input */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-stone-700 mb-2"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                <Mail size={18} />
                            </div>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
                                placeholder="your@email.com"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-stone-700 mb-2"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                <Lock size={18} />
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>
                        {mode === "register" && (
                            <p className="text-xs text-stone-500 mt-1">
                                Minimum 8 characters, 1 uppercase letter, 1 special character
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Input (Register Only) */}
                    {mode === "register" && (
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-stone-700 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !email ||
                            !password ||
                            (mode === "register" && (!name || !confirmPassword))
                        }
                        className="w-full bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-stone-900"
                    >
                        {loading
                            ? "..."
                            : mode === "login"
                            ? "Enter Sanctuary"
                            : "Begin Journey"}
                    </button>
                </form>
            </div>
            )}
        </div>
    );
}
