// "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Quotations", href: "/dashboard/quotations", icon: "📄" },
  ];

  if (session?.user?.role === "Admin") {
    navLinks.push({ name: "Users", href: "/dashboard/users", icon: "👥" });
  }

  return (
    <aside className="w-64 bg-white shadow-xl h-full flex flex-col justify-between border-r border-gray-100">
      <div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-red-600 tracking-tight">QuotFlow</h2>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-red-50 text-red-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex flex-col gap-1 mb-4 px-2 text-sm text-gray-500">
          <p className="font-semibold text-gray-700">{session?.user?.name}</p>
          <p>{session?.user?.role}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
