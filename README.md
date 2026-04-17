# Team Sports Simulator

複数のチームスポーツに対応できる仮想試合シミュレーターのMVPです。  
現在は野球を主対象にし、Web UIからチーム編集、ランダム編成、1試合または複数試合のシミュレーションを実行できます。

GitHub Pagesで公開できるよう、MVPは静的サイトとして動作します。シミュレーション処理はブラウザ内で実行されます。

## 対応スポーツ

- 野球: 実装済み
  - 打者9人、投手1人
  - 9イニング制
  - 打席結果: out / single / double / home_run
  - contact vs control、power vs stuff を sigmoid 関数で確率化
  - seed指定による再現性
  - 100試合 / 1000試合のシリーズ集計
- サッカー: エンジンの置き場と簡易エンジンのみ
  - Web UIの入力フォームはMVPでは野球のみ対応

## ディレクトリ構成

```txt
app/
  page.tsx
.github/
  workflows/
    deploy-pages.yml
lib/
  engine/
    SportEngine.ts
    baseball/
      baseballEngine.ts
      playerPool.ts
      randomTeam.ts
    soccer/
      soccerEngine.ts
  models/
    player.ts
    result.ts
    team.ts
```

## 使い方

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

ビルド確認:

```bash
npm run build
```

静的ファイルは `out/` に出力されます。

ローカルで静的ビルドを確認する場合:

```bash
npm run build
npm run start
```

型チェック:

```bash
npm run typecheck
```

## Web UIでできること

- スポーツ選択
- 野球チームの手動編集
- 年代縛り、元チーム縛り付きのランダム編成
- seed指定
- 1試合、100試合、1000試合のシミュレーション
- 勝率、平均得点、MVP、簡易試合ログの表示

## GitHub Pagesへの公開

`main` ブランチへpushすると、GitHub ActionsがNext.jsをstatic exportし、`out/` をGitHub Pagesへデプロイします。

公開URL:

```txt
https://jim-auto.github.io/team-sports-simulator/
```

初回だけGitHubリポジトリの Settings > Pages で Source を `GitHub Actions` に設定してください。

## 将来拡張

- サッカー用の入力フォーム
- スポーツごとの詳細ルール
- 選手データの外部JSON化
- リーグ戦、トーナメント
- ユーザー作成チームの保存

## 設計方針

スポーツごとのロジックは `SportEngine` インターフェースに閉じ込めています。UIとAPIは「チームを受け取り、結果を返す」契約だけを見ればよく、野球固有の打席処理や走塁処理を直接知りません。

GitHub PagesはAPI routesを実行できないため、現状のWeb UIはエンジンをブラウザから直接呼びます。将来VercelやNodeサーバーへ移す場合は、同じ `SportEngine` をAPI routeから呼び出すだけでバックエンド化できます。

野球MVPでは過剰な抽象化を避け、必要なモデルだけを定義しています。今後サッカーや別スポーツを追加する場合は、`lib/engine/<sport>/` にエンジンを追加し、同じ `simulateMatch` / `simulateSeries` を実装します。
