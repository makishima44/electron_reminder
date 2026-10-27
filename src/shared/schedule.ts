import type { RepeatRule } from "./types.js";

const copyTime = (date: Date, timeSource: Date) => {
  date.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0);
  return date;
};

const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const getNextOccurrence = (
  anchorAt: number,
  repeat: Exclude<RepeatRule, "none">,
  after = Date.now(),
) => {
  const anchor = new Date(anchorAt);
  const cursor = new Date(after);

  if (repeat === "monthly") {
    let year = cursor.getFullYear();
    let month = cursor.getMonth();

    for (let attempt = 0; attempt < 120; attempt += 1) {
      const day = Math.min(anchor.getDate(), daysInMonth(year, month));
      const candidate = copyTime(new Date(year, month, day), anchor);
      if (candidate.getTime() > after && candidate.getTime() >= anchorAt) {
        return candidate.getTime();
      }

      month += 1;
      if (month > 11) {
        year += 1;
        month = 0;
      }
    }
  } else {
    const weekday = anchor.getDay();
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());

    for (let attempt = 0; attempt < 370; attempt += 1) {
      const candidate = copyTime(new Date(date), anchor);
      const isWeekday = candidate.getDay() !== 0 && candidate.getDay() !== 6;
      const matchesRule =
        repeat === "daily" ||
        (repeat === "weekdays" && isWeekday) ||
        (repeat === "weekly" && candidate.getDay() === weekday);

      if (
        matchesRule &&
        candidate.getTime() > after &&
        candidate.getTime() >= anchorAt
      ) {
        return candidate.getTime();
      }

      date.setDate(date.getDate() + 1);
    }
  }

  throw new Error("Не удалось вычислить следующее время напоминания.");
};

export const combineDateAndTime = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  if ([year, month, day, hour, minute].some((value) => !Number.isFinite(value))) {
    return Number.NaN;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
};

export const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
};

export const toTimeInputValue = (date: Date) =>
  String(date.getHours()).padStart(2, "0") + ":" +
  String(date.getMinutes()).padStart(2, "0");
