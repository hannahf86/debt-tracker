"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import logo from "../../public/logo.png";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      router.push(
        "/auth/login?message=Account created! Check your email to confirm.",
      );
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-300 via-peach-100 to-mint-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src={logo.src}
            alt="Logo"
            className="h-10 w-auto inline-block mr-2"
          />
          <h1 className="text-3xl font-bold text-sage-800 mb-2">Mirian</h1>
          <p className="text-sage-600 text-sm">
            Track what you owe. Celebrate what you've paid. Watch it all get
            smaller!
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-mint-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-sage-800 mb-2">
            Create account
          </h2>
          <p className="text-sage-600 text-sm mb-6">
            No judgment here. Let's get started.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-sage-600 uppercase tracking-wider font-semibold block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-400 focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-sage-600 uppercase tracking-wider font-semibold block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-400 focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-sage-600 uppercase tracking-wider font-semibold block mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-mint-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-400 focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-mint-200">
            <p className="text-sage-600 text-sm text-center">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-sage-700 hover:text-sage-900 transition-colors font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
