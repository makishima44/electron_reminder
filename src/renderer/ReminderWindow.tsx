import { createRoot } from "react-dom/client";
import { ReminderAlert } from "./components/ReminderAlert";
import "./styles/reminder.css";

const params = new URLSearchParams(window.location.search);
const id = params.get("id") ?? "";
const text = params.get("text") || "Напоминание";
const requestedBackground = params.get("background") ?? "#dcebd8";
const background = /^#[\da-f]{6}$/i.test(requestedBackground)
  ? requestedBackground
  : "#dcebd8";

const root = document.getElementById("root");
if (!root) throw new Error("Корневой элемент окна напоминания не найден.");

createRoot(root).render(
  <ReminderAlert id={id} text={text} background={background} />,
);
