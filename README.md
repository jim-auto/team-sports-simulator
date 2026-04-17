# Team Sports Simulator

複数のチームスポーツに対応できる仮想試合シミュレーターのMVPです。

現在は野球を中心に実装しており、Web上でチーム編集、ランダム編成、1試合、複数試合、12球団リーグ戦、クライマックスシリーズ、日本シリーズを実行できます。GitHub Pagesで静的サイトとして公開できるように、シミュレーション処理はブラウザ内で実行します。

公開URL:

```txt
https://jim-auto.github.io/team-sports-simulator/
```

## 対応スポーツ

- 野球: 実装済み
  - 2025年NPB公式戦データをもとにした12球団のテストデータ
  - 打者9人、先発投手、控え投手陣
  - 守備位置、投手ロール、所属チーム、成績ソースリンク
  - contact / power / fielding / control / stuff / stamina の暫定能力
  - 9イニング制の試合シミュレーション
  - 100試合、1000試合のシリーズ集計
  - 12球団リーグ戦、CS、日本シリーズ
  - seed指定による再現性
- サッカー: エンジン置き場のみ
  - `SportEngine` を差し替えれば追加できる構造

## 使い方

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

型チェック:

```bash
npm run typecheck
```

lint:

```bash
npm run lint
```

静的ビルド:

```bash
npm run build
```

ローカルで静的ビルドを確認:

```bash
npm run start
```

## Web UIでできること

- スポーツ選択
- チーム名、打者能力、投手能力の編集
- 年代/球団縛りのランダムチーム生成
- 選手画像またはフォールバックアバターの表示
- 選手詳細、所属チーム、成績ソース、Wikipediaプロフィールリンクの表示
- 1試合シミュレーション
- 100試合/1000試合のシリーズ集計
- 12球団リーグ戦からCS、日本シリーズまでのシミュレーション
- 試合ログ、イニング別スコア、得点場面の表示

## データと能力値

選手データは2025年NPB公式戦成績をもとにしています。既存の主要4球団データに加え、読売、中日、広島、東京ヤクルト、オリックス、東北楽天、埼玉西武、千葉ロッテの8球団分はNPB公式の打撃、投手、守備成績ページから抽出したテストデータです。

主な参照元:

- NPB 2025年度公式戦成績: https://npb.jp/bis/2025/stats/
- チーム別打撃成績: `https://npb.jp/bis/2025/stats/idb1_<team>.html`
- チーム別投手成績: `https://npb.jp/bis/2025/stats/idp1_<team>.html`
- チーム別守備成績: `https://npb.jp/bis/2025/stats/idf1_<team>.html`
- 選手画像/プロフィール: Wikipedia / Wikimedia Commons

能力値は現時点では暫定変換です。

- `contact`: 打率、出塁率、三振率、打席数から算出
- `power`: 長打率、本塁打率、長打率から算出
- `fielding`: 守備位置、出場数、走力の目安から算出
- `control`: 与四球率、防御率から算出
- `stuff`: 奪三振率、被本塁打率、防御率から算出
- `stamina`: 投球回、登板数から算出

次の段階では、同じカードを多数回シミュレーションし、得点、失点、勝率、打率、本塁打、防御率が実シーズンに近づくように係数を校正します。

## ディレクトリ構成

```txt
app/
  page.tsx
lib/
  engine/
    SportEngine.ts
    baseball/
      baseballEngine.ts
      leagueSimulator.ts
      npb2025ExpansionData.ts
      playerPool.ts
      randomTeam.ts
    soccer/
      soccerEngine.ts
  models/
    player.ts
    result.ts
    team.ts
```

## GitHub Pagesへの公開

`main` ブランチへpushすると、GitHub ActionsがNext.jsをstatic exportし、`out/` をGitHub Pagesへデプロイします。

初回だけGitHubリポジトリの Settings > Pages で Source を `GitHub Actions` に設定してください。

## 将来拡張

- サッカー用の入力フォームと試合ロジック
- 年度別ロースター切り替え
- NPBの実日程に近いリーグ戦
- 交流戦
- 日本シリーズの引き分け再試合
- 野手能力の細分化: ミート、長打、走塁、守備範囲、肩、捕球
- 投手能力の細分化: 球速、制球、球威、変化球、対左右、疲労回復
- 選手データの外部JSON化
- 実シーズン成績に近づける能力係数の自動校正
- ユーザー作成チームの保存

## 設計方針

スポーツごとのロジックは `SportEngine` インターフェースに閉じ込めています。UIは「チームを渡して結果を受け取る」だけを意識し、打席処理、走塁、投手疲労、リーグ戦、CSなどの野球固有処理は `lib/engine/baseball/` に集約しています。

このため、サッカーなど別スポーツを追加する場合は `lib/engine/<sport>/` にエンジンを追加し、同じ `simulateMatch` / `simulateSeries` の形で接続できます。MVPとしては過剰な抽象化を避け、共通インターフェースだけを明確にして、スポーツ固有の細部は各エンジン側に閉じ込める方針です。
