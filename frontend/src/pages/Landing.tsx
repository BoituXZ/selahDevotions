import { useNavigate, Navigate } from "react-router-dom";
import { BookHeart, Shield, Sunrise } from "lucide-react";
import { useAuth } from "../AuthProvider";

export default function Landing() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    // If user is already authenticated, redirect to dashboard
    if (loading) return null;
    if (user) return <Navigate to="/dashboard" replace />;

    const handleBeginJourney = () => {
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    {/* Logo */}
                    <h1 className="text-6xl md:text-7xl font-serif text-stone-800 tracking-tight animate-fade-in">
                        Selah.
                    </h1>

                    {/* Main Heading */}
                    <h2 className="text-4xl md:text-5xl font-serif text-stone-800 leading-tight">
                        Find Peace in His Word
                    </h2>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        A sacred space for your spiritual journey. Track your
                        devotions, reflect on scripture, and find comfort in
                        Biblical wisdom.
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={handleBeginJourney}
                        className="bg-stone-900 text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-stone-800 transition shadow-xl hover:shadow-2xl hover:-translate-y-1 duration-200"
                    >
                        Begin Journey
                    </button>
                </div>
            </section>

            {/* Value Proposition Cards */}
            <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1: Biblical Wisdom */}
                        <div className="bg-white rounded-xl shadow-lg p-8 hover:scale-105 transition duration-200 border border-emerald-100">
                            <div className="bg-emerald-900/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                <BookHeart
                                    size={32}
                                    className="text-emerald-800"
                                />
                            </div>
                            <h3 className="text-2xl font-serif text-stone-800 mb-4">
                                Biblical Wisdom
                            </h3>
                            <p className="text-stone-600 leading-relaxed">
                                AI-guided insights rooted in scripture, helping
                                you process life through a Biblical lens with
                                pastoral care.
                            </p>
                        </div>

                        {/* Card 2: Safe Space */}
                        <div className="bg-white rounded-xl shadow-lg p-8 hover:scale-105 transition duration-200 border border-amber-100">
                            <div className="bg-amber-900/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                <Shield
                                    size={32}
                                    className="text-amber-800"
                                />
                            </div>
                            <h3 className="text-2xl font-serif text-stone-800 mb-4">
                                Safe Space
                            </h3>
                            <p className="text-stone-600 leading-relaxed">
                                Your private sanctuary for reflection. Secure,
                                personal, and designed for intimate communion
                                with God.
                            </p>
                        </div>

                        {/* Card 3: Daily Bread */}
                        <div className="bg-white rounded-xl shadow-lg p-8 hover:scale-105 transition duration-200 border border-orange-100">
                            <div className="bg-orange-900/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                <Sunrise
                                    size={32}
                                    className="text-orange-800"
                                />
                            </div>
                            <h3 className="text-2xl font-serif text-stone-800 mb-4">
                                Daily Bread
                            </h3>
                            <p className="text-stone-600 leading-relaxed">
                                Build a consistent devotional practice with
                                streak tracking and daily spiritual nourishment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-16 px-4 text-center">
                <p className="text-stone-600 mb-6">
                    Ready to deepen your walk?
                </p>
                <button
                    onClick={handleBeginJourney}
                    className="bg-stone-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-stone-800 transition shadow-lg"
                >
                    Get Started
                </button>
            </section>
        </div>
    );
}
