import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

const navyLight = {
  "--background": "#FFFFFF",
  "--foreground": "#1A1A2E",
  "--card": "#FFFFFF",
  "--card-foreground": "#1A1A2E",
  "--popover": "#FFFFFF",
  "--popover-foreground": "#1A1A2E",
  "--primary": "#1E3A5F",
  "--primary-foreground": "#FCFCFD",
  "--primary-light": "#3B5998",
  "--secondary": "#F5F5F7",
  "--secondary-foreground": "#1E3A5F",
  "--muted": "#F5F5F7",
  "--muted-foreground": "#6B7280",
  "--accent": "#F0F0F2",
  "--accent-foreground": "#1E3A5F",
  "--gold": "#D4A843",
  "--destructive": "#DC2626",
  "--destructive-foreground": "#FFFFFF",
  "--success": "#16A34A",
  "--warning": "#D4A843",
  "--info": "#3B82F6",
  "--border": "#E5E7EB",
  "--input": "#E5E7EB",
  "--ring": "#3B5998",
};

const navyDark = {
  "--background": "#0F1724",
  "--foreground": "#F8FAFC",
  "--card": "#1A2332",
  "--card-foreground": "#F8FAFC",
  "--popover": "#1A2332",
  "--popover-foreground": "#F8FAFC",
  "--primary": "#E8ECF1",
  "--primary-foreground": "#1A2332",
  "--primary-light": "#5B8BD4",
  "--secondary": "#1E293B",
  "--secondary-foreground": "#F8FAFC",
  "--muted": "#1E293B",
  "--muted-foreground": "#94A3B8",
  "--accent": "#1E293B",
  "--accent-foreground": "#F8FAFC",
  "--border": "rgba(255, 255, 255, 0.1)",
  "--input": "rgba(255, 255, 255, 0.15)",
  "--ring": "#4A7ABF",
};

function injectNavyStyle() {
  let el = document.getElementById("theme-navy");
  if (!el) {
    el = document.createElement("style");
    el.id = "theme-navy";
    document.head.appendChild(el);
  }
  const light = Object.entries(navyLight).map(([k, v]) => `${k}: ${v};`).join("\n");
  const dark = Object.entries(navyDark).map(([k, v]) => `${k}: ${v};`).join("\n");
  el.textContent = `:root {\n${light}\n}\n:root.dark {\n${dark}\n}`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(stored ?? (prefersDark ? "dark" : "light"));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
    injectNavyStyle();
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
