import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Just redirect to login after email confirmation
    router.push("/auth/login?message=Email confirmed! You can now sign in.");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <p className="text-slate-400">Confirming your account...</p>
    </div>
  );
}
