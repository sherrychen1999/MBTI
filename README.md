# 擇木良食｜吃貨動物測驗

手機版小測驗，放在 GitHub Pages，作答結果存到 Google 試算表。

## 檔案
- `index.html`：測驗本體（所有畫面和邏輯都在這一個檔案）
- `img/`：16 隻動物插圖（`a_類型.png`）、分享圖卡（`card_類型.jpg`）、FB 分享預覽圖（`og.jpg`）
- `apps-script/Code.gs`：收資料用的 Google Apps Script

## 上線步驟

### 1. 建立收資料的試算表
1. 開一份新的 Google 試算表，命名例如「吃貨動物測驗資料」。
2. 上方選單「擴充功能 → Apps Script」。
3. 把 `apps-script/Code.gs` 的內容整個貼上，取代原本的程式碼，存檔。
4. 右上角「部署 → 新增部署作業」，類型選「網頁應用程式」：
   - 執行身分：**我**
   - 誰可以存取：**所有人**
5. 按「部署」，第一次會要求授權，照畫面同意。
6. 複製產生的網址（`https://script.google.com/macros/s/.../exec`）。

> 之後若修改 Code.gs，要到「部署 → 管理部署作業」編輯並選「新版本」，網址才會更新內容。

### 2. 填設定
打開 `index.html`，找到最上面的 `CONFIG`：

```js
const CONFIG = {
  GAS_URL: '貼上第1步的網址',
  LIFF_ID: '',          // 第4步才需要
  BOOK_URL: '門診預約網址',
  SHOP_URL: '官網網址',
  LINE_URL: 'https://line.me/R/ti/p/@selectgoodfood',
  SHOP_BY_TYPE: {}      // 之後每一型有專屬搭配頁，再填在這裡
};
```

### 3. 放上 GitHub Pages
1. 在 GitHub 建一個 repo，例如 `foodie-animal-quiz`。
2. 把整個資料夾（index.html、img、apps-script、README.md）上傳。
3. repo 的「Settings → Pages」，Source 選 `main` 分支、根目錄 `/`，存檔。
4. 約 1 分鐘後，網址會是 `https://你的帳號.github.io/foodie-animal-quiz/`。

### 4.（選用）在 LINE 裡抓 UID
1. 到 LINE Developers，在**跟 @selectgoodfood 官方帳號同一個 Provider** 底下建立一個「LINE Login」channel。
   - 一定要同一個 Provider，抓到的 UID 才能拿來對官方帳號推播。
2. 在這個 channel 新增 LIFF app：
   - Endpoint URL：第3步的 GitHub Pages 網址
   - Scope：勾 `profile`
   - Size：Full
   - 建議開啟「Add friend option」，讓客人順便加官方帳號好友
3. 把 LIFF ID 填進 `CONFIG.LIFF_ID`。
4. 在 LINE 裡分享 `https://liff.line.me/你的LIFF_ID`，從這個連結進來的人，才抓得到 UID。
5.（選用）要在測驗後自動推結果訊息：Apps Script「專案設定 → 指令碼屬性」新增 `LINE_CHANNEL_TOKEN`，值是官方帳號 Messaging API 的 Channel access token。**這個 token 不要放進 GitHub。**

## 追蹤入口來源
每個入口用不同的 `src` 參數，試算表就能分開統計：

| 入口 | 網址 |
|---|---|
| 蕭醫師粉專 | `.../?src=dr_fb` |
| 蕭醫師 IG | `.../?src=dr_ig` |
| 三樹院區 QR 碼 | `.../?src=clinic_sanshu` |
| 土城院區 QR 碼 | `.../?src=clinic_tucheng` |
| LINE 推播 | `https://liff.line.me/LIFF_ID?src=line_push` |
| 出貨小卡 | `.../?src=package` |

## 收集了哪些資料
| 欄位 | 說明 |
|---|---|
| 入口來源、工作階段 | 判斷哪個入口有效 |
| 類型代碼、動物、分流 | 分眾行銷用 |
| 年齡、BMI 區間、腰圍是否超過 80 | 只存區間，不存實際數字 |
| 想調整的、推薦產品 | 規劃內容與組合 |
| 同意行銷、LINE UID | **只有客人勾選同意行銷時才存 UID** |
| 按鈕點擊 | 存在 `clicks` 工作表 |

**健康狀況和家族病史不會送出、不會儲存**，只在客人手機上用來判斷分流和產品。

## 上線前檢查
- [ ] 個資同意文字請法務確認
- [ ] 試算表只分享給需要的同事
- [ ] 預約、官網網址都已填好，實際點過一次
- [ ] 用手機從 LINE 和一般瀏覽器各測一次，確認試算表有收到資料
