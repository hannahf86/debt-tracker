import { useEffect } from "react";
import { useRouter } from "next/router";
import Seo from "@/components/Seo";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Just redirect to login after email confirmation
    router.push("/auth/login?message=Email confirmed! You can now sign in.");
  }, [router]);

  return (
    <>
      <Seo
        title="Signing you in"
        description="One moment while we finish signing you in."
        noindex
      />
      <div className="min-h-screen bg-page-accent flex items-center justify-center">
        <p className="text-sage-500">Confirming your account...</p>
      </div>
    </>
  );
}
