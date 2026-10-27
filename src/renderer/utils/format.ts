export const formatReminderDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatRemaining = (milliseconds: number) => {
  if (milliseconds <= 0) return "сейчас";

  const totalSeconds = Math.ceil(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return days + " д " + String(hours).padStart(2, "0") + " ч";
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
};

export const getContrastColor = (hex: string) => {
  const color = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255);
  const luminance = channels
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.24 ? "#24332b" : "#ffffff";
};

export const repeatLabels = {
  none: "Без повтора",
  daily: "Каждый день",
  weekdays: "По будням",
  weekly: "Каждую неделю",
  monthly: "Каждый месяц",
} as const;
