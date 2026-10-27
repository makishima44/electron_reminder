import { useState } from "react";
import { getContrastColor } from "../utils/format";

interface ReminderAlertProps {
  id: string;
  text: string;
  background: string;
}

export const ReminderAlert = ({ id, text, background }: ReminderAlertProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const foreground = getContrastColor(background);
  const buttonStyle = { color: background, backgroundColor: foreground };

  const acknowledge = async () => {
    if (!id || isClosing) return;
    setIsClosing(true);
    try {
      const acknowledged = await window.reminderAPI.acknowledgeReminder(id);
      if (!acknowledged) setIsClosing(false);
    } catch {
      setIsClosing(false);
    }
  };

  return (
    <main className="alert-screen" style={{ backgroundColor: background, color: foreground }}>
      <section className="alert-content" aria-labelledby="alert-heading">
        <p className="alert-eyebrow">Reminder · ваше время</p>
        <h1 id="alert-heading">Напоминаем<br />о важном</h1>
        <p className="alert-message">{text}</p>
        <button className="alert-acknowledge" style={buttonStyle} type="button" autoFocus onClick={acknowledge} disabled={isClosing}>
          Готово
        </button>
      </section>
      <p className="alert-footnote">Нажмите кнопку, когда будете готовы продолжить</p>
    </main>
  );
};
