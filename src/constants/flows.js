export const FLOWS = {
  chuto_casual: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容を確認する", ch: "form_entry" },
    { id: "schedule_ask", label: "希望日程確認", action: "メールで希望日程を確認" },
    { id: "schedule_fix", label: "日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "scheduledDate", dateLabel: "日程" },
    { id: "casual", label: "面談", action: "カジュアル面談を実施する" },
    { id: "done", label: "完了", action: null },
  ],
  chuto_mensetsu: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容を確認する", ch: "form_entry" },
    { id: "shorui", label: "書類選考", action: "フォーム内容をもとに書類選考する" },
    { id: "shorui_pass_ask", label: "希望日程確認", action: "メールで希望日程を確認" },
    { id: "shorui_pass_fix", label: "日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接", action: "面接を実施する" },
    { id: "interview", label: "面接合否", action: "合否を判断し、応募者へ結果を連絡する" },
    { id: "done", label: "採用決定", action: null },
  ],
  shinsotsu_kaisetsu: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容・希望日程を確認する", ch: "form_entry" },
    { id: "schedule_fix", label: "日程調整", action: "フォームの希望日程から担当者と日程を決定", dateInput: true, dateField: "scheduledDate", dateLabel: "日程" },
    { id: "kaisetsu", label: "会社説明", action: "会社説明を実施する" },
    { id: "done", label: "完了", action: null },
  ],
  shinsotsu_honsenkou: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容を確認する", ch: "form_entry" },
    { id: "shorui", label: "書類選考", action: "フォーム内容をもとに書類選考する" },
    { id: "shorui_pass_ask", label: "1次希望日程確認", action: "メールで希望日程を確認" },
    { id: "shorui_pass_fix", label: "1次日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "interview1Date", dateLabel: "1次面接日時" },
    { id: "interview1", label: "1次面接", action: "面接を実施する" },
    { id: "interview1_judge", label: "1次面接合否", action: "1次選考の合否を判断する" },
    { id: "interview2_sched_ask", label: "2次希望日程確認", action: "代表スケジュールを確認し、候補日5つ送付" },
    { id: "interview2_sched_fix", label: "2次日程調整", action: "日程が確定したら、応募者へメールで連絡 → カレンダーへ応募者情報を登録", dateInput: true, dateField: "interview2Date", dateLabel: "2次面接日時" },
    { id: "interview2", label: "2次面接", action: "面接を実施する" },
    { id: "interview2_judge", label: "2次面接合否", action: "合否を判断し、応募者へ結果を連絡する" },
    { id: "done", label: "採用決定", action: null },
  ],
  intern_site_eng: [
    { id: "entry", label: "エントリー受付", action: "Slack chでフォーム入力内容を確認する", ch: "form_entry" },
    { id: "shorui", label: "書類選考", action: "フォーム内容をもとに書類選考する" },
    { id: "schedule_ask", label: "希望日程確認", action: "メールで希望日程を確認" },
    { id: "schedule_fix", label: "日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接", action: "面接を実施する" },
    { id: "interview", label: "面接合否", action: "合否を判断し、応募者へ結果を連絡する" },
    { id: "done", label: "採用決定", action: null },
  ],
  intern_zero_eng: [
    { id: "shorui_pass", label: "書類選考通過", action: "面接の日程を調整する" },
    { id: "schedule_ask", label: "希望日程確認", action: "メールで希望日程を確認" },
    { id: "schedule_fix", label: "日程調整", action: "担当者と日程を決定し、応募者へメールで連絡する", dateInput: true, dateField: "interviewDate", dateLabel: "面接日時" },
    { id: "interview_scheduled", label: "面接", action: "面接を実施する" },
    { id: "interview", label: "面接合否", action: "合否を判断し、応募者へ結果を連絡する" },
    { id: "done", label: "採用決定", action: null },
  ],
};

export const FLOW_LABELS = {
  chuto_casual: "中途｜カジュアル面談",
  chuto_mensetsu: "中途｜採用面接",
  shinsotsu_kaisetsu: "新卒｜会社説明",
  shinsotsu_honsenkou: "新卒｜本選考",
  intern_site_eng: "長期インターン｜採用サイト",
  intern_zero_eng: "長期インターン｜ゼロワン",
};

export const FLOW_BADGE = {
  chuto_casual: { bg: "bg-[#dbe1ff]", text: "text-[#00174d]" },
  chuto_mensetsu: { bg: "bg-[#dbe1ff]", text: "text-[#00174d]" },
  shinsotsu_kaisetsu: { bg: "bg-[#ebddff]", text: "text-[#250059]" },
  shinsotsu_honsenkou: { bg: "bg-[#ebddff]", text: "text-[#250059]" },
  intern_site_eng: { bg: "bg-[#ffdad2]", text: "text-[#3d0700]" },
  intern_zero_eng: { bg: "bg-[#ffdad2]", text: "text-[#3d0700]" },
};

// 日程確定済み（当日まで待機）のステップID
export const SCHEDULED_STEP_IDS = new Set([
  "interview_scheduled", // 面接
  "casual",              // 面談
  "kaisetsu",            // 会社説明
  "interview1",          // 1次面接
  "interview2",          // 2次面接
]);

// 候補者返信待ちのステップID
export const AWAITING_STEP_IDS = new Set([
  "schedule_ask",            // 希望日程確認
  "shorui_pass_ask",         // 希望日程確認（書類通過後）
  "interview2_sched_ask",    // 2次希望日程確認
]);

export const FILTER_TABS = [
  { key: "all", label: "全員" },
  { key: "chuto", label: "中途" },
  { key: "shinsotsu", label: "新卒" },
  { key: "intern", label: "インターン" },
];

export const FLOW_OPTIONS = [
  { group: "中途", flows: ["chuto_casual", "chuto_mensetsu"] },
  { group: "新卒", flows: ["shinsotsu_kaisetsu", "shinsotsu_honsenkou"] },
  { group: "長期インターン", flows: ["intern_eng"] },
];

export const FLOW_OPTION_LABELS = {
  ...FLOW_LABELS,
  intern_eng: "長期インターン",
};
