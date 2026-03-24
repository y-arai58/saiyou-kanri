// ===================================================
//  採用管理アプリ — Google Apps Script API (OAuth版)
//  ★ デプロイ設定：アクセスできるユーザー →
//    「自分のドメインの全員（yourcompany.com）」
// ===================================================

const SHEET_NAME = "applicants";
const ALLOWED_DOMAIN = "third-scope.com"; // ★ 社内ドメインに変更

const HEADERS = [
  "id", "name", "flow", "stepIdx", "member",
  "source", "note", "rejected", "created"
];

// ----- ドメイン検証 -----
function checkDomain() {
  const email = Session.getActiveUser().getEmail();
  const domain = email.split("@")[1];
  if (domain !== ALLOWED_DOMAIN) {
    throw new Error(`アクセス拒否: ${email} はこのアプリを使用できません`);
  }
  return email;
}

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

// ----- GET -----
function doGet(e) {
  try {
    checkDomain(); // 社内アカウント検証
    const action = e.parameter.action;
    if (action === "list") {
      return jsonResponse({ ok: true, data: getAllRows(getSheet()) });
    }
    if (action === "whoami") {
      return jsonResponse({ ok: true, email: Session.getActiveUser().getEmail() });
    }
    return jsonResponse({ ok: false, error: "unknown action" });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ----- POST -----
function doPost(e) {
  try {
    checkDomain(); // 社内アカウント検証
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const sheet = getSheet();

    if (action === "add") {
      const newRow = {
        id: Date.now().toString(),
        name: body.name,
        flow: body.flow,
        stepIdx: 0,
        member: body.member,
        source: body.source || "採用サイト",
        note: body.note || "",
        rejected: false,
        created: new Date().toISOString().slice(0, 10),
      };
      sheet.appendRow(rowToArray(newRow));
      return jsonResponse({ ok: true, data: newRow });
    }

    if (action === "update") {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(body.id)) {
          const obj = {};
          HEADERS.forEach((h, j) => { obj[h] = rows[i][j]; });
          obj.stepIdx = Number(obj.stepIdx);
          obj.rejected = obj.rejected === true || obj.rejected === "TRUE";
          if (body.stepIdx !== undefined) obj.stepIdx = Number(body.stepIdx);
          if (body.rejected !== undefined) obj.rejected = body.rejected;
          if (body.note !== undefined) obj.note = body.note;
          if (body.member !== undefined) obj.member = body.member;
          sheet.getRange(i + 1, 1, 1, HEADERS.length).setValues([rowToArray(obj)]);
          return jsonResponse({ ok: true, data: obj });
        }
      }
      return jsonResponse({ ok: false, error: "id not found" });
    }

    if (action === "delete") {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(body.id)) {
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
