import { useState } from "react";
import { FLOWS, FLOW_LABELS, FLOW_BADGE } from "../constants/flows";
import { FORMS, CH, MEMBERS, TIME_SLOTS } from "../constants/config";
import { getDaysStalled, getFlowDateFields, progressPercent } from "../utils/applicant";
import { formatDate, formatDateTime } from "../utils/date";
import CopyBtn from "./CopyBtn";
import NoteEditor from "./NoteEditor";

export default function Card({ app, onAdvance, onStepBack, onReject, onUnreject, onDelete, onEditNote, onEditMember, onEdit, expanded, onToggle, loading, hideStalled }) {
  const steps = FLOWS[app.flow] ?? [];
  const step = steps[app.stepIdx];
  const next = steps[app.stepIdx + 1];
  const isDone = step?.id === "done" || app.rejected;
  const daysStalled = getDaysStalled(app);
  const isStalled = !isDone && !hideStalled && daysStalled >= 5;
  const [pendingDate, setPendingDate] = useState(false);
  const [interviewDateOnly, setInterviewDateOnly] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const interviewDate = interviewDateOnly && interviewTime ? `${interviewDateOnly}T${interviewTime}` : "";
  const resetDate = () => { setInterviewDateOnly(""); setInterviewTime(""); };
  const pct = progressPercent(app.flow, app.stepIdx);
  const badge = FLOW_BADGE[app.flow] ?? { bg: "bg-[var(--color-surface-container)]", text: "text-[var(--color-on-surface-variant)]" };

  return (
    <div className={`bg-white rounded-2xl overflow-hidden transition-all duration-200 ${isStalled ? "border-t-2 border-amber-400 shadow-md" : "border border-[var(--color-outline-variant)]"} ${loading ? "opacity-60" : ""} ${expanded ? "shadow-lg" : "hover:shadow-md"}`}>
      {/* カードヘッダー（クリックで展開） */}
      <div onClick={onToggle} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
        {/* アバター */}
        <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-[var(--color-primary-fixed)] flex items-center justify-center text-[var(--color-primary)] font-extrabold text-base">
          {app.name?.[0] ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-bold text-sm text-[var(--color-on-surface)]">{app.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
              {FLOW_LABELS[app.flow]}
            </span>
            {app.rejected && <span className="text-[10px] text-[var(--color-outline)] font-semibold">終了</span>}
            {!app.rejected && step?.id === "done" && <span className="text-[10px] text-emerald-600 font-bold">✓ 採用完了</span>}
            {isStalled && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5">
                ⚠ {daysStalled}日滞留
              </span>
            )}
          </div>
          {/* プログレスバー */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-[var(--color-primary)] whitespace-nowrap">{step?.label ?? ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-low)] rounded-full px-2.5 py-1 font-medium">
            {app.member}
          </span>
          <span className={`material-symbols-outlined text-[var(--color-outline)] text-lg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </div>
      </div>

      {/* 展開パネル */}
      {expanded && (
        <div className="border-t border-[var(--color-outline-variant)] px-4 py-4 bg-[var(--color-surface-container-low)] space-y-4">
          {/* 滞留警告 */}
          {isStalled && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">warning</span>
              <div>
                <div className="text-sm font-bold text-amber-800">{daysStalled}日間このステップに滞留しています</div>
                <div className="text-xs text-amber-600 mt-0.5">最終更新: {formatDateTime(app.stepUpdatedAt || app.created)}</div>
              </div>
            </div>
          )}

          {/* ステータス + アクション */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white border border-[var(--color-outline-variant)] rounded-xl px-4 py-3">
              <div className="text-[10px] text-[var(--color-outline)] font-bold uppercase tracking-wider mb-1">現在のステップ</div>
              <div className="font-bold text-sm text-[var(--color-on-surface)]">
                {app.rejected ? "不合格・終了" : step?.label}
              </div>
              <div className="text-[10px] text-[var(--color-outline)] mt-1">{app.stepIdx + 1} / {steps.length} ステップ</div>
            </div>
            {!isDone && step?.action && (
              <div className="bg-[var(--color-primary-fixed)] border border-[var(--color-primary-fixed-dim)] rounded-xl px-4 py-3">
                <div className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider mb-1">担当者アクション</div>
                <div className="font-semibold text-sm text-[var(--color-on-primary-fixed)]">{step.action}</div>
                {step.form && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-[var(--color-on-primary-fixed-variant)]">{FORMS[step.form].label}</span>
                    <CopyBtn url={FORMS[step.form].url} />
                  </div>
                )}
                {step.ch && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-[var(--color-on-primary-fixed-variant)]">{CH[step.ch].label}</span>
                    <a
                      href={CH[step.ch].url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] px-2.5 py-1 rounded border border-[var(--color-outline-variant)] bg-white text-[var(--color-on-surface-variant)] font-semibold no-underline"
                    >chを開く</a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* メタ情報 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-outline)]">
            <span>応募経路: {app.source}</span>
            <span>応募日: {formatDate(app.created)}</span>
          </div>
          {getFlowDateFields(app.flow).some(({ field }) => app[field]) && (
            <div className="flex flex-col gap-y-1 text-xs">
              {getFlowDateFields(app.flow).map(({ field, label }) => app[field] && (
                <span key={field} className="text-secondary font-bold">{label}: {formatDateTime(app[field])}</span>
              ))}
            </div>
          )}

          {/* 担当者変更 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-outline)] font-bold">担当者:</span>
            <select
              data-1p-ignore
              value={app.member}
              onChange={e => onEditMember(app.id, e.target.value)}
              className="text-sm px-2 py-1 rounded-lg border border-[var(--color-outline-variant)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            >
              {MEMBERS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* メモ */}
          <NoteEditor note={app.note} onSave={note => onEditNote(app.id, note)} />

          {/* アクションボタン */}
          {!isDone ? (
            <div>
              {next && step?.dateInput && pendingDate ? (
                <div className="bg-[var(--color-primary-fixed)] border border-[var(--color-primary-fixed-dim)] rounded-xl px-4 py-3 space-y-3">
                  <div className="text-xs font-bold text-[var(--color-primary)]">{step.dateLabel}を入力してください</div>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      data-1p-ignore
                      type="date"
                      value={interviewDateOnly}
                      onChange={e => setInterviewDateOnly(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-[var(--color-outline-variant)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    <select
                      data-1p-ignore
                      value={interviewTime}
                      onChange={e => setInterviewTime(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-[var(--color-outline-variant)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 min-w-[110px]"
                    >
                      <option value="">時刻を選択</option>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onAdvance(app.id, interviewDate, step.dateField); setPendingDate(false); resetDate(); }}
                      disabled={loading || !interviewDate}
                      className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                    >確定 → {next.label}</button>
                    <button
                      onClick={() => { setPendingDate(false); resetDate(); }}
                      className="px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-sm text-[var(--color-on-surface-variant)]"
                    >キャンセル</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {next && (
                    <button
                      onClick={() => step?.dateInput ? setPendingDate(true) : onAdvance(app.id)}
                      disabled={loading}
                      className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold disabled:opacity-40"
                    >次へ → {next.label}</button>
                  )}
                  <button
                    onClick={() => onReject(app.id)}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-error)] text-sm font-semibold bg-white"
                  >不合格・終了</button>
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                {app.stepIdx > 0 && !pendingDate ? (
                  <button onClick={() => onStepBack(app.id)} disabled={loading} className="text-xs text-[var(--color-outline)] underline bg-transparent border-0 cursor-pointer p-0">
                    ← 前のステップに戻す
                  </button>
                ) : <span />}
                <button
                  onClick={() => onEdit(app)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] bg-white font-semibold"
                >
                  <span className="material-symbols-outlined text-[14px] align-middle mr-0.5">edit</span>編集
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {app.rejected && (
                  <>
                    <button
                      onClick={() => onUnreject(app.id)}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-primary)] text-xs font-semibold bg-white"
                    >↩ 対応中に戻す</button>
                    <button
                      onClick={() => onDelete(app.id)}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold bg-white"
                    >
                      <span className="material-symbols-outlined text-[14px] align-middle mr-0.5">delete</span>削除
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => onEdit(app)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] bg-white font-semibold"
              >
                <span className="material-symbols-outlined text-[14px] align-middle mr-0.5">edit</span>編集
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
