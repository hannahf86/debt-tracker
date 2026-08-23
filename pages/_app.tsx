import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileTopBar from "@/components/MobileTopBar";
import { PageTitleProvider } from "@/lib/pageTitle";
import "@/styles/globals.css";

const authRoutes = [
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/onboarding",
  "/404",
];

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const isAuthRoute = authRoutes.includes(router.pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SessionProvider session={session}>
      <PageTitleProvider>
      <div className="flex min-h-screen bg-page-accent">
        {!isAuthRoute && (
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
        )}
        {/* min-w-0 lets the column shrink instead of forcing the page wider
            than the viewport when a child overflows. */}
        <main
          className={`flex-1 min-w-0 transition-all duration-300 ${
            !isAuthRoute ? (collapsed ? "md:ml-16" : "md:ml-64") : ""
          }`}
        >
          {!isAuthRoute && (
            <MobileTopBar
              onOpen={() => setMobileOpen(true)}
              isOpen={mobileOpen}
            />
          )}
          <Component {...pageProps} />
        </main>
      </div>
      </PageTitleProvider>
    </SessionProvider>
  );
}
