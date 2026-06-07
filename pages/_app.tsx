import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import "@/styles/globals.css";

const authRoutes = ["/auth/login", "/auth/signup", "/auth/callback"];

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const isAuthRoute = authRoutes.includes(router.pathname);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-gradient-to-br from-peach-300 via-peach-100 to-mint-100">
        {!isAuthRoute && (
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <main
          className={`flex-1 transition-all duration-300 ${
            !isAuthRoute ? (collapsed ? "ml-16" : "ml-64") : ""
          }`}
        >
          <Component {...pageProps} />
        </main>
      </div>
    </SessionProvider>
  );
}
