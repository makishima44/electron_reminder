import { AppearanceSettings } from "./components/AppearanceSettings";
import { ReminderForm } from "./components/ReminderForm";
import { ReminderList } from "./components/ReminderList";
import { useAppSettings } from "./hooks/useAppSettings";
import { useReminders } from "./hooks/useReminders";
import "./styles/app.css";

const formatToday = (timestamp: number) =>
  new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(timestamp);

function App() {
  const reminders = useReminders();
  const settings = useAppSettings();
  const errors = [reminders.error, settings.error].filter(Boolean);

  return (
    <main className="app-shell">
      <header className="app-header">
        <a className="brand" href="#top" aria-label="Reminder — на главную">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span className="brand-word">Reminder</span>
        </a>
        <p className="today-label">{formatToday(Date.now())}</p>
      </header>

      <section className="welcome" id="top">
        <p className="eyebrow">Ваше время — на важное</p>
        <h1>Напоминаем о важном</h1>
        <p className="welcome-copy">Запланируйте дело — мы бережно вернём к нему в нужный момент.</p>
      </section>

      {errors.length > 0 && (
        <div className="error-banner" role="alert">
          {errors.map((error, index) => <p key={index}>{error}</p>)}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="main-column">
          <ReminderForm onCreate={reminders.createReminder} />
          <ReminderList
            reminders={reminders.reminders}
            isLoading={reminders.isLoading}
            onDelete={reminders.deleteReminder}
          />
        </div>
        <aside className="side-column" aria-label="Настройки внешнего вида">
          <AppearanceSettings
            color={settings.settings.alertBackground}
            onChange={settings.setAlertBackground}
          />
        </aside>
      </div>

      <footer className="app-footer">
        <span>Reminder</span>
        <span>Напоминания сохраняются на этом компьютере</span>
      </footer>
    </main>
  );
}

export default App;
