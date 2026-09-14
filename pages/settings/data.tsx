"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { Download, AlertTriangle } from "lucide-react";

const CONFIRM_PHRASE = "delete my account";

/**
 * Your data: download a copy of everything, or delete the account and all of
 * it. The UK GDPR rights of access, portability and erasure, in one place.
 */
export default function YourDataPage() {
  const router = useRouter();
  const { status } = useSession();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  const handleDownload = async () => {
    setDownloadError("");
    setIsDownloading(true);
    try {
      const response = await fetch("/api/users/export");
      if (!response.ok) throw new Error("export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mirian-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(
        "We couldn't prepare your data just now. Please try again in a moment.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError("");
    setIsDeleteLoading(true);
    try {
      const response = await fetch("/api/users/delete", { method: "DELETE" });
      if (!response.ok) throw new Error("delete failed");
      await signOut({
        callbackUrl:
          "/auth/login?message=Your account and all your data have been deleted.",
      });
    } catch {
      setDeleteError(
        "We couldn't delete your account just now, so nothing has been removed. Please try again, or email us and we'll do it for you.",
      );
      setIsDeleteLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Your data · Mirian</title>
      </Head>

      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/settings"
            className="hidden md:inline-flex items-center min-h-[44px] text-sm font-medium text-sage-500 hover:text-sage-700 mb-4"
          >
            ← Settings
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="font-display text-[1.75rem] md:text-4xl leading-tight font-extrabold text-sage-800 mb-2">
              Your data
            </h1>
            <p className="text-sage-500 text-sm">
              Everything you&rsquo;ve put into Mirian belongs to you. Read how we
              look after it in our{" "}
              <Link href="/privacy" className="font-semibold text-brand underline">
                privacy notice
              </Link>
              .
            </p>
          </div>

          {/* Download your data */}
          <section
            aria-labelledby="download-heading"
            className="bg-white border border-mint-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm"
          >
            <h2 id="download-heading" className="text-lg font-semibold text-sage-800 mb-2">
              Download your data
            </h2>
            <p className="text-sage-600 text-sm mb-3">
              Get a copy of everything we hold about you:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-sage-700 mb-4">
              <li>your account details and budget</li>
              <li>your debts</li>
              <li>every payment you&rsquo;ve logged</li>
              <li>notes about late or short payments</li>
              <li>your contact history with companies</li>
            </ul>
            <p className="text-sage-500 text-xs mb-5">
              It downloads as a file that other apps and services can read.
            </p>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-5 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-pill transition-colors disabled:opacity-50 text-sm"
            >
              <Download size={18} aria-hidden="true" />
              {isDownloading ? "Preparing your data…" : "Download my data"}
            </button>
            {downloadError && (
              <p role="alert" className="mt-3 text-sm text-warn-700">
                {downloadError}
              </p>
            )}
          </section>

          {/* Delete your account */}
          <section
            aria-labelledby="delete-heading"
            className="bg-alert-100 border border-alert-200 rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-alert-600" aria-hidden="true" />
              <h2 id="delete-heading" className="text-lg font-semibold text-alert-600">
                Delete your account
              </h2>
            </div>
            <p className="text-sage-600 text-sm mb-2">
              This permanently deletes your account and everything in it: your
              debts, payments, notes and contact history.
            </p>
            <p className="text-sage-600 text-sm mb-6">
              It can&rsquo;t be undone, so download your data first if you&rsquo;d
              like to keep a copy.
            </p>

            {!isDeleting ? (
              <button
                onClick={() => setIsDeleting(true)}
                className="px-4 min-h-[48px] bg-alert-100 hover:bg-alert-200 text-alert-600 border border-alert-200 rounded-pill text-sm font-semibold transition-all"
              >
                Delete my account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sage-600 text-sm">
                  To confirm, type{" "}
                  <span className="text-sage-800 font-mono font-bold">
                    {CONFIRM_PHRASE}
                  </span>
                </p>
                <label htmlFor="delete_confirm" className="sr-only">
                  Type &ldquo;{CONFIRM_PHRASE}&rdquo; to confirm
                </label>
                <input
                  id="delete_confirm"
                  type="text"
                  autoComplete="off"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={CONFIRM_PHRASE}
                  className="w-full min-h-[48px] bg-white border border-alert-200 rounded-lg px-4 py-2 text-sage-800 placeholder-sage-500 focus:outline-none focus:border-alert-600 focus:ring-2 focus:ring-alert-600"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsDeleting(false);
                      setDeleteConfirm("");
                      setDeleteError("");
                    }}
                    className="flex-1 min-h-[48px] px-4 bg-mint-100 hover:bg-mint-200 text-sage-700 font-semibold rounded-pill transition-colors text-sm border border-mint-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={
                      deleteConfirm.trim().toLowerCase() !== CONFIRM_PHRASE ||
                      isDeleteLoading
                    }
                    className="flex-1 min-h-[48px] px-4 bg-alert-100 hover:bg-alert-200 text-alert-600 border border-alert-200 font-semibold rounded-pill transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isDeleteLoading ? "Deleting…" : "Delete everything"}
                  </button>
                </div>
                {deleteError && (
                  <p role="alert" className="text-sm text-alert-600">
                    {deleteError}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
