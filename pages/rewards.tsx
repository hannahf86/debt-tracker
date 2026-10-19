"use client";

import { useEffect, useState } from "react";
import { Award, Download, Heart, Sparkles, Trophy } from "lucide-react";
import Seo from "@/components/Seo";
import { useTracker } from "@/lib/hooks/useTracker";
import { useProfile } from "@/lib/hooks/useProfile";
import {
  earnedRewards,
  previewRewards,
  type EarnedReward,
  type Reward,
} from "@/lib/rewards";
import type { ContactLog } from "@/lib/types";

/**
 * What's happened, marked.
 *
 * Earned things are in colour, with the date. Everything else is here too,
 * faded, with no progress bar, no count and no "3 more days" — a fact is
 * information, a countdown is a demand with a deadline on it.
 *
 * There is no score, no percentage and no sense of a set to complete,
 * because not completing a set is how a nice thing turns into a failure.
 */

const ICON: Record<Reward["group"], typeof Award> = {
  time: Sparkles,
  brave: Heart,
  milestone: Trophy,
  returning: Award,
};

const prettyDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

function EarnedCard({ item }: { item: EarnedReward }) {
  const Icon = ICON[item.reward.group];
  const date = prettyDate(item.on);

  return (
    <div className="bg-white border border-mint-200 rounded-2xl p-5 shadow-sm flex gap-4">
      <span className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-ok-100 border border-ok-200 text-ok-600">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-sage-800">
          {item.reward.name}
        </h3>
        <p className="text-sm text-sage-600 mt-1">{item.reward.description}</p>
        {date && <p className="text-xs text-sage-500 mt-2">{date}</p>}
        {item.reward.physical && (
          <p className="text-xs text-sage-500 mt-1">
            This one comes with a sticker, if you&rsquo;d like one.
          </p>
        )}
      </div>
    </div>
  );
}

function PreviewCard({ reward }: { reward: Reward }) {
  const Icon = ICON[reward.group];

  return (
    <div className="bg-white/50 border border-mint-100 rounded-2xl p-5 flex gap-4 opacity-60">
      <span className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-mint-100 border border-mint-200 text-sage-500">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-sage-700">
          {reward.name}
        </h3>
        <p className="text-sm text-sage-500 mt-1">{reward.description}</p>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const { data, isLoading } = useTracker();
  const { profile } = useProfile();
  const [contacts, setContacts] = useState<ContactLog[]>([]);

  useEffect(() => {
    fetch("/api/contacts?all=1")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setContacts(Array.isArray(rows) ? rows : []))
      .catch(() => setContacts([]));
  }, []);

  const earned = earnedRewards({
    debts: data.debts,
    payments: data.payments,
    contacts,
    accountCreated: profile.created_at,
  });
  const preview = previewRewards(earned);

  return (
    <>
      <Seo
        title="Your rewards"
        description="Things that have happened, marked."
        noindex
      />

      <div className="p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-[1.75rem] md:text-4xl leading-tight font-extrabold text-sage-800 mb-2">
              Your rewards
            </h1>
            <p className="text-sage-500 text-sm">
              Things that have happened. None of them can be lost.
            </p>
          </div>

          {isLoading ? (
            <p className="text-sage-500 text-sm">Loading…</p>
          ) : (
            <>
              {earned.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {earned.map((item) => (
                    <EarnedCard key={item.reward.id} item={item} />
                  ))}
                </div>
              )}

              {earned.length === 0 && (
                <div className="bg-white border border-mint-200 rounded-2xl p-6 shadow-sm mb-10">
                  <p className="text-sage-700">
                    Nothing here yet, which is fine. The first one arrives when
                    you add a debt, and they turn up on their own after that.
                  </p>
                </div>
              )}

              {preview.length > 0 && (
                <section aria-labelledby="also-here">
                  <h2
                    id="also-here"
                    className="font-display text-xl font-bold text-sage-800 mb-1"
                  >
                    Also here
                  </h2>
                  <p className="text-sage-500 text-sm mb-4">
                    These turn up when they turn up. There&rsquo;s no order
                    you&rsquo;re meant to do them in, and nothing happens if you
                    never get one.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {preview.map((reward) => (
                      <PreviewCard key={reward.id} reward={reward} />
                    ))}
                  </div>
                </section>
              )}

              <p className="text-xs text-sage-500 mt-10">
                Certificates for cleared debts live on the debt&rsquo;s own
                page. What they show is up to you, in{" "}
                <a href="/settings" className="underline font-semibold">
                  Settings
                </a>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
