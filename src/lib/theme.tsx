import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { themePresets, type ThemePreset } from "./theme-presets";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  preset: ThemePreset;
  presetName: string;
  setPreset: (name: string) => void;
}

const defaultPresetName = "oceanic";
const defaultPreset = themePresets.find((p) => p.name === defaultPresetName) ?? themePresets[0];

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
  preset: defaultPreset,
  presetName: defaultPresetName,
  setPreset: () => {},
});

function applyPresetVars(preset: ThemePreset, theme: Theme) {
  const root = document.documentElement;
  const vars = theme === "dark" ? preset.dark : preset.light;
  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [presetName, setPresetName] = useState<string>(defaultPresetName);

  useEffect(() => {
    const storedTheme = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(storedTheme ?? (prefersDark ? "dark" : "light"));

    const storedPreset = typeof window !== "undefined" && localStorage.getItem("theme-preset");
    if (storedPreset && themePresets.some((p) => p.name === storedPreset)) {
      setPresetName(storedPreset);
    }
  }, []);

  const preset = themePresets.find((p) => p.name === presetName) ?? defaultPreset;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    applyPresetVars(preset, theme);
    localStorage.setItem("theme-preset", presetName);
  }, [preset, presetName, theme]);

  const setPreset = useCallback((name: string) => {
    setPresetName(name);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
        preset,
        presetName,
        setPreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
