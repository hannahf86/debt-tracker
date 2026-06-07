"use client";

import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarRange,
  CreditCard,
  Settings,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import logo from "../logo.svg";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: CalendarRange },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

type Props = {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
};

export default function Sidebar({ collapsed, setCollapsed }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-mint-100 border-r border-mint-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 px-4 border-b border-mint-200 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <span className="text-sage-800 font-bold text-lg tracking-tight">
            <img
              src={logo.src}
              alt="Logo"
              className="h-6 w-auto inline-block mr-2"
            />
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-sage-600 hover:text-sage-800 transition-colors p-1 rounded-lg hover:bg-mint-200"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-6 px-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            router.pathname === href || router.pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                isActive
                  ? "bg-sage-600 text-white"
                  : "text-sage-700 hover:text-sage-900 hover:bg-mint-200"
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </Link>
          );
        })}

        <Link
          href="/debts/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mt-4 text-sage-600 hover:bg-mint-200 hover:text-sage-800 group"
        >
          <Plus size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Add debt</span>}
        </Link>
      </nav>

      {/* Sign out */}
      <div className="px-2 py-4 border-t border-mint-200">
        {!collapsed && session.user?.email && (
          <p className="text-xs text-sage-500 px-3 mb-3 truncate">
            {session.user.email}
          </p>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sage-600 hover:text-sage-900 hover:bg-mint-200 transition-all"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </div>
    </div>
  );
}
