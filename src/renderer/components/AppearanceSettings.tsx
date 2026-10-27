import { ALERT_COLORS } from "../hooks/useAppSettings";
import { getContrastColor } from "../utils/format";

interface AppearanceSettingsProps {
  color: string;
  onChange(color: string): void;
}

export const AppearanceSettings = ({ color, onChange }: AppearanceSettingsProps) => {
  const foreground = getContrastColor(color);

  return (
  <section className="surface appearance-surface" aria-labelledby="appearance-heading">
    <div className="section-heading">
      <div>
        <p className="eyebrow">Ваше оформление</p>
        <h2 id="appearance-heading">Фон напоминания</h2>
      </div>
    </div>

    <p className="section-copy">Выберите цвет полноэкранного окна. Изображения не используются — текст останется хорошо читаемым.</p>
    <div className="swatch-row" role="group" aria-label="Цвет фона напоминания">
      {ALERT_COLORS.map((option) => (
        <button
          className="color-swatch"
          type="button"
          key={option.value}
          style={{ backgroundColor: option.value }}
          aria-label={option.name}
          aria-pressed={color.toLowerCase() === option.value}
          title={option.name}
          onClick={() => onChange(option.value)}
        />
      ))}
      <label className="custom-color">
        <span>Свой цвет</span>
        <input
          type="color"
          value={color}
          aria-label="Выбрать свой цвет фона"
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>

    <div className="preview-heading">
      <span>Предпросмотр</span>
      <span className="preview-caption">Так будет выглядеть окно</span>
    </div>
    <div className="alert-preview" style={{ backgroundColor: color }}>
      <div className="preview-content" style={{ color: foreground }}>
        <p className="preview-kicker">Напоминаем о важном</p>
        <p className="preview-message">Провести встречу<br />с командой</p>
        <span className="preview-button" style={{ color, backgroundColor: foreground }}>Готово</span>
      </div>
    </div>
  </section>
  );
};
