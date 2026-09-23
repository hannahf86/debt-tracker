"use client";

import { Menu, ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

/**
 * Mobile app bar. Logo and name on the left, menu button on the right.
 *
 * Nested screens keep a back arrow on the left, where a back arrow belongs.
 * Adding a debt lives on the pages themselves, not up here.
 *
 * Deliberately not sticky — the design keeps the sidebar rail as the only
 * fixed element, so nothing follows you down the page.
 */

type BarConfig = {
  /** Nested screens swap the hamburger for a back arrow to this route. */
  back?: string;
};

function configFor(pathname: string): BarConfig | null {
  switch (pathname) {
    case "/dashboard":
      return {};
    case "/debts":
      return {};
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
    <header className="md:hidden flex items-center gap-2 h-[4.5rem] pl-3 pr-2.5 bg-white border-b border-mint-200">
      {config.back && (
        <button
          onClick={() => router.push(config.back!)}
          aria-label="Back"
          className="flex items-center justify-center w-12 h-12 shrink-0 -ml-1.5 rounded-xl text-sage-700 hover:bg-mint-100 active:bg-mint-200 transition-colors duration-base"
        >
          <ArrowLeft size={24} />
        </button>
      )}

      <img src="/mark.svg" alt="" className="h-8 w-8 shrink-0" />

      <span className="flex-1 min-w-0 font-display text-xl font-bold text-sage-800 truncate">
        Mirian
      </span>

      {!config.back && (
        <button
          onClick={onOpen}
          aria-label="Open menu"
          aria-expanded={isOpen}
          className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl text-sage-700 hover:bg-mint-100 active:bg-mint-200 transition-colors duration-base"
        >
          <Menu size={24} />
        </button>
      )}

    </header>
  );
}
