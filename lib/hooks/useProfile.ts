import { useState, useEffect, useCallback } from "react";

export type Profile = {
  name: string | null;
  display_name: string | null;
  email: string | null;
  monthly_budget: number | null;
};

const EMPTY: Profile = {
  name: null,
  display_name: null,
  email: null,
  monthly_budget: null,
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      setProfile(await response.json());
    } catch {
      setProfile(EMPTY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = useCallback(
    async (updates: Partial<Omit<Profile, "email">>) => {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to save your details");
      }
      setProfile((p) => ({ ...p, ...updates }));
    },
    [],
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /** What the greeting should call you, in order of preference. */
  const greetingName =
    profile.display_name?.trim() ||
    profile.name?.trim().split(/\s+/)[0] ||
    "";

  return { profile, greetingName, isLoading, fetchProfile, saveProfile };
}
