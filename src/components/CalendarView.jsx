import { useState, useMemo } from "react";
import { getFlowDateFields } from "../utils/applicant";

export default function CalendarView({ applicants }) {
  const today = new Date();
  const [yearMonth, setYearMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState(null);
  const { year, month } = yearMonth;

  const events = useMemo(() => {
    const result = [];
    for (const app of applicants) {
      for (const { field, label } of getFlowDateFields(app.flow)) {
        if (app[field]) {
          const d = new Date(app[field]);
          if (!isNaN(d.getTime())) {
            result.push({ date: d, name: app.name, label, flow: app.flow });
          }
        }
      }
    }
    return result;
  }, [applicants]);

  const prevMonth = () => setYearMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 });
  const nextMonth = () => setYearMonth(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 });

  const firstDow = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const getEventsForDay = (day) => events.filter(e =>
    e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === day
  );

  const MONTH_NAMES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const eventColor = (flow) => {
    if (flow.startsWith("chuto")) return "bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)] border-l-2 border-[var(--color-primary)]";
    if (flow.startsWith("shinsotsu")) return "bg-[var(--color-secondary-fixed)] text-[var(--color-on-secondary-fixed)] border-l-2 border-[var(--color-secondary)]";
    return "bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)] border-l-2 border-[var(--color-tertiary-container)]";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-[var(--color-primary)] font-headline font-bold tracking-widest text-xs uppercase mb-1">Recruitment Schedule</p>
          <div className="flex items-center gap-4">
            <h2 className="font-headline font-extrabold text-3xl text-[var(--color-on-surface)]">
              {MONTH_NAMES_EN[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-full bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] transition-colors">
                <span className="material-symbols-outlined text-[var(--color-on-surface-variant)]">chevron_left</span>
              </button>
              <button onClick={nextMonth} className="p-2 rounded-full bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] transition-colors">
                <span className="material-symbols-outlined text-[var(--color-on-surface-variant)]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        {/* 凡例 */}
        <div className="flex flex-wrap gap-3 p-3 rounded-xl bg-[var(--color-surface-container-low)]">
          {[
            { label: "中途", cls: "bg-[var(--color-primary)]" },
            { label: "新卒", cls: "bg-[var(--color-secondary)]" },
            { label: "インターン", cls: "bg-[var(--color-tertiary-container)]" },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${cls}`} />
              <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* カレンダー本体 */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[var(--color-outline-variant)]">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-[var(--color-surface-container-high)] border-b border-[var(--color-outline-variant)]">
          {DOW.map((d, i) => (
            <div key={d} className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${i === 0 || i === 6 ? "text-[var(--color-outline)]" : "text-[var(--color-on-surface-variant)]"}`}>
              {d}
            </div>
          ))}
        </div>
        {/* グリッド */}
        <div className="grid grid-cols-7" style={{ gridAutoRows: "minmax(90px, auto)" }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} className="bg-[var(--color-surface-container-low)] opacity-40 border-r border-b border-[var(--color-outline-variant)]" />;
            const dayEvents = getEventsForDay(day);
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            const isSelected = selectedDay === day;
            const dow = (firstDow + day - 1) % 7;
            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`p-1 md:p-2 border-r border-b border-[var(--color-outline-variant)] cursor-pointer md:cursor-default ${isToday ? "bg-[var(--color-primary-fixed)]/30 ring-2 ring-inset ring-[var(--color-primary)]" : ""} ${isSelected ? "bg-[var(--color-secondary-fixed)]/40" : ""}`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-[var(--color-primary)] text-white" : dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-[var(--color-on-surface-variant)]"}`}>
                    {day}
                  </span>
                  {isToday && <span className="hidden md:inline text-[9px] font-bold text-[var(--color-primary)] uppercase">Today</span>}
                </div>
                {/* SP: ドット表示 */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 md:hidden">
                    {dayEvents.map((ev, j) => (
                      <span key={j} className={`w-2 h-2 rounded-full ${ev.flow.startsWith("chuto") ? "bg-[var(--color-primary)]" : ev.flow.startsWith("shinsotsu") ? "bg-[var(--color-secondary)]" : "bg-[var(--color-tertiary-container)]"}`} />
                    ))}
                  </div>
                )}
                {/* PC: テキストバッジ */}
                <div className="hidden md:block space-y-0.5">
                  {dayEvents.map((ev, j) => {
                    const hh = ev.date.getHours();
                    const mm = ev.date.getMinutes();
                    const timeStr = (hh !== 0 || mm !== 0) ? `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} ` : "";
                    return (
                      <div
                        key={j}
                        title={`${timeStr}${ev.name}（${ev.label}）`}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate ${eventColor(ev.flow)}`}
                      >
                        {timeStr}{ev.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SP: 選択日の予定詳細 */}
      {selectedDay !== null && (
        <div className="md:hidden mt-4 rounded-2xl bg-white border border-[var(--color-outline-variant)] shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-[var(--color-surface-container-high)] border-b border-[var(--color-outline-variant)]">
            <p className="text-sm font-bold text-[var(--color-on-surface)]">{month + 1}月{selectedDay}日の予定</p>
          </div>
          {getEventsForDay(selectedDay).length === 0 ? (
            <p className="px-4 py-4 text-sm text-[var(--color-on-surface-variant)]">予定はありません</p>
          ) : (
            <ul className="divide-y divide-[var(--color-outline-variant)]">
              {getEventsForDay(selectedDay).map((ev, j) => {
                const hh = ev.date.getHours();
                const mm = ev.date.getMinutes();
                const timeStr = (hh !== 0 || mm !== 0) ? `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}` : "";
                return (
                  <li key={j} className="flex items-center gap-3 px-4 py-3">
                    <span className={`w-2.5 h-2.5 flex-shrink-0 rounded-full ${ev.flow.startsWith("chuto") ? "bg-[var(--color-primary)]" : ev.flow.startsWith("shinsotsu") ? "bg-[var(--color-secondary)]" : "bg-[var(--color-tertiary-container)]"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--color-on-surface)] truncate">{ev.name}</p>
                      <p className="text-xs text-[var(--color-on-surface-variant)]">{ev.label}{timeStr && `　${timeStr}`}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
