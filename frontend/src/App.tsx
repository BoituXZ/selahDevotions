import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthProvider";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout"; // <-- Import Layout

// Pages
import Dashboard from "./pages/Dashboard";
import Devotions from "./pages/Devotions";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";

function ProtectedLayout() {
    const { user, loading } = useAuth();
    if (loading)
        return (
            <div className="h-screen grid place-items-center">Loading...</div>
        );

    // If user is logged in, show the App Layout with the Sidebar
    return user ? <Layout /> : <Navigate to="/login" />;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<ProtectedLayout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/devotions" element={<Devotions />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
