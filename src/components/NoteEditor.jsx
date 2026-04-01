import { useState, useEffect } from "react";

export default function NoteEditor({ note, onSave }) {
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
          className="text-sm text-[var(--color-on-surface-variant)] bg-white border border-[var(--color-outline-variant)] rounded-lg px-3 py-2 min-h-[34px] cursor-text whitespace-pre-wrap"
        >
          {val || <span className="text-[var(--color-outline)]">クリックしてメモを追加…</span>}
        </div>
      )}
    </div>
  );
}
