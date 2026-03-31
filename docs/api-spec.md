# API・データ仕様書

採用管理アプリのバックエンドは Google Apps Script (GAS) で実装されており、Google Sheets をデータストアとして使用します。

---

## 概要

| 項目 | 内容 |
|---|---|
| バックエンド | Google Apps Script (GAS) |
| データストア | Google Sheets（シート名: `applicants`） |
| 通信方式 | HTTP GET（クエリパラメータ） |
| レスポンス形式 | JSON |
| 認証 | なし（URLを知っている全員がアクセス可） |

> **GETのみを使用する理由**
> GASはPOSTリクエストのCORSプリフライト（OPTIONS）に対応していないため、書き込み操作も含めてすべてGETクエリパラメータで送信します。

---

## エンドポイント

```
GET {GAS_URL}?action={action}&{params}
```

`GAS_URL` は環境変数 `VITE_GAS_URL` で設定します。

---

## アクション一覧

### `list` — 応募者一覧取得

応募者全件を取得します。

**リクエスト**

```
GET {GAS_URL}?action=list
```

**レスポンス**

```json
{
  "ok": true,
  "data": [
    {
      "id": "1710000000000",
      "name": "山田 太郎",
      "flow": "shinsotsu_honsenkou",
      "stepIdx": 2,
      "member": "新井",
      "source": "採用サイト",
      "note": "積極的な印象",
      "rejected": false,
      "created": "2024-03-10",
      "interviewDate": "",
      "scheduledDate": "",
      "interview1Date": "2024-03-15 14:00",
      "interview2Date": "",
      "stepUpdatedAt": "2024-03-12T09:00:00.000Z"
    }
  ]
}
```

---

### `add` — 応募者追加

新しい応募者を追加します。`id`・`created`・`stepUpdatedAt` はサーバー側で自動生成されます。

**リクエスト**

```
GET {GAS_URL}?action=add&name={name}&flow={flow}&member={member}&source={source}&note={note}
```

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | ✓ | 氏名 |
| `flow` | string | ✓ | フローID（フロー定義参照） |
| `member` | string | ✓ | 担当者名 |
| `source` | string | | 応募経路（省略時: `"採用サイト"`） |
| `note` | string | | メモ（省略時: `""`） |

**レスポンス**

```json
{
  "ok": true,
  "data": {
    "id": "1710000000000",
    "name": "山田 太郎",
    "flow": "shinsotsu_honsenkou",
    "stepIdx": 0,
    "member": "新井",
    "source": "採用サイト",
    "note": "",
    "rejected": false,
    "created": "2024-03-10",
    "stepUpdatedAt": "2024-03-10T09:00:00.000Z"
  }
}
```

---

### `update` — 応募者情報更新

指定した `id` の応募者情報を部分更新します。指定したフィールドのみ更新されます。

**リクエスト**

```
GET {GAS_URL}?action=update&id={id}&{更新フィールド}={値}
```

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | string | ✓ | 応募者ID |
| `stepIdx` | number | | 現在のステップインデックス（更新時に `stepUpdatedAt` も自動更新） |
| `rejected` | boolean | | 不合格・辞退フラグ（`"true"` / `"false"` の文字列で送信） |
| `name` | string | | 氏名 |
| `flow` | string | | フローID |
| `source` | string | | 応募経路 |
| `member` | string | | 担当者名 |
| `note` | string | | メモ |
| `interviewDate` | string | | 面接日時（インターン用） |
| `scheduledDate` | string | | 会社説明・面談日時 |
| `interview1Date` | string | | 1次面接日時（新卒本選考用） |
| `interview2Date` | string | | 2次面接日時（新卒本選考用） |

> **注意**
> `stepIdx` と `rejected` は文字列として送信します（`URLSearchParams` の制約）。GAS側で型変換します。

**レスポンス（成功）**

```json
{
  "ok": true,
  "data": { /* 更新後の応募者オブジェクト */ }
}
```

**レスポンス（IDが見つからない場合）**

```json
{
  "ok": false,
  "error": "id not found"
}
```

---

### `delete` — 応募者削除

指定した `id` の応募者を完全削除します。

**リクエスト**

```
GET {GAS_URL}?action=delete&id={id}
```

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | string | ✓ | 削除対象の応募者ID |

**レスポンス（成功）**

```json
{ "ok": true }
```

**レスポンス（IDが見つからない場合）**

```json
{
  "ok": false,
  "error": "id not found"
}
```

---

## エラーレスポンス

GAS内で例外が発生した場合は以下を返します。

```json
{
  "ok": false,
  "error": "エラーメッセージ"
}
```

不明なアクションを指定した場合：

```json
{
  "ok": false,
  "error": "unknown action"
}
```

---

## データスキーマ

### 応募者オブジェクト

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | string | 一意のID（`Date.now()` の文字列） |
| `name` | string | 氏名 |
| `flow` | string | フローID |
| `stepIdx` | number | 現在のステップインデックス（0始まり） |
| `member` | string | 担当者名 |
| `source` | string | 応募経路（`"採用サイト"` / `"ゼロワン"` 等） |
| `note` | string | 担当者メモ |
| `rejected` | boolean | 不合格・辞退フラグ |
| `created` | string | 登録日（`YYYY-MM-DD` 形式） |
| `interviewDate` | string | 面接日時（インターン用） |
| `scheduledDate` | string | 会社説明・面談日時 |
| `interview1Date` | string | 1次面接日時（新卒本選考用） |
| `interview2Date` | string | 2次面接日時（新卒本選考用） |
| `stepUpdatedAt` | string | ステップ最終更新日時（ISO 8601形式） |

### Google Sheets のカラム順

```
id | name | flow | stepIdx | member | source | note | rejected | created |
interviewDate | scheduledDate | interview1Date | interview2Date | stepUpdatedAt
```

- `rejected` は Sheets 上では `"TRUE"` / `"FALSE"` の文字列で保存されます
- `stepIdx` は Sheets 上では数値として保存されます

---

## 日程フィールドの書式

日程フィールドの値は `"YYYY-MM-DD HH:MM"` 形式の文字列です。

```
例: "2024-03-15 14:00"
```

時刻の選択肢は 11:00〜19:00 の 30分刻み（17候補）です。

---

## GAS デプロイ設定

| 項目 | 設定値 |
|---|---|
| 実行ユーザー | 自分（スクリプトオーナー） |
| アクセス権限 | 全員 |
| デプロイ種別 | ウェブアプリ |

---

## フロントエンド側の実装

### apiGet（一覧取得）

```js
async function apiGet(action) {
  const res = await fetch(`${GAS_URL}?action=${action}`);
  return res.json();
}
```

### apiPost（追加・更新・削除）

```js
async function apiPost(body) {
  const params = { ...body };
  if (params.rejected !== undefined) params.rejected = String(params.rejected);
  if (params.stepIdx !== undefined) params.stepIdx = String(params.stepIdx);
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GAS_URL}?${qs}`);
  return res.json();
}
```

### 使用例

```js
// 一覧取得
const { data } = await apiGet("list");

// 応募者追加
await apiPost({ action: "add", name: "山田 太郎", flow: "shinsotsu_honsenkou", member: "新井" });

// ステップ更新
await apiPost({ action: "update", id: "1710000000000", stepIdx: 3 });

// 不合格フラグ
await apiPost({ action: "update", id: "1710000000000", rejected: true });

// 削除
await apiPost({ action: "delete", id: "1710000000000" });
```
