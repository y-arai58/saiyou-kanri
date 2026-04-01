import { useState } from "react";

export default function CopyBtn({ url }) {
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
