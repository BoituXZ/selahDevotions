import { Outlet, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    BookHeart,
    Scroll,
    MessageCircle,
    User,
} from "lucide-react";

const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Devotions", path: "/devotions", icon: BookHeart },
    { name: "Plans", path: "/plans", icon: Scroll },
    { name: "Chat", path: "/chat", icon: MessageCircle },
    { name: "Profile", path: "/profile", icon: User },
] as const;

export default function Layout() {
    return (
        <div className="h-screen w-full bg-stone-50 dark:bg-stone-950 flex flex-col md:flex-row overflow-hidden">
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 h-full">
                <div className="p-8">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                        Selah.
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200
                ${
                    isActive
                        ? "bg-[#3B4737] dark:bg-[#E6E0D4] text-white dark:text-[#3B4737] shadow-md"
                        : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
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
            <main className="flex-1 relative flex flex-col overflow-hidden">
                <Outlet />
            </main>

            {/* --- MOBILE BOTTOM NAV --- */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 flex justify-around items-center pt-3 pb-safe shadow-[0_-1px_12px_0_rgba(0,0,0,0.06)] dark:shadow-[0_-1px_12px_0_rgba(0,0,0,0.3)]"
                aria-label="Main navigation"
            >
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="flex-1"
                    >
                        {({ isActive }) => (
                            <div
                                className={`flex flex-col items-center gap-1.5 min-h-11 justify-center transition-colors duration-200 ${
                                    isActive
                                        ? "text-stone-900 dark:text-stone-50"
                                        : "text-stone-400 dark:text-stone-500"
                                }`}
                            >
                                {/* Icon with glow when active */}
                                <item.icon
                                    size={20}
                                    strokeWidth={isActive ? 2 : 1.5}
                                    className={`transition-all duration-300 ${
                                        isActive
                                            ? "dark:filter-[drop-shadow(0_0_6px_currentColor)]"
                                            : ""
                                    }`}
                                />
                                {/* Always-visible label */}
                                <span
                                    className={`text-[11px] tracking-wide leading-none ${
                                        isActive
                                            ? "font-semibold"
                                            : "font-medium"
                                    }`}
                                >
                                    {item.name}
                                </span>
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
