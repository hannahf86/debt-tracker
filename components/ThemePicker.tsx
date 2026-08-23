"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export default function ThemePicker() {
  // Start as null so the server and first client render agree; the stored
  // choice is read after mount.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="flex flex-col sm:flex-row gap-2"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={selected}
            onClick={() => choose(value)}
            className={`flex-1 flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl border text-sm font-semibold transition-colors duration-base ${
              selected
                ? "bg-brand border-brand text-white"
                : "bg-white border-mint-200 text-sage-700 hover:bg-mint-100"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
