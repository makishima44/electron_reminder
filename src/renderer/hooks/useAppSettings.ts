import { useEffect, useState } from "react";
import type { AppSettings } from "../../shared/types";

export const ALERT_COLORS = [
  { name: "Небесный", value: "#cfe8ff" },
  { name: "Шалфей", value: "#dcebd8" },
  { name: "Лавандовый", value: "#e7e1f6" },
  { name: "Персиковый", value: "#f2d9cf" },
  { name: "Кремовый", value: "#f4eee5" },
] as const;

const DEFAULT_SETTINGS: AppSettings = { alertBackground: "#dcebd8" };

export const useAppSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    window.reminderAPI.getSettings()
      .then((savedSettings) => {
        if (isMounted) setSettings(savedSettings);
      })
      .catch(() => {
        if (isMounted) setError("Не удалось загрузить настройки фона.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setAlertBackground = async (alertBackground: string) => {
    const previous = settings;
    const next = { alertBackground };
    setSettings(next);
    setError("");

    try {
      setSettings(await window.reminderAPI.updateSettings(next));
    } catch {
      setSettings(previous);
      setError("Не удалось сохранить цвет фона.");
    }
  };

  return { settings, isLoading, error, setAlertBackground };
};
