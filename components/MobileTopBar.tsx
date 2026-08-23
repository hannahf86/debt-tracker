"use client";

import { Menu, ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { usePageTitleValue } from "@/lib/pageTitle";

/**
 * Mobile app bar. 56px, title in the middle, one control each side.
 *
 * Deliberately not sticky — the design keeps the sidebar rail as the only
 * fixed element, so nothing follows you down the page.
 */

type BarConfig = {
  title: string;
  /** Nested screens swap the hamburger for a back arrow to this route. */
  back?: string;
  /** Dashboard and Debts carry a shortcut to add a debt. */
  addAction?: boolean;
};

function configFor(pathname: string): BarConfig | null {
  switch (pathname) {
    case "/dashboard":
      // Title left blank on purpose — the page's greeting is the heading.
      return { title: "", addAction: true };
    case "/debts":
      return { title: "Your debts", addAction: true };
    case "/tracker":
      return { title: `${new Date().getFullYear()} tracker` };
    case "/settings":
      return { title: "Settings" };
    case "/tracker/[month]":
      return { title: "Month", back: "/tracker" };
    case "/debts/new":
      return { title: "Add a debt", back: "/debts" };
    case "/debts/[id]":
      return { title: "Debt", back: "/debts" };
    case "/debts/[id]/edit":
      return { title: "Edit debt", back: "/debts" };
    default:
      return null;
  }
}

export default function MobileTopBar({
  onOpen,
  isOpen,
}: {
  onOpen: () => void;
  isOpen: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const override = usePageTitleValue();

  if (!session) return null;

  const config = configFor(router.pathname);
  if (!config) return null;

  const title = override ?? config.title;

  return (
    <header className="md:hidden flex items-center gap-1 h-14 pl-1 pr-2 bg-white border-b border-mint-200">
      {config.back ? (
        <button
          onClick={() => router.push(config.back!)}
          aria-label="Back"
          className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl text-sage-700 hover:bg-mint-100 transition-colors duration-base"
        >
          <ArrowLeft size={22} />
        </button>
      ) : (
        <button
          onClick={onOpen}
          aria-label="Open menu"
          aria-expanded={isOpen}
          className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl text-sage-700 hover:bg-mint-100 transition-colors duration-base"
        >
          <Menu size={22} />
        </button>
      )}

      <h1 className="flex-1 min-w-0 font-display text-lg font-bold text-sage-800 truncate">
        {title}
      </h1>

      {config.addAction && (
        <button
          onClick={() => router.push("/debts/new")}
          aria-label="Add a debt"
          className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-teal-50 text-brand hover:bg-teal-100 transition-colors duration-base"
        >
          <Plus size={20} />
        </button>
      )}
    </header>
  );
}
