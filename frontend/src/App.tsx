import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import SelahLoader from "./components/ui/SelahLoader";
import { ReloadPrompt } from "./components/ReloadPrompt";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy Loaded Pages
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Devotions = lazy(() => import("./pages/Devotions"));
const DevotionDetail = lazy(() => import("./pages/DevotionDetail"));
const Plans = lazy(() => import("./pages/Plans"));
const PlanCreate = lazy(() => import("./pages/PlanCreate"));
const PlanDetail = lazy(() => import("./pages/PlanDetail"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicDevotionPage = lazy(() => import("./pages/PublicDevotionPage"));

function ProtectedLayout() {
    const { user } = useAuth();
    // If user is logged in, show the App Layout with the Sidebar
    return user ? <Layout /> : <Navigate to="/auth" replace />;
}

export default function App() {
    const { loading } = useAuth();

    if (loading) {
        return <SelahLoader />;
    }

    return (
        <BrowserRouter>
            <Toaster
                position="top-center"
                richColors
                closeButton
                toastOptions={{
                    style: {
                        fontFamily: "var(--font-serif)",
                    },
                }}
            />
            <ReloadPrompt />

            <Suspense fallback={<SelahLoader />}>
                <ErrorBoundary>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route
                            path="/share/:token"
                            element={<PublicDevotionPage />}
                        />

                        {/* Legacy Redirects */}
                        <Route
                            path="/login"
                            element={<Navigate to="/auth?mode=login" replace />}
                        />
                        <Route
                            path="/register"
                            element={
                                <Navigate to="/auth?mode=register" replace />
                            }
                        />

                        {/* Protected Routes */}
                        <Route element={<ProtectedLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/devotions" element={<Devotions />} />
                            <Route
                                path="/devotions/:id"
                                element={<DevotionDetail />}
                            />
                            <Route path="/plans" element={<Plans />} />
                            <Route
                                path="/plans/new"
                                element={<PlanCreate />}
                            />
                            <Route
                                path="/plans/:id"
                                element={<PlanDetail />}
                            />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Routes>
                </ErrorBoundary>
            </Suspense>
        </BrowserRouter>
    );
}
