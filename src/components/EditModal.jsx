import { useState, useEffect } from "react";
import { FLOWS, FLOW_OPTIONS, FLOW_OPTION_LABELS } from "../constants/flows";
import { MEMBERS } from "../constants/config";
import { resolveFlow, resolveSource } from "../utils/applicant";

export default function EditModal({ app, onClose, onSave, saving }) {
  const [name, setName] = useState(app.name);
  const inferBase = (flow) => (flow.startsWith("intern") && flow.includes("eng")) ? "intern_eng" : flow;
  const inferRoute = (flow) => flow.includes("zero") ? "ゼロワン" : "採用サイト";
  const [baseFlow, setBaseFlow] = useState(inferBase(app.flow));
  const [internRoute, setInternRoute] = useState(inferRoute(app.flow));
  const [member, setMember] = useState(app.member);
  const [stepIdx, setStepIdx] = useState(app.stepIdx ?? 0);
  const isIntern = baseFlow === "intern_eng";

  const currentFlow = resolveFlow(baseFlow, internRoute);
  const flowSteps = FLOWS[currentFlow] ?? [];

  const handleFlowChange = (newBase) => {
    setBaseFlow(newBase);
    setStepIdx(0);
  };
  const handleRouteChange = (newRoute) => {
    setInternRoute(newRoute);
    setStepIdx(0);
  };

  const handleSave = () => {
    if (!name) return;
    onSave({ id: app.id, name, flow: currentFlow, source: resolveSource(baseFlow, internRoute), member, stepIdx });
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
            <select data-1p-ignore value={baseFlow} onChange={e => handleFlowChange(e.target.value)} className={inputCls}>
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
                    onClick={() => handleRouteChange(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${internRoute === r ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-white text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]"}`}
                  >{r}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider block mb-1.5">現在のステップ</label>
            <select data-1p-ignore value={stepIdx} onChange={e => setStepIdx(Number(e.target.value))} className={inputCls}>
              {flowSteps.map((s, i) => (
                <option key={i} value={i}>{i + 1}. {s.label}</option>
              ))}
            </select>
          </div>
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
