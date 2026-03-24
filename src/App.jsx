import { useState, useEffect, useCallback } from "react";

// =====================================================
//  ★ 変更箇所（3か所）
// =====================================================
const GAS_URL = "https://script.google.com/macros/s/AKfycbzf-T6-DqvsWFvFLqu2he6-EEuAIA8H5pQX-pMLzt5MISkICd2_nQRomYMGuSGcbNGcmQ/exec";

const FORMS = {
  chuto: { label: "中途用フォーム", url: "https://forms.gle/2hCrxjyyHc1D3n9h9" },
  shinsotsu: { label: "新卒用フォーム", url: "https://forms.gle/hXtBrh55Y3b3KxvW6" },
  interneng: { label: "長期インターン用フォーム（エンジニア）", url: "https://docs.google.com/forms/d/e/1FAIpQLScfBDAJ6RpE5I5bVVHC072Ri38Y2TFMs0dSeStLvTp7ApscXQ/viewform" },
  internmar: { label: "長期インターン用フォーム（広報・マーケター）", url: "https://docs.google.com/forms/d/e/1FAIpQLSdY7jLUrvZkDy89Zb9tPE0zy1JnKzF8hMf00I4wtdmL333igQ/viewform" },
};

const CH = {
  form_entry: { label: "採用フォーム入力通知", url: "https://third-scope.slack.com/archives/C0AJWFB9NDD" },
};

const MEMBERS = ["新井", "中里", "早川", "クリス", "油谷"];

// =====================================================
//  フロー定義
// =====================================================
const FLOWS = {
  chuto_kaisetsu: [
    { id: "entry", label: "エントリー受付", action: "中途用フォームを送付＋日程調整を行う", form: "chuto" },
    { id: "schedule", label: "フォーム入力待ち&日程調整中", action: "メールで日程調整し、確定次第で担当者へ連絡。フォーム入力内容はchに通知が来るので確認し、ステータスを更新", dateInput: true, dateField: "scheduledDate", dateLabel: "日程", ch: "form_entry" },
    { id: "kaisetsu", label: "会社説明（日程確定済み）", action: "会社説明を実施する" },
    { id: "done", label: "会社説明完了", action: null },
  ],
  chuto_casual: [
    { id: "entry", label: "エントリー受付", action: "中途用フォームを送付＋カジュアル面談の日程を調整する", form: "chuto" },
    { id: "schedule", label: "フォーム入力待ち&日程調整中", action: "メールで日程調整し、確定次第で担当者へ連絡。フォーム入力内容はchに通知が来るので確認し、ステータスを更新", dateInput: true, dateField: "scheduledDate", dateLabel: "日程", ch: "form_entry" },
    { id: "casual", label: "面談(日程確定済み)", action: "面接希望の場合は再エントリーを促す" },
    { id: "done", label: "面談完了", action: null },
  ],
  shinsotsu_kaisetsu: [
    { id: "entry", label: "エントリー受付", action: "新卒用フォームを送付＋会社説明の日程を調整する", form: "shinsotsu" },
    { id: "schedule", label: "フォーム入力待ち＆日程調整中", action: "メールで日程調整し、確定次第で担当者へ連絡。フォーム入力内容はchに通知が来るので確認し、ステータスを更新", dateInput: true, dateField: "scheduledDate", dateLabel: "日程", ch: "form_entry" },
    { id: "kaisetsu", label: "会社説明（日程確定済み）", action: "会社説明を実施する" },
    { id: "done", label: "会社説明完了", action: null },
  ],
  shinsotsu_honsenkou: [
    { id: "entry", label: "エントリー受付", action: "新卒用フォームを送付する", form: "shinsotsu" },
    { id: "entry_done", label: "フォーム入力待ち", action: "入力されたらchに通知が来るので確認し、ステータスを更新", ch: "form_entry" },
    { id: "shorui", label: "書類選考中", action: "フォーム内容をもとに書類選考する" },
    { id: "shorui_pass", label: "書類通過・日程調整中", action: "通過メール＋1次面接の日程調整を同メールで送付する", dateInput: true, dateField: "interview1Date", dateLabel: "1次面接日時" },
    { id: "interview1", label: "1次面接（日程確定済み）", action: "面接を実施する" },
    { id: "interview1_judge", label: "1次面接実施済み", action: "1次選考の合否を判断する" },
    { id: "interview2_sched", label: "2次日程調整中", action: "代表スケジュール確認 → 候補日5つ送付 ＋ 応募者情報を代表へ共有", dateInput: true, dateField: "interview2Date", dateLabel: "2次面接日時" },
    { id: "interview2", label: "2次面接（日程確定済み）", action: "面接を実施する" },
    { id: "interview2_judge", label: "2次面接実施済み", action: "2次選考の合否を判断する" },
    { id: "done", label: "採用決定", action: null },
  ],
  // 長期インターン：採用サイト経由（エンジニア・デザイナー）
  intern_site_eng: [
    { id: "entry", label: "エントリー受付", action: "長期インターン用フォーム（エンジニア）を送付する", form: "interneng" },
    { id: "shorui", label: "書類選考中", action: "フォーム内容をもとに書類選考する" },
    { id: "schedule", label: "面接日程調整中", action: "メールで日程調整し、確定次第で担当者へ連絡", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接（日程確定済み）", action: "面接を実施する" },
    { id: "interview", label: "面接実施済", action: "合否を判断する" },
    { id: "done", label: "採用決定", action: null },
  ],
  // 長期インターン：採用サイト経由（広報・マーケター）
  intern_site_mar: [
    { id: "entry", label: "エントリー受付", action: "長期インターン用フォーム（広報・マーケター）を送付する", form: "internmar" },
    { id: "shorui", label: "書類選考中", action: "フォーム内容をもとに書類選考する" },
    { id: "schedule", label: "面接日程調整中", action: "面接の日程を確定する", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接（日程確定済み）", action: "面接を実施する" },
    { id: "interview", label: "面接実施済", action: "合否を判断する" },
    { id: "done", label: "採用決定", action: null },
  ],
  // 長期インターン：ゼロワン経由（エンジニア）
  intern_zero_eng: [
    { id: "shorui_pass", label: "書類選考通過", action: "面接の日程を調整する" },
    { id: "schedule", label: "面接日程調整中", action: "確定次第で担当者へ連絡", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接（日程確定済み）", action: "面接を実施する" },
    { id: "interview", label: "面接実施済", action: "合否を判断する" },
    { id: "done", label: "採用決定", action: null },
  ],
  // 長期インターン：ゼロワン経由（広報・マーケター）
  intern_zero_mar: [
    { id: "shorui_pass", label: "書類選考通過", action: "面接の日程を調整する" },
    { id: "schedule", label: "面接日程調整中", action: "確定次第で担当者へ連絡", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接（日程確定済み）", action: "面接を実施する" },
    { id: "interview", label: "面接実施済", action: "合否を判断する" },
    { id: "done", label: "採用決定", action: null },
  ],
  // 長期インターン：採用サイト経由・会社説明（エンジニア）
  intern_site_kaisetsu_eng: [
    { id: "entry", label: "エントリー受付", action: "会社説明の日程を調整する" },
    { id: "schedule", label: "日程調整中", action: "メールで日程調整し、確定次第で担当者へ連絡", dateInput: true, dateField: "scheduledDate", dateLabel: "日程" },
    { id: "kaisetsu", label: "会社説明（日程確定済み）", action: "会社説明を実施する" },
    { id: "done", label: "会社説明完了", action: null },
  ],
  // 長期インターン：採用サイト経由・会社説明（広報・マーケター）
  intern_site_kaisetsu_mar: [
    { id: "entry", label: "エントリー受付", action: "会社説明の日程を調整する" },
    { id: "schedule", label: "日程調整中", action: "メールで日程調整し、確定次第で担当者へ連絡", dateInput: true, dateField: "scheduledDate", dateLabel: "日程" },
    { id: "kaisetsu", label: "会社説明（日程確定済み）", action: "会社説明を実施する" },
    { id: "done", label: "会社説明完了", action: null },
  ],
};

const FLOW_LABELS = {
  chuto_kaisetsu: "中途｜会社説明",
  chuto_casual: "中途｜カジュアル面談",
  shinsotsu_kaisetsu: "新卒｜会社説明",
  shinsotsu_honsenkou: "新卒｜本選考",
  intern_site_eng: "長期インターン｜採用サイト・エンジニア",
  intern_site_mar: "長期インターン｜採用サイト・マーケ",
  intern_zero_eng: "長期インターン｜ゼロワン・エンジニア",
  intern_zero_mar: "長期インターン｜ゼロワン・マーケ",
  intern_site_kaisetsu_eng: "長期インターン｜採用サイト・会社説明・エンジニア",
  intern_site_kaisetsu_mar: "長期インターン｜採用サイト・会社説明・マーケ",
};

const FLOW_COLORS = {
  chuto_kaisetsu: "#c0392b",
  chuto_casual: "#e05a3a",
  shinsotsu_kaisetsu: "#1a56db",
  shinsotsu_honsenkou: "#2d6be4",
  intern_site_eng: "#6d28d9",
  intern_site_mar: "#b45309",
  intern_zero_eng: "#7c3aed",
  intern_zero_mar: "#d4830a",
  intern_site_kaisetsu_eng: "#0d9488",
  intern_site_kaisetsu_mar: "#059669",
};

// 追加モーダル用：グループ化した選択肢（応募経路はインターン選択時に別途切り替え）
const FLOW_OPTIONS = [
  { group: "中途", flows: ["chuto_kaisetsu", "chuto_casual"] },
  { group: "新卒", flows: ["shinsotsu_kaisetsu", "shinsotsu_honsenkou"] },
  { group: "長期インターン", flows: ["intern_eng", "intern_mar"] },
];

const FLOW_OPTION_LABELS = {
  ...FLOW_LABELS,
  intern_eng: "長期インターン｜エンジニア",
  intern_mar: "長期インターン｜マーケ",
};

// baseFlow + internRoute + siteSubType → 実際のフローキー・応募経路
function resolveFlow(baseFlow, internRoute, siteSubType) {
  if (baseFlow === "intern_eng") {
    if (internRoute === "ゼロワン") return "intern_zero_eng";
    return siteSubType === "会社説明" ? "intern_site_kaisetsu_eng" : "intern_site_eng";
  }
  if (baseFlow === "intern_mar") {
    if (internRoute === "ゼロワン") return "intern_zero_mar";
    return siteSubType === "会社説明" ? "intern_site_kaisetsu_mar" : "intern_site_mar";
  }
  return baseFlow;
}
function resolveSource(baseFlow, internRoute) {
  return (baseFlow === "intern_eng" || baseFlow === "intern_mar") ? internRoute : "採用サイト";
}

// =====================================================
//  API
// =====================================================
// データ取得（list）
async function apiGet(action) {
  const res = await fetch(`${GAS_URL}?action=${action}`);
  return res.json();
}

// データ書き込み（add / update）
// ※ GASはPOSTのCORSプリフライトに対応していないため、GETクエリパラメータで送信する
// ※ URLSearchParams は文字列のみ受け付けるので boolean/number は事前に変換
async function apiPost(body) {
  const params = { ...body };
  if (params.rejected !== undefined) params.rejected = String(params.rejected);
  if (params.stepIdx !== undefined) params.stepIdx = String(params.stepIdx);
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GAS_URL}?${qs}`);
  return res.json();
}

// フローの全ステップから dateField を収集（重複除去）
function getFlowDateFields(flow) {
  const seen = new Set();
  return (FLOWS[flow] ?? []).filter(s => s.dateInput && s.dateField).reduce((acc, s) => {
    if (!seen.has(s.dateField)) { seen.add(s.dateField); acc.push({ field: s.dateField, label: s.dateLabel }); }
    return acc;
  }, []);
}

// =====================================================
//  ユーティリティ
// =====================================================
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

// =====================================================
//  小コンポーネント
// =====================================================
function Tag({ flow }) {
  const c = FLOW_COLORS[flow];
  return (
    <span style={{
      background: c + "18", color: c, border: `1px solid ${c}40`,
      borderRadius: 4, fontSize: 11, fontWeight: 700,
      padding: "2px 8px", whiteSpace: "nowrap",
    }}>{FLOW_LABELS[flow]}</span>
  );
}

function StepBar({ flow, stepIdx }) {
  const steps = FLOWS[flow] ?? [];
  const c = FLOW_COLORS[flow];
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
      {steps.map((s, i) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{
            width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
            background: i <= stepIdx ? c : "#ddd",
            outline: i === stepIdx ? `3px solid ${c}40` : "none",
          }} />
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < stepIdx ? c : "#e8e8e8", minWidth: 6 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function CopyBtn({ url }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 1500); }}
      style={{
        fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid #ccc",
        background: ok ? "#e8f5e9" : "#f5f5f5", color: ok ? "#2e7d32" : "#555",
        cursor: "pointer", fontWeight: 600,
      }}>
      {ok ? "コピー済" : "URLコピー"}
    </button>
  );
}

function NoteEditor({ note, onSave }) {
  const [val, setVal] = useState(note);
  const [editing, setEditing] = useState(false);
  useEffect(() => { setVal(note); }, [note]);
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, color: "#999", fontWeight: 700, marginBottom: 4 }}>メモ</div>
      {editing ? (
        <div>
          <textarea value={val} onChange={e => setVal(e.target.value)} rows={2}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <button onClick={() => { onSave(val); setEditing(false); }}
              style={{ fontSize: 12, padding: "4px 14px", borderRadius: 5, border: "none", background: "#1a1a1a", color: "#fff", cursor: "pointer", fontWeight: 700 }}>保存</button>
            <button onClick={() => { setVal(note); setEditing(false); }}
              style={{ fontSize: 12, padding: "4px 12px", borderRadius: 5, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>キャンセル</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setEditing(true)} style={{
          fontSize: 13, color: val ? "#333" : "#bbb", background: "#fff",
          border: "1px solid #eee", borderRadius: 6, padding: "8px 12px", cursor: "text", minHeight: 34,
        }}>
          {val || "クリックしてメモを追加…"}
        </div>
      )}
    </div>
  );
}

// =====================================================
//  応募者カード
// =====================================================
function Card({ app, onAdvance, onStepBack, onReject, onEditNote, onEditMember, expanded, onToggle, loading }) {
  const steps = FLOWS[app.flow] ?? [];
  const step = steps[app.stepIdx];
  const next = steps[app.stepIdx + 1];
  const isDone = step?.id === "done" || app.rejected;
  const c = FLOW_COLORS[app.flow];
  const [pendingDate, setPendingDate] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");

  return (
    <div style={{
      background: "#fff", border: `1px solid ${expanded ? c + "70" : "#e8e8e8"}`,
      borderRadius: 10, marginBottom: 10, overflow: "hidden",
      boxShadow: expanded ? `0 2px 14px ${c}1a` : "0 1px 3px #0000000a",
      opacity: loading ? 0.6 : 1, transition: "opacity 0.2s, border-color 0.2s",
    }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: c + "22", color: c,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 15,
        }}>{app.name[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{app.name}</span>
            <Tag flow={app.flow} />
            {app.rejected && <span style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>終了</span>}
            {!app.rejected && step?.id === "done" && <span style={{ fontSize: 11, color: "#43a047", fontWeight: 700 }}>✓ 採用完了</span>}
          </div>
          <StepBar flow={app.flow} stepIdx={app.stepIdx} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "#777", background: "#f2f2f2", borderRadius: 4, padding: "2px 8px" }}>{app.member}</span>
          <span style={{ fontSize: 16, color: "#bbb", display: "inline-block", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>⌄</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "14px 16px", background: "#fafafa" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180, background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 700, marginBottom: 4 }}>現在のステータス</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: isDone ? "#43a047" : "#1a1a1a" }}>
                {app.rejected ? "不合格・終了" : step?.label}
              </div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{app.stepIdx + 1} / {steps.length} ステップ</div>
            </div>
            {!isDone && step?.action && (
              <div style={{ flex: 2, minWidth: 200, background: c + "0d", border: `1px solid ${c}30`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: c, fontWeight: 700, marginBottom: 4 }}>次にやること</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a" }}>{step.action}</div>
                {step.form && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>{FORMS[step.form].label}</span>
                    <CopyBtn url={FORMS[step.form].url} />
                  </div>
                )}
                {step.ch && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>{CH[step.ch].label}</span>
                    <a href={CH[step.ch].url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#f5f5f5", color: "#555", cursor: "pointer", fontWeight: 600, textDecoration: "none" }}>
                      chを開く
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>応募経路: {app.source}</span>
            <span>応募日: {formatDate(app.created)}</span>
            {getFlowDateFields(app.flow).map(({ field, label }) => app[field] && (
              <span key={field} style={{ color: "#6d28d9", fontWeight: 700 }}>{label}: {formatDateTime(app[field])}</span>
            ))}
          </div>

          <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#777", fontWeight: 600 }}>担当者:</span>
            <select value={app.member} onChange={e => onEditMember(app.id, e.target.value)}
              style={{ fontSize: 13, padding: "4px 8px", borderRadius: 6, border: "1px solid #ddd" }}>
              {MEMBERS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <NoteEditor note={app.note} onSave={note => onEditNote(app.id, note)} />

          {!isDone && (
            <div style={{ marginTop: 12 }}>
              {next && step?.dateInput && pendingDate ? (
                <div style={{ background: c + "0d", border: `1px solid ${c}30`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: c, fontWeight: 700, marginBottom: 8 }}>{step.dateLabel}を入力してください</div>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, marginBottom: 10, display: "block" }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { onAdvance(app.id, interviewDate, step.dateField); setPendingDate(false); setInterviewDate(""); }}
                      disabled={loading || !interviewDate}
                      style={{
                        padding: "8px 18px", borderRadius: 6, border: "none",
                        background: interviewDate ? c : "#ccc", color: "#fff", fontWeight: 700, fontSize: 13, cursor: interviewDate ? "pointer" : "default",
                      }}
                    >確定 → {next.label}</button>
                    <button onClick={() => { setPendingDate(false); setInterviewDate(""); }} style={{
                      padding: "8px 14px", borderRadius: 6, border: "1px solid #ddd",
                      background: "#fff", fontSize: 13, cursor: "pointer",
                    }}>キャンセル</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {next && (
                    <button
                      onClick={() => step?.dateInput ? setPendingDate(true) : onAdvance(app.id)}
                      disabled={loading}
                      style={{
                        padding: "9px 20px", borderRadius: 6, border: "none",
                        background: c, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      }}
                    >次へ → {next.label}</button>
                  )}
                  <button onClick={() => onReject(app.id)} disabled={loading} style={{
                    padding: "9px 18px", borderRadius: 6, border: "1px solid #e0e0e0",
                    background: "#fff", color: "#c0392b", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  }}>不合格・終了</button>
                </div>
              )}
              {app.stepIdx > 0 && !pendingDate && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => onStepBack(app.id)} disabled={loading} style={{
                    fontSize: 11, color: "#bbb", background: "none", border: "none",
                    cursor: "pointer", padding: 0, textDecoration: "underline",
                  }}>← 前のステップに戻す</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
//  追加モーダル（グループ付きselect）
// =====================================================
function AddModal({ onClose, onAdd, saving }) {
  const [name, setName] = useState("");
  const [baseFlow, setBaseFlow] = useState("shinsotsu_honsenkou");
  const [internRoute, setInternRoute] = useState("採用サイト");
  const [siteSubType, setSiteSubType] = useState("インターン応募");
  const [member, setMember] = useState(MEMBERS[0]);
  const [note, setNote] = useState("");
  const isIntern = baseFlow === "intern_eng" || baseFlow === "intern_mar";
  const isSite = isIntern && internRoute === "採用サイト";
  const s = { width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" };
  const handleAdd = () => {
    if (!name) return;
    onAdd({ name, flow: resolveFlow(baseFlow, internRoute, siteSubType), source: resolveSource(baseFlow, internRoute), member, note });
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000060", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 440, maxWidth: "92vw", boxShadow: "0 8px 40px #0003" }}>
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20 }}>応募者を追加</div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "#666", fontWeight: 700, display: "block", marginBottom: 4 }}>氏名</label>
          <input value={name} onChange={e => setName(e.target.value)} style={s} placeholder="例: 山田 太郎" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "#666", fontWeight: 700, display: "block", marginBottom: 4 }}>フロー</label>
          <select value={baseFlow} onChange={e => setBaseFlow(e.target.value)} style={s}>
            {FLOW_OPTIONS.map(({ group, flows }) => (
              <optgroup key={group} label={group}>
                {flows.map(k => (
                  <option key={k} value={k}>{FLOW_OPTION_LABELS[k]}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {isIntern && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#666", fontWeight: 700, display: "block", marginBottom: 6 }}>応募経路</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["採用サイト", "ゼロワン"].map(r => (
                <button key={r} onClick={() => setInternRoute(r)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  border: internRoute === r ? "2px solid #1a1a1a" : "1px solid #ddd",
                  background: internRoute === r ? "#1a1a1a" : "#fff",
                  color: internRoute === r ? "#fff" : "#555",
                }}>{r}</button>
              ))}
            </div>
          </div>
        )}
        {isSite && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#666", fontWeight: 700, display: "block", marginBottom: 6 }}>フロー種別</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["インターン応募", "会社説明"].map(t => (
                <button key={t} onClick={() => setSiteSubType(t)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  border: siteSubType === t ? "2px solid #0d9488" : "1px solid #ddd",
                  background: siteSubType === t ? "#0d9488" : "#fff",
                  color: siteSubType === t ? "#fff" : "#555",
                }}>{t}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "#666", fontWeight: 700, display: "block", marginBottom: 4 }}>担当者</label>
          <select value={member} onChange={e => setMember(e.target.value)} style={s}>
            {MEMBERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#666", fontWeight: 700, display: "block", marginBottom: 4 }}>メモ（任意）</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            style={{ ...s, resize: "none" }} placeholder="初期メモがあれば…" />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 14 }}>キャンセル</button>
          <button onClick={handleAdd} disabled={!name || saving}
            style={{ padding: "9px 22px", borderRadius: 6, border: "none", background: name ? "#1a1a1a" : "#ccc", color: "#fff", fontWeight: 700, fontSize: 14, cursor: name ? "pointer" : "default" }}>
            {saving ? "追加中…" : "追加"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
//  メインアプリ
// =====================================================
export default function App() {
  const [applicants, setApplicants] = useState([]);
  const [fetchState, setFetchState] = useState("idle");
  const [loadingId, setLoadingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    setFetchState("loading");
    try {
      const res = await apiGet("list");
      if (res.ok) { setApplicants(res.data); setFetchState("idle"); }
      else setFetchState("error");
    } catch { setFetchState("error"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const advance = async (id, dateValue, dateField) => {
    const app = applicants.find(a => a.id == id);
    if (!app) return;
    const newIdx = app.stepIdx + 1;
    setLoadingId(id);
    const body = { action: "update", id, stepIdx: newIdx };
    if (dateValue && dateField) body[dateField] = dateValue;
    const res = await apiPost(body);
    if (res.ok) setApplicants(prev => prev.map(a =>
      a.id == id ? { ...a, stepIdx: newIdx, ...(dateValue && dateField ? { [dateField]: dateValue } : {}) } : a
    ));
    setLoadingId(null);
  };

  const stepBack = async (id) => {
    const app = applicants.find(a => a.id == id);
    if (!app || app.stepIdx <= 0) return;
    const newIdx = app.stepIdx - 1;
    setLoadingId(id);
    const res = await apiPost({ action: "update", id, stepIdx: newIdx });
    if (res.ok) setApplicants(prev => prev.map(a => a.id == id ? { ...a, stepIdx: newIdx } : a));
    setLoadingId(null);
  };

  const reject = async (id) => {
    if (!window.confirm("不合格・終了にしますか？")) return;
    setLoadingId(id);
    const res = await apiPost({ action: "update", id, rejected: true });
    if (res.ok) setApplicants(prev => prev.map(a => a.id == id ? { ...a, rejected: true } : a));
    setLoadingId(null);
  };

  const editNote = async (id, note) => { await apiPost({ action: "update", id, note }); setApplicants(prev => prev.map(a => a.id == id ? { ...a, note } : a)); };
  const editMember = async (id, member) => { await apiPost({ action: "update", id, member }); setApplicants(prev => prev.map(a => a.id == id ? { ...a, member } : a)); };

  const addApp = async (form) => {
    setSaving(true);
    const res = await apiPost({ action: "add", ...form });
    if (res.ok) { setApplicants(prev => [...prev, res.data]); setShowAdd(false); }
    setSaving(false);
  };

  const filtered = applicants.filter(a => {
    if (filter !== "all" && a.flow !== filter) return false;
    if (search && !a.name.includes(search)) return false;
    return true;
  });
  const active = filtered.filter(a => !a.rejected && FLOWS[a.flow]?.[a.stepIdx]?.id !== "done");
  const done = filtered.filter(a => a.rejected || FLOWS[a.flow]?.[a.stepIdx]?.id === "done");

  return (
    <div style={{ fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif", background: "#f2f2f0", minHeight: "100vh", paddingBottom: 60 }}>
      <div style={{ background: "#1a1a1a", color: "#fff", padding: "16px 24px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>採用管理</div>
        <div style={{ flex: 1 }} />
        {fetchState === "loading" && <span style={{ fontSize: 12, color: "#aaa" }}>読込中…</span>}
        {fetchState === "error" && <span style={{ fontSize: 12, color: "#f87171" }}>⚠ スプシ接続エラー — GAS URLを確認してください</span>}
        <span style={{ fontSize: 13, color: "#aaa" }}>対応中 {active.length}名</span>
        <button onClick={load} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #444", background: "transparent", color: "#ccc", fontSize: 12, cursor: "pointer" }}>更新</button>
        <button onClick={() => setShowAdd(true)} style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#fff", color: "#1a1a1a", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ 追加</button>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "20px 16px 0" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="氏名で検索…"
            style={{ padding: "7px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, width: 160 }} />
          <button onClick={() => setFilter("all")} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid #ddd", fontSize: 12,
            background: filter === "all" ? "#1a1a1a" : "#fff", color: filter === "all" ? "#fff" : "#555", cursor: "pointer", fontWeight: 600,
          }}>すべて</button>
          {Object.entries(FLOW_LABELS).map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: "6px 12px", borderRadius: 20, fontSize: 12,
              border: `1px solid ${FLOW_COLORS[k]}50`,
              background: filter === k ? FLOW_COLORS[k] : FLOW_COLORS[k] + "12",
              color: filter === k ? "#fff" : FLOW_COLORS[k],
              cursor: "pointer", fontWeight: 600,
            }}>{v}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 10, letterSpacing: "0.04em" }}>対応中 ({active.length})</div>
        {active.length === 0 && fetchState !== "loading" && (
          <div style={{ color: "#bbb", fontSize: 14, padding: "20px 0" }}>対応中の応募者はいません</div>
        )}
        {active.map(app => (
          <Card key={app.id} app={app}
            onAdvance={advance} onStepBack={stepBack} onReject={reject} onEditNote={editNote} onEditMember={editMember}
            expanded={expanded === app.id} onToggle={() => setExpanded(expanded === app.id ? null : app.id)}
            loading={loadingId === app.id} />
        ))}

        {done.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <button onClick={() => setShowDone(v => !v)} style={{
              fontSize: 12, fontWeight: 700, color: "#aaa", background: "none", border: "none",
              cursor: "pointer", letterSpacing: "0.04em", padding: 0, marginBottom: 10,
            }}>{showDone ? "▾" : "▸"} 完了・終了 ({done.length})</button>
            {showDone && done.map(app => (
              <Card key={app.id} app={app}
                onAdvance={advance} onStepBack={stepBack} onReject={reject} onEditNote={editNote} onEditMember={editMember}
                expanded={expanded === app.id} onToggle={() => setExpanded(expanded === app.id ? null : app.id)}
                loading={loadingId === app.id} />
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addApp} saving={saving} />}
    </div>
  );
}
