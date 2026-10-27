import { useState, type FormEvent } from "react";
import type { RepeatRule } from "../../shared/types";
import { combineDateAndTime, toDateInputValue, toTimeInputValue } from "../../shared/schedule";

interface ReminderFormProps {
  onCreate(input: { text: string; triggerAt: number; repeat: RepeatRule }): Promise<boolean>;
}

const initialSchedule = () => new Date(Date.now() + 15 * 60_000);

export const ReminderForm = ({ onCreate }: ReminderFormProps) => {
  const [text, setText] = useState("");
  const [date, setDate] = useState(() => toDateInputValue(initialSchedule()));
  const [time, setTime] = useState(() => toTimeInputValue(initialSchedule()));
  const [repeat, setRepeat] = useState<RepeatRule>("none");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedText = text.trim();
    const triggerAt = combineDateAndTime(date, time);

    if (!trimmedText) {
      setStatus("Добавьте текст, чтобы напоминание было понятным.");
      return;
    }
    if (!Number.isFinite(triggerAt) || triggerAt <= Date.now()) {
      setStatus("Выберите дату и время в будущем.");
      return;
    }

    setIsSaving(true);
    setStatus("");
    const created = await onCreate({ text: trimmedText, triggerAt, repeat });
    setIsSaving(false);

    if (created) {
      setText("");
      setRepeat("none");
      const nextSchedule = initialSchedule();
      setDate(toDateInputValue(nextSchedule));
      setTime(toTimeInputValue(nextSchedule));
      setStatus("Напоминание добавлено.");
    }
  };

  const minDate = toDateInputValue(new Date());

  return (
    <section className="surface form-surface" aria-labelledby="create-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Новый план</p>
          <h2 id="create-heading">Создать напоминание</h2>
        </div>
      </div>

      <form className="reminder-form" onSubmit={submit}>
        <label className="field field-wide">
          <span>О чём напомнить</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Например, провести встречу с командой"
            rows={2}
            maxLength={240}
            required
          />
        </label>

        <div className="form-row">
          <label className="field">
            <span>Дата</span>
            <input
              type="date"
              value={date}
              min={minDate}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Время</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Повтор</span>
            <select value={repeat} onChange={(event) => setRepeat(event.target.value as RepeatRule)}>
              <option value="none">Не повторять</option>
              <option value="daily">Каждый день</option>
              <option value="weekdays">По будням</option>
              <option value="weekly">Каждую неделю</option>
              <option value="monthly">Каждый месяц</option>
            </select>
          </label>
        </div>

        {status && <p className="form-feedback" role="status">{status}</p>}
        <div className="form-footer">
          <p>В назначенное время напоминание появится поверх окон.</p>
          <button className="button button-primary" type="submit" disabled={isSaving}>
            {isSaving ? "Сохраняем…" : "Добавить напоминание"}
          </button>
        </div>
      </form>
    </section>
  );
};
