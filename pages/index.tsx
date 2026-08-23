import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    router.replace(status === "authenticated" ? "/dashboard" : "/auth/login");
  }, [status, router]);

  return (
    <div className="min-h-screen bg-page-accent flex items-center justify-center">
      <p className="text-sage-500">Loading...</p>
    </div>
  );
}
