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
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 px-4 border-b border-slate-800 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight">
            Debt Tracker
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
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
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 ${isActive ? "text-purple-400" : "group-hover:text-white"}`}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </Link>
          );
        })}

        <Link
          href="/debts/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mt-4 text-purple-300 hover:bg-slate-800 hover:text-white group"
        >
          <Plus size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Add debt</span>}
        </Link>
      </nav>

      {/* Sign out */}
      <div className="px-2 py-4 border-t border-slate-800">
        {!collapsed && session.user?.email && (
          <p className="text-xs text-slate-500 px-3 mb-3 truncate">
            {session.user.email}
          </p>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </div>
    </div>
  );
}
