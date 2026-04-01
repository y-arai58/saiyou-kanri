export const GAS_URL = import.meta.env.VITE_GAS_URL;
export const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

export const FORMS = {
  chuto: { label: "中途用フォーム", url: "https://forms.gle/2hCrxjyyHc1D3n9h9" },
  shinsotsu: { label: "新卒用フォーム", url: "https://forms.gle/hXtBrh55Y3b3KxvW6" },
  interneng: { label: "長期インターン用フォーム（エンジニア・デザイナー）", url: "https://docs.google.com/forms/d/e/1FAIpQLScfBDAJ6RpE5I5bVVHC072Ri38Y2TFMs0dSeStLvTp7ApscXQ/viewform" },
};

export const CH = {
  form_entry: { label: "採用フォーム入力通知", url: "https://third-scope.slack.com/archives/C0AJWFB9NDD" },
};

export const MEMBERS = ["新井", "中里", "早川", "クリス", "油谷", "伊藤"];

export const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const h = String(11 + Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});
