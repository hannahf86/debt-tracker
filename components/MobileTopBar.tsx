"use client";

import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";

/**
 * Mobile-only header carrying the hamburger. Deliberately not sticky — the
 * design keeps the sidebar rail as the only fixed element, so nothing follows
 * you down the page.
 */
export default function MobileTopBar({
  onOpen,
  isOpen,
}: {
  onOpen: () => void;
  isOpen: boolean;
}) {
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <div className="md:hidden flex items-center gap-2 h-16 px-4 border-b border-mint-200 bg-white">
      <button
        onClick={onOpen}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="flex items-center justify-center w-11 h-11 -ml-2 rounded-xl text-sage-700 hover:bg-mint-100 transition-colors"
      >
        <Menu size={22} />
      </button>
      <span className="text-sage-800 font-display font-bold text-lg tracking-tight flex items-center">
        <img src="/mark.svg" alt="" className="h-7 w-7 mr-2" />
        Mirian
      </span>
    </div>
  );
}
