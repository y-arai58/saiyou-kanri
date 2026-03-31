# 採用管理システム 仕様書

**バージョン**: 1.0
**更新日**: 2026-03-31
**対象リポジトリ**: saiyou-kanri

---

## 目次

1. [システム概要](#1-システム概要)
2. [技術スタック](#2-技術スタック)
3. [画面構成](#3-画面構成)
4. [機能仕様](#4-機能仕様)
5. [データ仕様](#5-データ仕様)
6. [採用フロー](#6-採用フロー)
7. [UI コンポーネント](#7-ui-コンポーネント)
8. [外部連携](#8-外部連携)
9. [環境変数・設定](#9-環境変数設定)
10. [ファイル構成](#10-ファイル構成)

---

## 1. システム概要

### 目的

Third Scope の採用活動を一元管理するための社内向け Web アプリケーション。応募者の進捗をパイプライン形式で管理し、担当者間での情報共有を効率化する。

### 対象ユーザー

Third Scope の採用担当者（6名）

### 採用区分

| 区分 | フロー |
|---|---|
| 中途採用 | カジュアル面談 / 採用面接 |
| 新卒採用 | 会社説明 / 本選考 |
| 長期インターン | 採用サイト経由 / ゼロワン経由 |

---

## 2. 技術スタック

| 区分 | 技術 | バージョン |
|---|---|---|
| フレームワーク | React | 19.2.4 |
| ビルドツール | Vite | 8.0.1 |
| バックエンド | Google Apps Script (GAS) | — |
| データストア | Google Sheets | — |
| スタイリング | インラインスタイル（CSS-in-JS） | — |
| コード品質 | ESLint | 9.39.4 |

---

## 3. 画面構成

### 3.1 ログイン画面

パスワード認証によるアクセス制御。認証状態は `sessionStorage` に保持する。

- パスワード入力フォーム
- ログインボタン
- 1Password 誤認識を防ぐため `data-1p-ignore` 属性を付与

### 3.2 リストビュー（メイン画面）

応募者一覧をカード形式で表示するメイン画面。

**ヘッダー**
- フロー別フィルタタブ（「全員」+ 6フロー）
- 氏名検索フィールド
- 応募者追加ボタン
- カレンダー切替ボタン

**一覧エリア**
- 対応中の応募者カード（フロー・フィルタ・検索で絞り込み）
- 完了セクション（採用決定済み）
- 終了セクション（不合格・辞退）

### 3.3 カレンダービュー

面接・面談の日程を月別カレンダーで一覧表示。

- 月ナビゲーション（前月 / 次月）
- 日付セルに該当する応募者名・フロー・ステップを表示
- リストビューへの切替ボタン

---

## 4. 機能仕様

### 4.1 認証

| 機能 | 仕様 |
|---|---|
| ログイン | パスワード一致で認証。`sessionStorage` に `"saiyou_auth": "1"` を保存 |
| セッション維持 | ブラウザセッション中は再ログイン不要 |
| ログアウト | セッション終了（ブラウザを閉じる）で自動ログアウト |

### 4.2 応募者管理

#### 追加

「＋ 応募者追加」ボタンでモーダルを開き、以下を入力して追加する。

| フィールド | 入力方法 | 必須 |
|---|---|---|
| 氏名 | テキスト | ✓ |
| 採用区分 | ラジオ（中途 / 新卒 / インターン） | ✓ |
| フロー | セレクト（区分に応じて動的変化） | ✓ |
| 担当者 | セレクト | ✓ |
| 応募経路 | セレクト（フロー=インターンのとき表示） | — |
| メモ | テキストエリア | — |

#### 編集

カード展開時の「編集」ボタンで EditModal を開き、以下を変更できる。

- 氏名
- 採用フロー
- 担当者
- 応募経路（インターンのみ）

#### 削除

編集モーダルから削除。確認ダイアログ表示後に完全削除する。

### 4.3 ステップ進捗

| 操作 | 条件 | 動作 |
|---|---|---|
| 次のステップへ | `rejected=false` かつ最終ステップでない | `stepIdx + 1`。日程入力必須ステップは日程確定後のみ可 |
| 前のステップへ | `stepIdx > 0` | `stepIdx - 1` |
| 不合格・辞退 | `rejected=false` | `rejected=true` に更新 |
| 対応中に戻す | `rejected=true` | `rejected=false` に更新 |

`stepIdx` 更新時は `stepUpdatedAt` もサーバー側で自動更新する。

### 4.4 日程入力

日程入力が必要なステップでは、以下の UI で日程を選択・確定する。

- 日付ピッカー（`<input type="date">`)
- 時間セレクト（11:00〜19:00 の 30 分刻み、計 17 スロット）
- 「確定」ボタンで保存

日程が未入力の場合、「次のステップへ」ボタンはクリック不可。

### 4.5 メモ

- カード展開時にメモを表示・編集
- 「編集」ボタンでテキストエリアを表示し、「保存」で API に送信
- ESC キーでキャンセル

### 4.6 担当者割り当て

カード展開時に担当者セレクトで変更可能。変更時即時保存。

**担当者リスト**

```
新井 / 中里 / 早川 / クリス / 油谷 / 伊藤
```

### 4.7 フィルタ・検索

| 機能 | 仕様 |
|---|---|
| フロー別フィルタ | ヘッダーのタブをクリックで切替。「全員」で全フロー表示 |
| 氏名検索 | 入力した文字を含む応募者のみ表示（部分一致） |

### 4.8 滞留警告

同じステップに **5日以上** 留まっている応募者のカードを黄色でハイライト表示する。
基準日時: `stepUpdatedAt` から現在までの経過日数。

---

## 5. データ仕様

### 5.1 応募者オブジェクト

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | string | 一意ID（`Date.now()` の文字列） |
| `name` | string | 氏名 |
| `flow` | string | フローID（[採用フロー](#6-採用フロー)参照） |
| `stepIdx` | number | 現在のステップインデックス（0始まり） |
| `member` | string | 担当者名 |
| `source` | string | 応募経路（`"採用サイト"` / `"ゼロワン"` 等） |
| `note` | string | 担当者メモ |
| `rejected` | boolean | 不合格・辞退フラグ |
| `created` | string | 登録日（`YYYY-MM-DD`） |
| `scheduledDate` | string | 会社説明・面談の日程（`"YYYY-MM-DD HH:MM"`） |
| `interviewDate` | string | 面接日程（`"YYYY-MM-DD HH:MM"`） |
| `interview1Date` | string | 1次面接日程（`"YYYY-MM-DD HH:MM"`） |
| `interview2Date` | string | 2次面接日程（`"YYYY-MM-DD HH:MM"`） |
| `stepUpdatedAt` | string | ステップ最終更新日時（ISO 8601） |

### 5.2 フロントエンド State 構造

```javascript
{
  authed: boolean,         // ログイン状態
  applicants: Applicant[], // 応募者データ配列
  expanded: string,        // 展開中のカードID（なければ null）
  filter: string,          // 現在のフィルタ（"all" またはフローID）
  search: string,          // 検索テキスト
  activeTab: string,       // "list" または "calendar"
  fetchState: string,      // "idle" | "loading" | "error"
  loadingId: string,       // ローディング中の応募者ID
}
```

### 5.3 セッションストレージ

| キー | 値 | 用途 |
|---|---|---|
| `saiyou_auth` | `"1"` | ログイン状態の保持 |

---

## 6. 採用フロー

詳細は [recruitment-flows.md](./recruitment-flows.md) を参照。

### フロー一覧

| フローID | 表示名 | ステップ数 | 色 |
|---|---|---|---|
| `chuto_casual` | 中途｜カジュアル面談 | 4 | `#e05a3a` |
| `chuto_mensetsu` | 中途｜採用面接 | 6 | `#c0392b` |
| `shinsotsu_kaisetsu` | 新卒｜会社説明 | 4 | `#1a56db` |
| `shinsotsu_honsenkou` | 新卒｜本選考 | 9 | `#2d6be4` |
| `intern_site_eng` | 長期インターン｜採用サイト | 6 | `#6d28d9` |
| `intern_zero_eng` | 長期インターン｜ゼロワン | 5 | `#7c3aed` |

### 日程フィールドとフローの対応

| フィールド | 使用フロー |
|---|---|
| `scheduledDate` | `chuto_casual`、`shinsotsu_kaisetsu` |
| `interviewDate` | `chuto_mensetsu`、`intern_site_eng`、`intern_zero_eng` |
| `interview1Date` | `shinsotsu_honsenkou` |
| `interview2Date` | `shinsotsu_honsenkou` |

---

## 7. UI コンポーネント

| コンポーネント | 役割 |
|---|---|
| `LoginScreen` | パスワード認証画面 |
| `Tag` | フロー名を色付きバッジで表示 |
| `StepBar` | 応募者の進捗をステップバーで視覚化 |
| `CopyBtn` | フォームURLをクリップボードにコピー |
| `NoteEditor` | メモの表示・編集切り替え |
| `Card` | 応募者カード（折り畳み / 展開） |
| `AddModal` | 応募者追加ダイアログ |
| `EditModal` | 応募者編集ダイアログ |
| `CalendarView` | 月別カレンダービュー |

---

## 8. 外部連携

### Google Apps Script (GAS) API

バックエンドは GAS + Google Sheets で構成。
詳細は [api-spec.md](./api-spec.md) を参照。

| アクション | 説明 |
|---|---|
| `list` | 応募者全件取得 |
| `add` | 応募者新規追加 |
| `update` | 応募者情報更新（部分更新） |
| `delete` | 応募者削除 |

**通信方式**: HTTP GET（クエリパラメータ）
CORS の制約により、書き込み操作も GET で実装。

### Google Sheets

| 列 | フィールド |
|---|---|
| A | id |
| B | name |
| C | flow |
| D | stepIdx |
| E | member |
| F | source |
| G | note |
| H | rejected |
| I | created |
| J | interviewDate |
| K | scheduledDate |
| L | interview1Date |
| M | interview2Date |
| N | stepUpdatedAt |

シート名: `applicants`

---

## 9. 環境変数・設定

### .env ファイル

| 変数名 | 説明 |
|---|---|
| `VITE_GAS_URL` | GAS Web App のエンドポイント URL |
| `VITE_APP_PASSWORD` | ログインパスワード |

### GAS デプロイ設定

| 項目 | 設定値 |
|---|---|
| 実行ユーザー | スクリプトオーナー |
| アクセス権限 | 全員 |
| デプロイ種別 | ウェブアプリ |

---

## 10. ファイル構成

```
saiyou-kanri/
├── src/
│   ├── main.jsx          # エントリーポイント
│   ├── App.jsx           # アプリケーション本体（全コンポーネント・ロジック）
│   └── index.css         # グローバルスタイル
├── docs/
│   ├── spec.md           # 本仕様書
│   ├── api-spec.md       # API・データ仕様
│   └── recruitment-flows.md  # 採用フロー定義
├── index.html            # HTML テンプレート
├── package.json          # 依存パッケージ
├── vite.config.js        # Vite 設定
├── eslint.config.js      # ESLint 設定
└── .env                  # 環境変数（git 管理外）
```
