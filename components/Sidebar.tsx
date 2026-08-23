"use client";

import { useEffect } from "react";
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
  X,
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
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
};

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  // Close the drawer after navigating, so tapping a link doesn't leave it open.
  useEffect(() => {
    const close = () => setMobileOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router.events, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, setMobileOpen]);

  if (!session) return null;

  // `collapsed` is a desktop-only idea. Hiding labels with md:hidden keeps them
  // visible in the mobile drawer even when the desktop rail is collapsed.
  const hideWhenCollapsed = collapsed ? "md:hidden" : "";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-sage-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-mint-100 border-r border-mint-200 w-64 transition-transform duration-slow ease-out md:transition-all ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${collapsed ? "md:w-16" : "md:w-64"}`}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 px-4 border-b border-mint-200 justify-between ${
            collapsed ? "md:justify-center" : ""
          }`}
        >
          <span
            className={`text-sage-800 font-display font-bold text-lg tracking-tight flex items-center ${hideWhenCollapsed}`}
          >
            <img src="/mark.svg" alt="" className="h-7 w-7 mr-2" />
            Mirian
          </span>

          {/* Collapse is desktop-only; the drawer closes instead. */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:block text-sage-600 hover:text-sage-800 transition-colors p-1 rounded-lg hover:bg-mint-200"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="md:hidden text-sage-600 hover:text-sage-800 transition-colors p-2 -mr-2 rounded-lg hover:bg-mint-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              router.pathname === href || router.pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 min-h-[48px] rounded-xl transition-all group ${
                  collapsed ? "md:justify-center" : ""
                } ${
                  isActive
                    ? "bg-sage-600 text-white"
                    : "text-sage-700 hover:text-sage-900 hover:bg-mint-200"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span
                  className={`text-sm font-medium truncate ${hideWhenCollapsed}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          <Link
            href="/debts/new"
            className={`flex items-center gap-3 px-3 min-h-[48px] rounded-xl transition-all mt-4 text-sage-600 hover:bg-mint-200 hover:text-sage-800 group ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <Plus size={20} className="flex-shrink-0" />
            <span className={`text-sm font-medium ${hideWhenCollapsed}`}>
              Add debt
            </span>
          </Link>
        </nav>

        {/* Sign out */}
        <div className="px-2 py-4 border-t border-mint-200">
          {session.user?.email && (
            <p
              className={`text-xs text-sage-500 px-3 mb-3 truncate ${hideWhenCollapsed}`}
            >
              {session.user.email}
            </p>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className={`flex items-center gap-3 px-3 min-h-[48px] rounded-xl w-full text-sage-600 hover:text-sage-900 hover:bg-mint-200 transition-all ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`text-sm font-medium ${hideWhenCollapsed}`}>
              Sign out
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
