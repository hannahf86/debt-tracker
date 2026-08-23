"use client";

import { Menu, ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

/**
 * Mobile app bar. 56px, title in the middle, one control each side.
 *
 * Deliberately not sticky — the design keeps the sidebar rail as the only
 * fixed element, so nothing follows you down the page.
 */

type BarConfig = {
  /** Nested screens swap the hamburger for a back arrow to this route. */
  back?: string;
  /** Dashboard and Debts carry a shortcut to add a debt. */
  addAction?: boolean;
};

function configFor(pathname: string): BarConfig | null {
  switch (pathname) {
    case "/dashboard":
      return { addAction: true };
    case "/debts":
      return { addAction: true };
    case "/tracker":
      return {};
    case "/settings":
      return {};
    case "/tracker/[month]":
      return { back: "/tracker" };
    case "/debts/new":
      return { back: "/debts" };
    case "/debts/[id]":
      return { back: "/debts" };
    case "/debts/[id]/edit":
      return { back: "/debts" };
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

  if (!session) return null;

  const config = configFor(router.pathname);
  if (!config) return null;

  return (
    <header className="md:hidden flex items-center gap-1.5 h-[4.5rem] pl-1.5 pr-2.5 bg-white border-b border-mint-200">
      {config.back ? (
        <button
          onClick={() => router.push(config.back!)}
          aria-label="Back"
          className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl text-sage-700 hover:bg-mint-100 active:bg-mint-200 transition-colors duration-base"
        >
          <ArrowLeft size={24} />
        </button>
      ) : (
        <button
          onClick={onOpen}
          aria-label="Open menu"
          aria-expanded={isOpen}
          className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl text-sage-700 hover:bg-mint-100 active:bg-mint-200 transition-colors duration-base"
        >
          <Menu size={24} />
        </button>
      )}

      <img src="/mark.svg" alt="" className="h-8 w-8 shrink-0" />

      <span className="flex-1 min-w-0 font-display text-xl font-bold text-sage-800 truncate">
        Mirian
      </span>

      {config.addAction && (
        <button
          onClick={() => router.push("/debts/new")}
          aria-label="Add a debt"
          className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-teal-50 text-brand hover:bg-teal-100 active:bg-teal-200 transition-colors duration-base"
        >
          <Plus size={22} />
        </button>
      )}
    </header>
  );
}
