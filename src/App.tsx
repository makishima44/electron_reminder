import { FormEvent, useEffect, useMemo, useState } from "react";
import "./App.css";

type Reminder = {
  id: string;
  text: string;
  delayMinutes: number;
  triggerAt: number;
};

const formatDate = (time: number) =>
  new Date(time).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatRemaining = (ms: number) => {
  if (ms <= 0) {
    return "сейчас";
  }

  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

function App() {
  const [text, setText] = useState("");
  const [delayMinutes, setDelayMinutes] = useState("1");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [status, setStatus] = useState("");
  const [tick, setTick] = useState(Date.now());

  const loadReminders = async () => {
    const data = await window.reminderAPI.getReminders();
    setReminders(data);
  };

  useEffect(() => {
    loadReminders().catch((error: unknown) => {
      setStatus(`Ошибка загрузки: ${String(error)}`);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sortedReminders = useMemo(
    () => reminders.slice().sort((a, b) => a.triggerAt - b.triggerAt),
    [reminders, tick],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedText = text.trim();
    const delay = Number(delayMinutes);

    if (!trimmedText) {
      setStatus("Введите текст напоминания.");
      return;
    }

    if (!Number.isFinite(delay) || delay <= 0) {
      setStatus("Укажите время больше 0 минут.");
      return;
    }

    try {
      const created = await window.reminderAPI.createReminder({
        text: trimmedText,
        delayMinutes: delay,
      });

      setReminders((previous) => [...previous, created]);
      setText("");
      setDelayMinutes("1");
      setStatus(`Добавлено: "${created.text}"`);
    } catch (error: unknown) {
      setStatus(`Ошибка создания: ${String(error)}`);
    }
  };

  const deleteReminder = async (id: string) => {
    await window.reminderAPI.deleteReminder(id);
    setReminders((previous) => previous.filter((item) => item.id !== id));
  };

  return (
    <main className="app">
      <section className="panel">
        <h1>Reminder</h1>
        <p className="subtitle">
          Укажите текст и время в минутах. Когда время истечет, появится
          блокирующее окно поверх всех окон Windows.
        </p>

        <form className="form" onSubmit={onSubmit}>
          <label>
            Текст напоминания
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={3}
              placeholder="Например: Сделай перерыв"
              required
            />
          </label>

          <label>
            Через сколько минут
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={delayMinutes}
              onChange={(event) => setDelayMinutes(event.target.value)}
              required
            />
          </label>

          <button type="submit">Добавить напоминание</button>
        </form>

        {status && <p className="status">{status}</p>}
      </section>
      <section className="panel">
        <h2>Активные напоминания</h2>
        {sortedReminders.length === 0 && (
          <p className="empty">Пока нет активных напоминаний.</p>
        )}
        <ul className="list">
          {sortedReminders.map((item) => (
            <li key={item.id} className="item">
              <div>
                <p className="item-text">{item.text}</p>
                <p className="item-meta">Сработает: {formatDate(item.triggerAt)}</p>
                <p className="item-meta">
                  Осталось: {formatRemaining(item.triggerAt - tick)}
                </p>
              </div>
              <button type="button" onClick={() => deleteReminder(item.id)}>
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
