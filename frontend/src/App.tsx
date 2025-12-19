import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthProvider";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Loading from "./components/Loading";

// Public Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import Devotions from "./pages/Devotions";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import DevotionDetail from "./pages/DevotionDetail";

function ProtectedLayout() {
    const { user, loading } = useAuth();
    if (loading) return <Loading />;

    // If user is logged in, show the App Layout with the Sidebar
    return user ? <Layout /> : <Navigate to="/auth" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
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

                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />

                    {/* Legacy Redirects */}
                    <Route
                        path="/login"
                        element={<Navigate to="/auth?mode=login" replace />}
                    />
                    <Route
                        path="/register"
                        element={<Navigate to="/auth?mode=register" replace />}
                    />

                    {/* Protected Routes */}
                    <Route element={<ProtectedLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/devotions" element={<Devotions />} />
                        <Route
                            path="/devotions/:id"
                            element={<DevotionDetail />}
                        />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
