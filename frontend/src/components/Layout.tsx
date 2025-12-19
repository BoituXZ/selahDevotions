import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, BookHeart, MessageCircle, User } from "lucide-react";

export default function Layout() {
    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
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
            <nav className="md:hidden fixed bottom-0 w-90 bg-white/50 border border-white/50  m-2 p-2 rounded-4xl flex justify-around z-50  shadow-2xl shadow-black/40">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex flex-col items-center gap-1 transition-colors
              ${isActive ? "text-stone-900" : "text-stone-500"}
            `}
                    >
                        {/* Use a function here to access 'isActive' for the Icon properties
                         */}
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={22}
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
