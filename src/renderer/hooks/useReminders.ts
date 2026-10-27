import { useEffect, useState } from "react";
import type { CreateReminderInput, Reminder } from "../../shared/types";

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : "Не удалось выполнить действие.";

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    window.reminderAPI.getReminders()
      .then((items) => {
        if (isMounted) setReminders(items);
      })
      .catch((reason: unknown) => {
        if (isMounted) setError(describeError(reason));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createReminder = async (input: CreateReminderInput) => {
    setError("");
    try {
      const reminder = await window.reminderAPI.createReminder(input);
      setReminders((current) => [...current, reminder]);
      return true;
    } catch (reason: unknown) {
      setError(describeError(reason));
      return false;
    }
  };

  const deleteReminder = async (id: string) => {
    setError("");
    try {
      const deleted = await window.reminderAPI.deleteReminder(id);
      if (deleted) {
        setReminders((current) => current.filter((item) => item.id !== id));
      }
    } catch (reason: unknown) {
      setError(describeError(reason));
    }
  };

  return { reminders, isLoading, error, setError, createReminder, deleteReminder };
};
