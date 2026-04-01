import { useState, useEffect, useCallback } from "react";
import { FLOWS, FILTER_TABS } from "./constants/flows";
import { apiGet, apiPost } from "./utils/api";
import { getStepCategory } from "./utils/applicant";
import Card from "./components/Card";
import AddModal from "./components/AddModal";
import EditModal from "./components/EditModal";
import CalendarView from "./components/CalendarView";
import LoginScreen from "./components/LoginScreen";

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
      const res = await apiPost({ action: "update", id: form.id, name: form.name, flow: form.flow, source: form.source, member: form.member, stepIdx: form.stepIdx });
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

  const cardProps = (app) => ({
    app,
    onAdvance: advance,
    onStepBack: stepBack,
    onReject: reject,
    onUnreject: unreject,
    onDelete: deleteApp,
    onEditNote: editNote,
    onEditMember: editMember,
    onEdit: (a) => setShowEdit(a),
    expanded: expanded === app.id,
    onToggle: () => setExpanded(expanded === app.id ? null : app.id),
    loading: loadingId === app.id,
  });

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
                {actionApps.map(app => <Card key={app.id} {...cardProps(app)} />)}
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
                {awaitingApps.map(app => <Card key={app.id} {...cardProps(app)} />)}
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
                {scheduledApps.map(app => <Card key={app.id} {...cardProps(app)} hideStalled />)}
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
                  {done.map(app => <Card key={app.id} {...cardProps(app)} />)}
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
