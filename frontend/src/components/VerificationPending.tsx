import { Mail } from "lucide-react";
import SelahLogo from "./SelahLogo";

interface VerificationPendingProps {
    email: string;
    onBackToLogin: () => void;
}

export default function VerificationPending({
    email,
    onBackToLogin,
}: VerificationPendingProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 border border-stone-100 animate-[fadeInUp_0.5s_ease-out]">
                {/* Logo */}
                <div className="mb-6">
                    <SelahLogo size="lg" animated />
                </div>

                {/* Mail Icon (floating animation) */}
                <div className="flex justify-center mb-6">
                    <Mail
                        className="w-16 h-16 text-amber-600/70 animate-[float_3s_ease-in-out_infinite]"
                        strokeWidth={1.5}
                    />
                </div>

                {/* Heading */}
                <h2 className="text-3xl font-serif text-stone-800 mb-4 text-center">
                    Check Your Email
                </h2>

                {/* Body Text */}
                <p className="text-stone-600 leading-relaxed mb-4 text-center">
                    We've sent a verification email to:
                </p>

                {/* Email Display */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-lg px-4 py-3 mb-6">
                    <p className="text-stone-900 font-medium text-center break-all">
                        {email}
                    </p>
                </div>

                {/* Instructions */}
                <p className="text-stone-600 leading-relaxed mb-6 text-center">
                    Please click the link in your email to verify your account
                    and begin your journey.
                </p>

                {/* Back to Login Button */}
                <button
                    onClick={onBackToLogin}
                    className="w-full bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 transition shadow-lg"
                >
                    Back to Login
                </button>

                {/* Helper text */}
                <p className="text-sm text-stone-500 text-center mt-4">
                    Didn't receive it? Check your spam folder.
                </p>
            </div>
        </div>
    );
}
