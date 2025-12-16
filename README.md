# Form Auto Filler - Dev Tool

開発者向けフォーム自動入力Chrome拡張機能

## インストール方法

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このフォルダを選択

## 使い方

### 基本操作

1. 拡張機能アイコンをクリック
2. 「+ 新規作成」でプリセットを作成
3. フォームのあるページで「▶ 入力実行」

### 入力データの書き方

1行に1フィールド、`name=value` 形式で記述します。

```
# テキスト入力
client[name]=手須　藤太郎
client[email1]=test@example.com

# select（値またはテキストで指定）
client[address1]=宮城県
client[job]=会社員

# radio（インデックス指定）
client[sex]=radio:0          # 0番目を選択（男性）
client[sex]=radio:1          # 1番目を選択（女性）

# checkbox（複数インデックス指定）
client[media2][]=checkbox:0,2    # 0番目と2番目をチェック
client[media2][]=checkbox:0,3,5  # 0,3,5番目をチェック

# 単体checkbox
policy=1                      # チェックする
policy=0                      # チェックしない
```

### エクスポート / インポート

- 📤 エクスポート: 全プリセットをJSONファイルで保存
- 📥 インポート: JSONファイルからプリセットを読み込み

## ファイル構成

```
form-auto-filler/
├── manifest.json        # 拡張機能設定
├── popup.html           # ポップアップUI
├── popup.js             # メインロジック
├── styles.css           # スタイル
├── icons/               # アイコン
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── sample-presets.json  # サンプルデータ（インポート用）
```

## サンプルプリセット

`sample-presets.json` にテストフォーム用のサンプルデータが入っています。
インポート機能でお使いください。

## 注意事項

- この拡張機能は開発・テスト用です
- フォームのname属性に基づいて入力します
- 存在しないname属性は無視されます
- 入力後、各フィールドで `input` / `change` イベントが発火します

## トラブルシューティング

### 入力されない場合

1. フォームのname属性を確認（開発者ツール > Elements）
2. プリセットのname指定が正確か確認
3. ページをリロードして再試行

### selectが選択されない場合

- 値（value）とテキスト（表示文字）の両方で検索します
- どちらかが一致すれば選択されます
- `select:0` 形式でインデックス指定も可能

---
@sarap422
