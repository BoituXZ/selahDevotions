import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, BookHeart, MessageCircle, User } from "lucide-react";

export default function Layout() {
    const navItems = [
        { name: "Dashboard", path: "/", icon: LayoutDashboard },
        { name: "Devotions", path: "/devotions", icon: BookHeart },
        { name: "Chat", path: "/chat", icon: MessageCircle },
        { name: "Profile", path: "/profile", icon: User },
    ];

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 h-screen sticky top-0">
                <div className="p-8">
                    <h1 className="text-3xl font-serif text-stone-900 tracking-tight">
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
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-8 text-xs text-stone-400">v1.0.0 Alpha</div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] md:h-screen">
                <Outlet />
            </main>

            {/* --- MOBILE BOTTOM NAV --- */}
            {/* --- MOBILE BOTTOM NAV --- */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-stone-200 flex justify-around p-4 pb-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex flex-col items-center gap-1 transition-colors
              ${isActive ? "text-stone-900" : "text-stone-400"}
            `}
                    >
                        {/* Use a function here to access 'isActive' for the Icon properties
                         */}
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className="text-[10px] font-medium">
                                    {item.name}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
