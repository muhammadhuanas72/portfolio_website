import { prefersReducedMotion } from "./motion";

export const seen = () => {
  try {
    return sessionStorage.getItem("boot") === "1";
  } catch {
    return false;
  }
};

// Decided once at load so the hero can hold its entrance until the boot intro has cleared.
export const BOOT_DELAY = typeof window !== "undefined" && !seen() && !prefersReducedMotion() ? 1.75 : 0;
