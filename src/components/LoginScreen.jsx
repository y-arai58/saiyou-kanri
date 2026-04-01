import { useState } from "react";
import { APP_PASSWORD } from "../constants/config";

export default function LoginScreen({ onLogin }) {
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
