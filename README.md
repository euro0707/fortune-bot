# Fortune Bot

四柱推命に基づいた性格診断を行うLINE Botです。

## 機能

- 誕生日（YYYY-MM-DD形式）を送信すると性格診断結果を返します
- Dantalionライブラリを使用した本格的な四柱推命計算
- Node.js + Express + LINE Bot SDK で構築

## セットアップ

1. 依存関係のインストール：
```bash
npm install
```

2. 環境変数の設定（.env）：
```
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_access_token
PORT=3000
```

3. サーバー起動：
```bash
npm start
```

## 使用方法

LINEで誕生日を「1993-10-09」の形式で送信すると、性格診断結果が返されます。

## 技術スタック

- Node.js
- Express
- LINE Bot SDK
- Dantalion（四柱推命ライブラリ）