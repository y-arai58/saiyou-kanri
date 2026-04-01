import { useState, useEffect, useCallback, useMemo } from "react";

const GAS_URL = import.meta.env.VITE_GAS_URL;
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

const FORMS = {
  chuto: { label: "中途用フォーム", url: "https://forms.gle/2hCrxjyyHc1D3n9h9" },
  shinsotsu: { label: "新卒用フォーム", url: "https://forms.gle/hXtBrh55Y3b3KxvW6" },
  interneng: { label: "長期インターン用フォーム（エンジニア・デザイナー）", url: "https://docs.google.com/forms/d/e/1FAIpQLScfBDAJ6RpE5I5bVVHC072Ri38Y2TFMs0dSeStLvTp7ApscXQ/viewform" },
};

const CH = {
  form_entry: { label: "採用フォーム入力通知", url: "https://third-scope.slack.com/archives/C0AJWFB9NDD" },
};

const MEMBERS = ["新井", "中里", "早川", "クリス", "油谷", "伊藤"];

const FLOWS = {
  chuto_casual: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容を確認する", ch: "form_entry" },
    { id: "schedule", label: "希望日程確認", action: "メールで希望日程を確認" },
    { id: "schedule", label: "日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "scheduledDate", dateLabel: "日程" },
    { id: "casual", label: "面談", action: "カジュアル面談を実施する" },
    { id: "done", label: "完了", action: null },
  ],
  chuto_mensetsu: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容を確認する", ch: "form_entry" },
    { id: "shorui", label: "書類選考", action: "フォーム内容をもとに書類選考する" },
    { id: "shorui_pass", label: "希望日程確認", action: "メールで希望日程を確認" },
    { id: "shorui_pass", label: "日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接", action: "面接を実施する" },
    { id: "interview", label: "面接合否", action: "合否を判断し、応募者へ結果を連絡する" },
    { id: "done", label: "採用決定", action: null },
  ],
  shinsotsu_kaisetsu: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容・希望日程を確認する", ch: "form_entry" },
    { id: "schedule", label: "日程調整", action: "フォームの希望日程から担当者と日程を決定", dateInput: true, dateField: "scheduledDate", dateLabel: "日程" },
    { id: "kaisetsu", label: "会社説明", action: "会社説明を実施する" },
    { id: "done", label: "完了", action: null },
  ],
  shinsotsu_honsenkou: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容を確認する", ch: "form_entry" },
    { id: "shorui", label: "書類選考", action: "フォーム内容をもとに書類選考する" },
    { id: "shorui_pass", label: "1次希望日程確認", action: "メールで希望日程を確認" },
    { id: "shorui_pass", label: "1次日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "interview1Date", dateLabel: "1次面接日時" },
    { id: "interview1", label: "1次面接", action: "面接を実施する" },
    { id: "interview1_judge", label: "1次面接合否", action: "1次選考の合否を判断する" },
    { id: "interview2_sched", label: "2次希望日程確認", action: "代表スケジュールを確認し、候補日5つ送付" },
    { id: "interview2_sched", label: "2次日程調整", action: "日程が確定したら、応募者へメールで連絡 → カレンダーへ応募者情報を登録", dateInput: true, dateField: "interview2Date", dateLabel: "2次面接日時" },
    { id: "interview2", label: "2次面接", action: "面接を実施する" },
    { id: "interview2_judge", label: "2次面接合否", action: "合否を判断し、応募者へ結果を連絡する" },
    { id: "done", label: "採用決定", action: null },
  ],
  intern_site_eng: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容を確認する", ch: "form_entry" },
    { id: "shorui", label: "書類選考", action: "フォーム内容をもとに書類選考する" },
    { id: "schedule", label: "希望日程確認", action: "メールで希望日程を確認" },
    { id: "schedule", label: "日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接", action: "面接を実施する" },
    { id: "interview", label: "面接合否", action: "合否を判断し、応募者へ結果を連絡する" },
    { id: "done", label: "採用決定", action: null },
  ],
  intern_zero_eng: [
    { id: "shorui_pass", label: "書類選考通過", action: "面接の日程を調整する" },
    { id: "schedule", label: "希望日程確認", action: "メールで希望日程を確認" },
    { id: "schedule", label: "日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接", action: "面接を実施する" },
    { id: "interview", label: "面接合否", action: "合否を判断し、応募者へ結果を連絡する" },
    { id: "done", label: "採用決定", action: null },
  ],
};

const FLOW_LABELS = {
  chuto_casual: "中途｜カジュアル面談",
  chuto_mensetsu: "中途｜採用面接",
  shinsotsu_kaisetsu: "新卒｜会社説明",
  shinsotsu_honsenkou: "新卒｜本選考",
  intern_site_eng: "長期インターン｜採用サイト",
  intern_zero_eng: "長期インターン｜ゼロワン",
};

// 日程確定済み（当日まで待機）のステップID
const SCHEDULED_STEP_IDS = new Set([
  "interview_scheduled", // 面接
  "casual",              // 面談
  "kaisetsu",            // 会社説明
  "interview1",          // 1次面接
  "interview2",          // 2次面接
]);

// 候補者返信待ちのステップID
const AWAITING_STEP_IDS = new Set([
  "schedule",            // 日程調整
  "shorui_pass",         // 日程調整（書類通過後）
  "interview2_sched",    // 2次日程調整
]);

// 応募者のステップカテゴリを返す
function getStepCategory(app) {
  const stepId = FLOWS[app.flow]?.[app.stepIdx]?.id;
  if (!stepId) return "action";
  if (SCHEDULED_STEP_IDS.has(stepId)) return "scheduled";
  if (AWAITING_STEP_IDS.has(stepId)) return "awaiting";
  return "action";
}

// フィルタータブ用のグループ
const FILTER_TABS = [
  { key: "all", label: "全員" },
  { key: "chuto", label: "中途" },
  { key: "shinsotsu", label: "新卒" },
  { key: "intern", label: "インターン" },
];

const FLOW_OPTIONS = [
  { group: "中途", flows: ["chuto_casual", "chuto_mensetsu"] },
  { group: "新卒", flows: ["shinsotsu_kaisetsu", "shinsotsu_honsenkou"] },
  { group: "長期インターン", flows: ["intern_eng"] },
];

const FLOW_OPTION_LABELS = {
  ...FLOW_LABELS,
  intern_eng: "長期インターン",
};

function resolveFlow(baseFlow, internRoute) {
  if (baseFlow === "intern_eng") {
    return internRoute === "ゼロワン" ? "intern_zero_eng" : "intern_site_eng";
  }
  return baseFlow;
}
function resolveSource(baseFlow, internRoute) {
  return baseFlow === "intern_eng" ? internRoute : "採用サイト";
}

async function apiGet(action) {
  const res = await fetch(`${GAS_URL}?action=${action}`);
  return res.json();
}

async function apiPost(body) {
  const params = { ...body };
  if (params.rejected !== undefined) params.rejected = String(params.rejected);
  if (params.stepIdx !== undefined) params.stepIdx = String(params.stepIdx);
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GAS_URL}?${qs}`);
  return res.json();
}

function getFlowDateFields(flow) {
  const seen = new Set();
  return (FLOWS[flow] ?? []).filter(s => s.dateInput && s.dateField).reduce((acc, s) => {
    if (!seen.has(s.dateField)) { seen.add(s.dateField); acc.push({ field: s.dateField, label: s.dateLabel }); }
    return acc;
  }, []);
}

const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const h = String(11 + Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Tokyo" });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" });
}

function getDaysStalled(app) {
  const ref = app.stepUpdatedAt || app.created;
  if (!ref) return 0;
  const d = new Date(ref);
  if (isNaN(d.getTime())) return 0;
  return Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
}

// フローごとのバッジ色
const FLOW_BADGE = {
  chuto_casual: { bg: "bg-[#dbe1ff]", text: "text-[#00174d]" },
  chuto_mensetsu: { bg: "bg-[#dbe1ff]", text: "text-[#00174d]" },
  shinsotsu_kaisetsu: { bg: "bg-[#ebddff]", text: "text-[#250059]" },
  shinsotsu_honsenkou: { bg: "bg-[#ebddff]", text: "text-[#250059]" },
  intern_site_eng: { bg: "bg-[#ffdad2]", text: "text-[#3d0700]" },
  intern_zero_eng: { bg: "bg-[#ffdad2]", text: "text-[#3d0700]" },
};

// プログレスバーの進捗割合
function progressPercent(flow, stepIdx) {
  const steps = FLOWS[flow] ?? [];
  if (steps.length <= 1) return 100;
  return Math.round((stepIdx / (steps.length - 1)) * 100);
}

// =====================================================
//  小コンポーネント
// =====================================================
function CopyBtn({ url }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className={`text-[11px] px-2.5 py-1 rounded border font-semibold transition-colors ${ok ? "bg-green-50 border-green-300 text-green-700" : "bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]"}`}
    >
      {ok ? "コピー済" : "URLコピー"}
    </button>
  );
}

function NoteEditor({ note, onSave }) {
  const [val, setVal] = useState(note);
  const [editing, setEditing] = useState(false);
  useEffect(() => { setVal(note); }, [note]);
  return (
    <div>
      <div className="text-[10px] text-[var(--color-outline)] font-bold mb-1.5 uppercase tracking-wider">メモ</div>
      {editing ? (
        <div>
          <textarea
            data-1p-ignore
            value={val}
            onChange={e => setVal(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-[var(--color-outline-variant)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-white"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { onSave(val); setEditing(false); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-on-surface)] text-white font-bold"
            >保存</button>
            <button
              onClick={() => { setVal(note); setEditing(false); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]"
            >キャンセル</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="text-sm text-[var(--color-on-surface-variant)] bg-white border border-[var(--color-outline-variant)] rounded-lg px-3 py-2 min-h-[34px] cursor-text"
        >
          {val || <span className="text-[var(--color-outline)]">クリックしてメモを追加…</span>}
        </div>
      )}
    </div>
  );
}

// =====================================================
//  応募者カード
// =====================================================
function Card({ app, onAdvance, onStepBack, onReject, onUnreject, onDelete, onEditNote, onEditMember, onEdit, expanded, onToggle, loading, hideStalled }) {
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
            {getFlowDateFields(app.flow).map(({ field, label }) => app[field] && (
              <span key={field} className="text-[var(--color-secondary)] font-bold">{label}: {formatDateTime(app[field])}</span>
            ))}
          </div>

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

// =====================================================
//  追加モーダル
// =====================================================
function AddModal({ onClose, onAdd, saving }) {
  const [name, setName] = useState("");
  const [baseFlow, setBaseFlow] = useState("shinsotsu_honsenkou");
  const [internRoute, setInternRoute] = useState("採用サイト");
  const [member, setMember] = useState(MEMBERS[0]);
  const [note, setNote] = useState("");
  const isIntern = baseFlow === "intern_eng";

  const handleAdd = () => {
    if (!name) return;
    onAdd({ name, flow: resolveFlow(baseFlow, internRoute), source: resolveSource(baseFlow, internRoute), member, note });
  };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-outline-variant)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20";

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
        <h3 className="font-headline font-extrabold text-xl text-[var(--color-on-surface)] mb-5">応募者を追加</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">氏名</label>
            <input data-1p-ignore value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="例: 山田 太郎" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">フロー</label>
            <select data-1p-ignore value={baseFlow} onChange={e => setBaseFlow(e.target.value)} className={inputCls}>
              {FLOW_OPTIONS.map(({ group, flows }) => (
                <optgroup key={group} label={group}>
                  {flows.map(k => <option key={k} value={k}>{FLOW_OPTION_LABELS[k]}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          {isIntern && (
            <div>
              <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">応募経路</label>
              <div className="flex gap-2">
                {["採用サイト", "ゼロワン"].map(r => (
                  <button
                    key={r}
                    onClick={() => setInternRoute(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${internRoute === r ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-white text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]"}`}
                  >{r}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">担当者</label>
            <select data-1p-ignore value={member} onChange={e => setMember(e.target.value)} className={inputCls}>
              {MEMBERS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">メモ（任意）</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="初期メモがあれば…" />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-outline-variant)] text-sm text-[var(--color-on-surface-variant)]">キャンセル</button>
          <button
            onClick={handleAdd}
            disabled={!name || saving}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold disabled:opacity-40"
          >{saving ? "追加中…" : "追加"}</button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
//  編集モーダル
// =====================================================
function EditModal({ app, onClose, onSave, saving }) {
  const [name, setName] = useState(app.name);
  const inferBase = (flow) => (flow.startsWith("intern") && flow.includes("eng")) ? "intern_eng" : flow;
  const inferRoute = (flow) => flow.includes("zero") ? "ゼロワン" : "採用サイト";
  const [baseFlow, setBaseFlow] = useState(inferBase(app.flow));
  const [internRoute, setInternRoute] = useState(inferRoute(app.flow));
  const [member, setMember] = useState(app.member);
  const isIntern = baseFlow === "intern_eng";

  const handleSave = () => {
    if (!name) return;
    onSave({ id: app.id, name, flow: resolveFlow(baseFlow, internRoute), source: resolveSource(baseFlow, internRoute), member });
  };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-outline-variant)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20";

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
        <h3 className="font-headline font-extrabold text-xl text-[var(--color-on-surface)] mb-5">応募者を編集</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">氏名</label>
            <input data-1p-ignore value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">フロー</label>
            <select data-1p-ignore value={baseFlow} onChange={e => setBaseFlow(e.target.value)} className={inputCls}>
              {FLOW_OPTIONS.map(({ group, flows }) => (
                <optgroup key={group} label={group}>
                  {flows.map(k => <option key={k} value={k}>{FLOW_OPTION_LABELS[k]}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          {isIntern && (
            <div>
              <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">応募経路</label>
              <div className="flex gap-2">
                {["採用サイト", "ゼロワン"].map(r => (
                  <button
                    key={r}
                    onClick={() => setInternRoute(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${internRoute === r ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-white text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]"}`}
                  >{r}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">担当者</label>
            <select data-1p-ignore value={member} onChange={e => setMember(e.target.value)} className={inputCls}>
              {MEMBERS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-outline-variant)] text-sm text-[var(--color-on-surface-variant)]">キャンセル</button>
          <button
            onClick={handleSave}
            disabled={!name || saving}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold disabled:opacity-40"
          >{saving ? "保存中…" : "保存"}</button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
//  カレンダービュー
// =====================================================
function CalendarView({ applicants }) {
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

  // イベントバッジカラー（フロー別）
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

// =====================================================
//  ログイン画面
// =====================================================
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw === APP_PASSWORD) {
      sessionStorage.setItem("saiyou_auth", "1");
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-3xl px-8 py-10 w-full max-w-sm shadow-xl text-center ${shake ? "animate-[shake_0.4s_ease]" : ""}`}
      >
        <h1 className="font-headline font-extrabold text-2xl text-[var(--color-primary)] mb-1">採用管理</h1>
        <p className="text-sm text-[var(--color-on-surface-variant)] mb-8">パスワードを入力してください</p>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          placeholder="パスワード"
          autoFocus
          className={`w-full px-4 py-3 rounded-xl border text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors ${error ? "border-[var(--color-error)]" : "border-[var(--color-outline-variant)]"}`}
        />
        {error && <p className="text-xs text-[var(--color-error)] font-semibold mb-2">パスワードが正しくありません</p>}
        <button type="submit" className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm mt-2 hover:opacity-90 transition-opacity">
          ログイン
        </button>
      </form>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
}

// =====================================================
//  メインアプリ
// =====================================================
export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("saiyou_auth") === "1");
  const [applicants, setApplicants] = useState([]);
  const [fetchState, setFetchState] = useState("idle");
  const [loadingId, setLoadingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const load = useCallback(async () => {
    setFetchState("loading");
    try {
      const res = await apiGet("list");
      if (res.ok) { setApplicants(res.data); setFetchState("idle"); }
      else setFetchState("error");
    } catch { setFetchState("error"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const advance = async (id, dateValue, dateField) => {
    const app = applicants.find(a => a.id === id);
    if (!app) return;
    const newIdx = app.stepIdx + 1;
    setLoadingId(id);
    try {
      const body = { action: "update", id, stepIdx: newIdx };
      if (dateValue && dateField) body[dateField] = dateValue;
      const res = await apiPost(body);
      if (res.ok) setApplicants(prev => prev.map(a =>
        a.id === id ? { ...a, stepIdx: newIdx, ...(dateValue && dateField ? { [dateField]: dateValue } : {}) } : a
      ));
      else alert("更新に失敗しました");
    } catch { alert("通信エラーが発生しました"); }
    setLoadingId(null);
  };

  const stepBack = async (id) => {
    const app = applicants.find(a => a.id === id);
    if (!app || app.stepIdx <= 0) return;
    const newIdx = app.stepIdx - 1;
    setLoadingId(id);
    try {
      const res = await apiPost({ action: "update", id, stepIdx: newIdx });
      if (res.ok) setApplicants(prev => prev.map(a => a.id === id ? { ...a, stepIdx: newIdx } : a));
      else alert("更新に失敗しました");
    } catch { alert("通信エラーが発生しました"); }
    setLoadingId(null);
  };

  const reject = async (id) => {
    if (!window.confirm("不合格・終了にしますか？")) return;
    setLoadingId(id);
    try {
      const res = await apiPost({ action: "update", id, rejected: true });
      if (res.ok) setApplicants(prev => prev.map(a => a.id === id ? { ...a, rejected: true } : a));
      else alert("更新に失敗しました");
    } catch { alert("通信エラーが発生しました"); }
    setLoadingId(null);
  };

  const unreject = async (id) => {
    if (!window.confirm("対応中に戻しますか？")) return;
    setLoadingId(id);
    try {
      const res = await apiPost({ action: "update", id, rejected: false });
      if (res.ok) setApplicants(prev => prev.map(a => a.id === id ? { ...a, rejected: false } : a));
      else alert("更新に失敗しました");
    } catch { alert("通信エラーが発生しました"); }
    setLoadingId(null);
  };

  const deleteApp = async (id) => {
    if (!window.confirm("この応募者を完全に削除しますか？この操作は取り消せません。")) return;
    setLoadingId(id);
    try {
      const res = await apiPost({ action: "delete", id });
      if (res.ok) setApplicants(prev => prev.filter(a => a.id !== id));
      else alert("削除に失敗しました");
    } catch { alert("通信エラーが発生しました"); }
    setLoadingId(null);
  };

  const editNote = async (id, note) => {
    try {
      const res = await apiPost({ action: "update", id, note });
      if (res.ok) setApplicants(prev => prev.map(a => a.id === id ? { ...a, note } : a));
      else alert("メモの保存に失敗しました");
    } catch { alert("通信エラーが発生しました"); }
  };

  const editMember = async (id, member) => {
    try {
      const res = await apiPost({ action: "update", id, member });
      if (res.ok) setApplicants(prev => prev.map(a => a.id === id ? { ...a, member } : a));
      else alert("担当者の変更に失敗しました");
    } catch { alert("通信エラーが発生しました"); }
  };

  const addApp = async (form) => {
    setSaving(true);
    try {
      const res = await apiPost({ action: "add", ...form });
      if (res.ok) { setApplicants(prev => [...prev, res.data]); setShowAdd(false); }
      else alert("追加に失敗しました");
    } catch { alert("通信エラーが発生しました"); }
    setSaving(false);
  };

  const editApp = async (form) => {
    setSaving(true);
    try {
      const res = await apiPost({ action: "update", id: form.id, name: form.name, flow: form.flow, source: form.source, member: form.member });
      if (res.ok) {
        setApplicants(prev => prev.map(a => a.id === form.id ? { ...a, ...form } : a));
        setShowEdit(null);
      } else alert("更新に失敗しました");
    } catch { alert("通信エラーが発生しました"); }
    setSaving(false);
  };

  // フィルタリング
  const filtered = applicants.filter(a => {
    if (filter === "chuto" && !a.flow.startsWith("chuto")) return false;
    if (filter === "shinsotsu" && !a.flow.startsWith("shinsotsu")) return false;
    if (filter === "intern" && !a.flow.startsWith("intern")) return false;
    if (search && !a.name.includes(search)) return false;
    return true;
  });
  const active = filtered.filter(a => !a.rejected && FLOWS[a.flow]?.[a.stepIdx]?.id !== "done");
  const done = filtered.filter(a => a.rejected || FLOWS[a.flow]?.[a.stepIdx]?.id === "done");

  // アクティブ応募者を3セクションに分類
  const actionApps = active.filter(a => getStepCategory(a) === "action");
  const awaitingApps = active.filter(a => getStepCategory(a) === "awaiting");
  const scheduledApps = active.filter(a => getStepCategory(a) === "scheduled");

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24 md:pb-0">
      {/* ヘッダー */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[var(--color-outline-variant)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-headline font-extrabold text-xl text-[var(--color-primary)] tracking-tight">
              採用管理
            </h1>
          </div>
          {/* デスクトップナビ */}
          <nav className="hidden md:flex gap-1">
            {[["list", "group", "応募者一覧"], ["calendar", "calendar_month", "カレンダー"]].map(([key, icon, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === key ? "bg-[var(--color-primary-fixed)] text-[var(--color-primary)] font-bold" : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]"}`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {fetchState === "loading" && (
              <span className="text-xs text-[var(--color-outline)]">読込中…</span>
            )}
            {fetchState === "error" && (
              <span className="text-xs text-[var(--color-error)] font-medium">⚠ 接続エラー</span>
            )}
            <button
              onClick={load}
              className="p-2 rounded-xl text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] transition-colors"
              title="更新"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">応募者追加</span>
            </button>
          </div>
        </div>
      </header>

      {/* カレンダービュー */}
      {activeTab === "calendar" && <CalendarView applicants={applicants} />}

      {/* リストビュー */}
      {activeTab === "list" && (
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* ページタイトル + フィルター */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="font-headline font-extrabold text-3xl text-[var(--color-on-surface)] mb-1">応募者一覧</h2>
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                現在進行中の選考：{active.length}件
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              {/* タブフィルター */}
              <div className="bg-[var(--color-surface-container-high)] p-1 rounded-full flex gap-1 self-start">
                {FILTER_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === key ? "bg-[var(--color-primary-fixed)] text-[var(--color-primary)] shadow-sm font-bold" : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {/* 検索 */}
              <div className="relative w-full md:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] text-[20px]">search</span>
                <input
                  data-1p-ignore
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="名前で検索..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-container-low)] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3セクション */}
          {active.length === 0 && fetchState !== "loading" && (
            <div className="text-[var(--color-outline)] text-sm py-8 text-center">対応中の応募者はいません</div>
          )}

          {/* 要対応 */}
          {actionApps.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-tertiary-container text-xl">priority_high</span>
                <h3 className="font-headline font-bold text-lg text-(--color-on-surface)">
                  要対応
                  <span className="text-sm font-normal text-on-surface-variant ml-2">{actionApps.length}件</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                {actionApps.map(app => (
                  <Card
                    key={app.id} app={app}
                    onAdvance={advance} onStepBack={stepBack} onReject={reject} onUnreject={unreject}
                    onDelete={deleteApp} onEditNote={editNote} onEditMember={editMember}
                    onEdit={(a) => setShowEdit(a)}
                    expanded={expanded === app.id} onToggle={() => setExpanded(expanded === app.id ? null : app.id)}
                    loading={loadingId === app.id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 候補者返信待ち */}
          {awaitingApps.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-outline text-xl">hourglass_empty</span>
                <h3 className="font-headline font-bold text-lg text-(--color-on-surface)">
                  候補者返信待ち
                  <span className="text-sm font-normal text-on-surface-variant ml-2">{awaitingApps.length}件</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                {awaitingApps.map(app => (
                  <Card
                    key={app.id} app={app}
                    onAdvance={advance} onStepBack={stepBack} onReject={reject} onUnreject={unreject}
                    onDelete={deleteApp} onEditNote={editNote} onEditMember={editMember}
                    onEdit={(a) => setShowEdit(a)}
                    expanded={expanded === app.id} onToggle={() => setExpanded(expanded === app.id ? null : app.id)}
                    loading={loadingId === app.id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 日程確定済み */}
          {scheduledApps.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                <h3 className="font-headline font-bold text-lg text-(--color-on-surface)">
                  日程確定済み
                  <span className="text-sm font-normal text-on-surface-variant ml-2">{scheduledApps.length}件</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                {scheduledApps.map(app => (
                  <Card
                    key={app.id} app={app}
                    onAdvance={advance} onStepBack={stepBack} onReject={reject} onUnreject={unreject}
                    onDelete={deleteApp} onEditNote={editNote} onEditMember={editMember}
                    onEdit={(a) => setShowEdit(a)}
                    expanded={expanded === app.id} onToggle={() => setExpanded(expanded === app.id ? null : app.id)}
                    loading={loadingId === app.id}
                    hideStalled
                  />
                ))}
              </div>
            </section>
          )}

          {/* 完了・終了 */}
          {done.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowDone(v => !v)}
                className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider mb-4 bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="material-symbols-outlined text-[16px]">{showDone ? "expand_more" : "chevron_right"}</span>
                完了・終了 ({done.length})
              </button>
              {showDone && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                  {done.map(app => (
                    <Card
                      key={app.id}
                      app={app}
                      onAdvance={advance}
                      onStepBack={stepBack}
                      onReject={reject}
                      onUnreject={unreject}
                      onDelete={deleteApp}
                      onEditNote={editNote}
                      onEditMember={editMember}
                      onEdit={(a) => setShowEdit(a)}
                      expanded={expanded === app.id}
                      onToggle={() => setExpanded(expanded === app.id ? null : app.id)}
                      loading={loadingId === app.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* モバイルボトムナビ */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center pt-2 pb-6 px-4 bg-white/90 backdrop-blur-xl border-t border-[var(--color-outline-variant)]">
        {[["list", "group", "応募者一覧"], ["calendar", "calendar_month", "カレンダー"]].map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-col items-center justify-center px-6 py-1.5 rounded-full transition-all ${activeTab === key ? "bg-[var(--color-primary-fixed)] text-[var(--color-primary)]" : "text-[var(--color-on-surface-variant)]"}`}
          >
            <span className="material-symbols-outlined text-[24px]" style={activeTab === key ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {icon}
            </span>
            <span className="text-[11px] font-medium mt-0.5">{label}</span>
          </button>
        ))}
      </nav>

      {/* モーダル */}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addApp} saving={saving} />}
      {showEdit && <EditModal app={showEdit} onClose={() => setShowEdit(null)} onSave={editApp} saving={saving} />}
    </div>
  );
}
