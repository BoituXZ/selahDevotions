import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import HeroSection from "../components/sections/HeroSection";
import FeatureSection from "../components/sections/FeatureSection";
import FooterCTA from "../components/sections/FooterCTA";

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
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <HeroSection onCTAClick={handleBeginJourney} />

            {/* Biblical Wisdom - Content Left */}
            <FeatureSection
                id="biblical-wisdom"
                title="Biblical Wisdom"
                description="AI-guided insights rooted in scripture, helping you process life through a Biblical lens with pastoral care."
                iconColor="emerald"
                backgroundImage="/images/biblical-wisdom-scrolls.jpg"
                layout="content-left"
            />

            {/* Safe Space - Content Right (Alternating) */}
            <FeatureSection
                id="safe-space"
                title="Safe Space"
                description="Your private sanctuary for reflection. Secure, personal, and designed for intimate communion with God."
                iconColor="amber"
                backgroundImage="/images/safe-space-light.jpg"
                layout="content-right"
            />

            {/* Daily Bread - Content Left */}
            <FeatureSection
                id="daily-bread"
                title="Daily Bread"
                description="Build a consistent devotional practice with streak tracking and daily spiritual nourishment."
                iconColor="orange"
                backgroundImage="/images/daily-bread-hands.jpg"
                layout="content-left"
            />

            {/* Footer CTA */}
            <FooterCTA onCTAClick={handleBeginJourney} />
        </div>
    );
}
