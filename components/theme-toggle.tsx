"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

const iconVariants = {
  initial: { opacity: 0, rotate: -90, y: -10 },
  animate: { opacity: 1, rotate: 0, y: 0 },
  exit: { opacity: 0, rotate: 90, y: 10 }
};

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      type="button"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 rounded-full border border-muted-foreground/20 bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:border-primary hover:text-primary"
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && currentTheme === "dark" ? (
          <motion.span
            key="moon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <MoonIcon className="h-4 w-4" />
            深色
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <SunIcon className="h-4 w-4" />
            浅色
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
