import { useMemo } from "react";
import type { Reminder } from "../../shared/types";
import { useClock } from "../hooks/useClock";
import { formatRemaining, formatReminderDate, repeatLabels } from "../utils/format";

interface ReminderListProps {
  reminders: Reminder[];
  isLoading: boolean;
  onDelete(id: string): void;
}

export const ReminderList = ({ reminders, isLoading, onDelete }: ReminderListProps) => {
  const now = useClock();
  const ordered = useMemo(
    () => reminders.slice().sort((a, b) => a.triggerAt - b.triggerAt),
    [reminders],
  );

  return (
    <section className="surface list-surface" aria-labelledby="list-heading">
      <div className="section-heading list-heading">
        <div>
          <p className="eyebrow">Всё под контролем</p>
          <h2 id="list-heading">Ближайшие напоминания</h2>
        </div>
        <span className="count-badge" aria-label={ordered.length + " напоминаний"}>
          {ordered.length}
        </span>
      </div>

      {isLoading ? (
        <p className="list-message">Загружаем напоминания…</p>
      ) : ordered.length === 0 ? (
        <div className="empty-state">
          <p>Пока здесь пусто</p>
          <span>Добавьте напоминание — оно появится в этом списке.</span>
        </div>
      ) : (
        <ul className="reminder-list">
          {ordered.map((reminder) => (
            <li className="reminder-row" key={reminder.id}>
              <span className="reminder-dot" aria-hidden="true" />
              <div className="reminder-copy">
                <p className="reminder-title">{reminder.text}</p>
                <p className="reminder-meta">
                  <time dateTime={new Date(reminder.triggerAt).toISOString()}>
                    {formatReminderDate(reminder.triggerAt)}
                  </time>
                  <span className="meta-divider" aria-hidden="true">·</span>
                  {repeatLabels[reminder.repeat]}
                </p>
              </div>
              <div className="reminder-countdown" aria-label="Осталось до напоминания">
                {formatRemaining(reminder.triggerAt - now)}
              </div>
              <button
                className="icon-button remove-button"
                type="button"
                aria-label={'Удалить напоминание «' + reminder.text + '»'}
                title="Удалить напоминание"
                onClick={() => onDelete(reminder.id)}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
