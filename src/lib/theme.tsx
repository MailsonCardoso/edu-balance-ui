import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

const rubyLight = {
  "--background": "#FFFFFF",
  "--foreground": "#1A1A1A",
  "--card": "#FFFFFF",
  "--card-foreground": "#1A1A1A",
  "--popover": "#FFFFFF",
  "--popover-foreground": "#1A1A1A",
  "--primary": "#D62828",
  "--primary-foreground": "#FFFFFF",
  "--secondary": "#C0C0C0",
  "--secondary-foreground": "#1A1A1A",
  "--muted": "#F5F5F5",
  "--muted-foreground": "#737373",
  "--accent": "#9D0208",
  "--accent-foreground": "#FFFFFF",
  "--destructive": "#DC2626",
  "--destructive-foreground": "#FFFFFF",
  "--success": "#16A34A",
  "--success-foreground": "#FFFFFF",
  "--warning": "#F59E0B",
  "--warning-foreground": "#1A1A1A",
  "--info": "#3B82F6",
  "--info-foreground": "#FFFFFF",
  "--border": "#E5E5E5",
  "--input": "#E5E5E5",
  "--ring": "#D62828",
  "--sidebar": "#1A1A1A",
  "--sidebar-foreground": "#E5E5E5",
  "--sidebar-accent": "#333333",
  "--sidebar-accent-foreground": "#FFFFFF",
  "--sidebar-border": "#333333",
};

const rubyDark = {
  "--background": "#1A0D0D",
  "--foreground": "#F5F5F5",
  "--card": "#2D1515",
  "--card-foreground": "#F5F5F5",
  "--popover": "#2D1515",
  "--popover-foreground": "#F5F5F5",
  "--primary": "#EF4444",
  "--primary-foreground": "#FFFFFF",
  "--secondary": "#A0A0A0",
  "--secondary-foreground": "#1A0D0D",
  "--muted": "#2D1515",
  "--muted-foreground": "#A3A3A3",
  "--accent": "#BA0208",
  "--accent-foreground": "#FFFFFF",
  "--destructive": "#F87171",
  "--destructive-foreground": "#1A0D0D",
  "--success": "#4ADE80",
  "--success-foreground": "#1A0D0D",
  "--warning": "#FBBF24",
  "--warning-foreground": "#1A0D0D",
  "--info": "#60A5FA",
  "--info-foreground": "#1A0D0D",
  "--border": "#404040",
  "--input": "#404040",
  "--ring": "#EF4444",
  "--sidebar": "#0F0808",
  "--sidebar-foreground": "#D4D4D4",
  "--sidebar-accent": "#333333",
  "--sidebar-accent-foreground": "#FFFFFF",
  "--sidebar-border": "#404040",
};

function injectRubyStyle() {
  let el = document.getElementById("theme-ruby");
  if (!el) {
    el = document.createElement("style");
    el.id = "theme-ruby";
    document.head.appendChild(el);
  }
  const light = Object.entries(rubyLight).map(([k, v]) => `${k}: ${v};`).join("\n");
  const dark = Object.entries(rubyDark).map(([k, v]) => `${k}: ${v};`).join("\n");
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
    injectRubyStyle();
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
