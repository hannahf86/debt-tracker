"use client";

import { useEffect, useRef } from "react";
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const isActive = (href: string) =>
    router.pathname === href || router.pathname.startsWith(href + "/");

  // Close after navigating, so picking a destination doesn't leave it open.
  useEffect(() => {
    const close = () => setMobileOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router.events, setMobileOpen]);

  /**
   * Full-screen nav is a modal dialog, so it owes the usual duties: keep focus
   * inside it, stop the page behind from scrolling, close on Escape, and hand
   * focus back to whatever opened it.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.querySelector<HTMLElement>("[data-first-focus]")?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      // A programmatic open may leave activeElement on <body>, so fall back to
      // the control that opens the menu rather than dropping focus entirely.
      const target =
        restoreFocusTo.current && restoreFocusTo.current !== document.body
          ? restoreFocusTo.current
          : document.querySelector<HTMLElement>('button[aria-label="Open menu"]');
      target?.focus();
    };
  }, [mobileOpen, setMobileOpen]);

  if (!session) return null;

  const hideWhenCollapsed = collapsed ? "md:hidden" : "";

  return (
    <>
      {/* ---------------- Desktop rail ---------------- */}
      <div
        className={`hidden md:flex fixed top-0 left-0 h-screen z-40 flex-col bg-mint-100 border-r border-mint-200 transition-all duration-slow ease-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div
          className={`flex items-center h-16 px-4 border-b border-mint-200 justify-between ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span
            className={`text-sage-800 font-display font-bold text-lg tracking-tight flex items-center ${hideWhenCollapsed}`}
          >
            <img src="/mark.svg" alt="" className="h-7 w-7 mr-2" />
            Mirian
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-sage-600 hover:text-sage-800 transition-colors p-1 rounded-lg hover:bg-mint-200"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex items-center gap-3 px-3 min-h-[48px] rounded-xl transition-all ${
                collapsed ? "justify-center" : ""
              } ${
                isActive(href)
                  ? "bg-sage-600 text-white"
                  : "text-sage-700 hover:text-sage-900 hover:bg-mint-200"
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className={`text-sm font-medium truncate ${hideWhenCollapsed}`}>
                {label}
              </span>
            </Link>
          ))}

          <div className="h-px bg-mint-100 my-2.5 mx-1" />

          <Link
            href="/debts/new"
            className={`flex items-center gap-3 px-3 min-h-[48px] rounded-xl transition-all text-sage-600 hover:bg-mint-200 hover:text-sage-800 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Plus size={20} className="flex-shrink-0" />
            <span className={`text-sm font-medium ${hideWhenCollapsed}`}>
              Add debt
            </span>
          </Link>
        </nav>

        <div className="px-2 py-4 border-t border-mint-200">
          {session.user?.email && (
            <p className={`text-xs text-sage-500 px-3 mb-3 truncate ${hideWhenCollapsed}`}>
              {session.user.email}
            </p>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className={`flex items-center gap-3 px-3 min-h-[48px] rounded-xl w-full text-sage-600 hover:text-sage-900 hover:bg-mint-200 transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`text-sm font-medium ${hideWhenCollapsed}`}>
              Sign out
            </span>
          </button>
        </div>
      </div>

      {/* ---------------- Mobile: full-screen nav ---------------- */}
      {mobileOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          /* dvh, not vh — vh ignores the browser chrome on mobile and pushes
             the footer below the fold. */
          className="md:hidden fixed inset-0 z-50 h-[100dvh] w-screen flex flex-col bg-white"
        >
          <div className="flex items-center justify-between h-[4.5rem] pl-4 pr-2.5 border-b border-mint-200 shrink-0">
            <span className="flex items-center text-sage-800 font-display font-bold text-xl tracking-tight">
              <img src="/mark.svg" alt="" className="h-8 w-8 mr-2.5" />
              Mirian
            </span>
            <button
              data-first-focus
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex items-center justify-center w-12 h-12 rounded-xl text-sage-700 hover:bg-mint-100 active:bg-mint-200 transition-colors duration-base"
            >
              <X size={26} />
            </button>
          </div>

          <nav
            aria-label="Main"
            className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1.5"
          >
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center gap-4 px-4 min-h-[4rem] rounded-xl text-lg font-semibold transition-colors duration-base ${
                  isActive(href)
                    ? "bg-sage-600 text-white"
                    : "text-sage-800 hover:bg-mint-100 active:bg-mint-200"
                }`}
              >
                <Icon size={26} className="shrink-0" />
                {label}
              </Link>
            ))}

            <div className="h-px bg-mint-100 my-3 mx-2" />

            <Link
              href="/debts/new"
              className="flex items-center gap-4 px-4 min-h-[4rem] rounded-xl text-lg font-semibold text-sage-700 hover:bg-mint-100 active:bg-mint-200 transition-colors duration-base"
            >
              <Plus size={26} className="shrink-0" />
              Add a debt
            </Link>
          </nav>

          <div className="shrink-0 border-t border-mint-200 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {session.user?.email && (
              <p className="text-sm text-sage-500 px-4 mb-2 truncate">
                {session.user.email}
              </p>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex items-center gap-4 px-4 min-h-[4rem] w-full rounded-xl text-lg font-semibold text-sage-700 hover:bg-mint-100 active:bg-mint-200 transition-colors duration-base"
            >
              <LogOut size={26} className="shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
