// ===================================================
//  採用管理アプリ — Google Apps Script API
//  ★ デプロイ設定：
//    - 次のユーザーとして実行：自分
//    - アクセスできるユーザー：全員
// ===================================================

const SHEET_NAME = "applicants";

const HEADERS = [
  "id", "name", "flow", "stepIdx", "member",
  "source", "note", "rejected", "created",
  "interviewDate", "scheduledDate", "interview1Date", "interview2Date",
  "stepUpdatedAt"
];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getAllRows(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    obj.stepIdx = Number(obj.stepIdx) || 0;
    obj.rejected = obj.rejected === true || obj.rejected === "TRUE";
    return obj;
  });
}

function rowToArray(obj) {
  return HEADERS.map(h => {
    if (h === "rejected") return obj[h] ? "TRUE" : "FALSE";
    return obj[h] ?? "";
  });
}

// ----- GET（全操作をクエリパラメータで処理）-----
function doGet(e) {
  try {
    const p = e.parameter;
    const action = p.action;
    const sheet = getSheet();

    if (action === "list") {
      return jsonResponse({ ok: true, data: getAllRows(sheet) });
    }

    if (action === "add") {
      const now = new Date().toISOString();
      const newRow = {
        id: Date.now().toString(),
        name: p.name,
        flow: p.flow,
        stepIdx: 0,
        member: p.member,
        source: p.source || "採用サイト",
        note: p.note || "",
        rejected: false,
        created: now.slice(0, 10),
        stepUpdatedAt: now,
      };
      sheet.appendRow(rowToArray(newRow));
      return jsonResponse({ ok: true, data: newRow });
    }

    if (action === "update") {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(p.id)) {
          const obj = {};
          HEADERS.forEach((h, j) => { obj[h] = rows[i][j]; });
          obj.stepIdx = Number(obj.stepIdx);
          obj.rejected = obj.rejected === true || obj.rejected === "TRUE";
          if (p.stepIdx !== undefined) {
            obj.stepIdx = Number(p.stepIdx);
            obj.stepUpdatedAt = new Date().toISOString();
          }
          if (p.rejected !== undefined) obj.rejected = p.rejected === "true";
          if (p.note !== undefined) obj.note = p.note;
          if (p.member !== undefined) obj.member = p.member;
          if (p.name !== undefined) obj.name = p.name;
          if (p.flow !== undefined) obj.flow = p.flow;
          if (p.source !== undefined) obj.source = p.source;
          if (p.interviewDate !== undefined) obj.interviewDate = p.interviewDate;
          if (p.scheduledDate !== undefined) obj.scheduledDate = p.scheduledDate;
          if (p.interview1Date !== undefined) obj.interview1Date = p.interview1Date;
          if (p.interview2Date !== undefined) obj.interview2Date = p.interview2Date;
          sheet.getRange(i + 1, 1, 1, HEADERS.length).setValues([rowToArray(obj)]);
          return jsonResponse({ ok: true, data: obj });
        }
      }
      return jsonResponse({ ok: false, error: "id not found" });
    }

    if (action === "delete") {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(p.id)) {
          sheet.deleteRow(i + 1);
          return jsonResponse({ ok: true });
        }
      }
      return jsonResponse({ ok: false, error: "id not found" });
    }

    return jsonResponse({ ok: false, error: "unknown action" });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
