import { Outlet, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    BookHeart,
    MessageCircle,
    User,
    Hamburger,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Layout() {
    const [isMobileNavExpanded, setIsMobileNavExpanded] = useState(true);
    const timeoutRef = useRef<number | null>(null);

    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Devotions", path: "/devotions", icon: BookHeart },
        { name: "Chat", path: "/chat", icon: MessageCircle },
        { name: "Profile", path: "/profile", icon: User },
    ];

    // Reset the inactivity timer for mobile nav
    const resetMobileTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsMobileNavExpanded(true);
        timeoutRef.current = setTimeout(() => {
            setIsMobileNavExpanded(false);
        }, 5000); // 5 seconds of inactivity
    };

    // Initialize timer on mount
    useEffect(() => {
        resetMobileTimer();
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const toggleMobileNav = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsMobileNavExpanded(!isMobileNavExpanded);
        if (!isMobileNavExpanded) {
            // If expanding, start the timer
            timeoutRef.current = setTimeout(() => {
                setIsMobileNavExpanded(false);
            }, 5000);
        }
    };

    const handleMobileNavInteraction = () => {
        resetMobileTimer();
    };

    return (
        <div className="h-screen w-full bg-stone-50 flex flex-col md:flex-row overflow-hidden">
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 h-full">
                <div className="p-8">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
                        Selah.
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                    isActive
                        ? "bg-stone-900 text-white shadow-md"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }
              `}
                        >
                            <item.icon size={20} strokeWidth={1.5} />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            {/* We make this flex-1 and overflow-hidden so the children pages can decide how to scroll */}
            <main className="flex-1 relative flex flex-col overflow-hidden">
                <Outlet />
            </main>

            {/* --- MOBILE BOTTOM NAV --- */}
            {isMobileNavExpanded ? (
                <nav
                    className="md:hidden fixed bottom-4 left-4 right-4 bg-[#1c1917]/90 backdrop-blur-md border border-stone-800 p-2 rounded-2xl flex justify-around z-50 shadow-2xl shadow-stone-900/30 transition-all duration-300"
                    onClick={handleMobileNavInteraction}
                    onTouchStart={handleMobileNavInteraction}
                >
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
              flex flex-col items-center gap-1 transition-colors p-2 rounded-xl
              ${isActive ? "text-white bg-white/10" : "text-stone-400"}
            `}
                        >
                            {/* Use a function here to access 'isActive' for the Icon properties
                             */}
                            {({ isActive }) => (
                                <>
                                    <item.icon size={22} strokeWidth={1.5} />
                                    {isActive && (
                                        <span className="text-[10px] font-medium font-serif">
                                            {item.name}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            ) : (
                <button
                    onClick={toggleMobileNav}
                    className="md:hidden fixed bottom-4 right-4 w-14 h-14 bg-[#1c1917]/90 backdrop-blur-md border border-stone-800 rounded-full flex items-center justify-center z-50 shadow-2xl shadow-stone-900/30 transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Open navigation"
                >
                    <Hamburger
                        size={24}
                        strokeWidth={1.5}
                        className="text-white"
                    />
                </button>
            )}
        </div>
    );
}
