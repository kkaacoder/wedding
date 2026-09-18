# 💒 婚禮小遊戲：新郎接玫瑰 🌹

一款粉紅浪漫的婚禮互動小遊戲。遊戲進行時每 3 秒會從 Cloudflare D1 資料庫隨機讀取並動態展示親友的新婚祝福語！

---

## 🌟 功能特點

- **接玫瑰互動遊戲**：滑鼠、鍵盤或觸碰移動新郎接住玫瑰、金玫瑰與躲避心碎！
- **每 3 秒隨機新婚祝福語**：遊戲中上方即時輪播 D1 資料庫中的祝福語彈幕。
- **Cloudflare Pages + Functions**：前後端完全整合，免額外伺服器。
- **Cloudflare D1 資料庫**：綁定名為 `a1` 的 Serverless SQL 資料庫，查詢快速。
- **離線/未連線自動降級保護**：即使尚未綁定資料庫，遊戲依然能暢快遊玩。

---

## 🚀 部署指南（GitHub ➜ Cloudflare Pages + D1）

### 第一步：上傳至 GitHub

1. 到 [GitHub 官網](https://github.com/new) 點選 **New repository** 建立新儲存庫（例如命名為 `wedding-game`）。
2. 在本機專案目錄下打開終端機（PowerShell），執行以下指令（請將 `<你的GitHub用戶名>` 替換為你的帳號）：
   ```powershell
   git remote add origin https://github.com/<你的GitHub用戶名>/wedding-game.git
   git branch -M main
   git push -u origin main
   ```

---

### 第二步：在 Cloudflare 建立 D1 資料庫 `a1`

1. 登入 [Cloudflare 控制台 (Dashboard)](https://dash.cloudflare.com/)。
2. 點擊左側選單 **Workers & Pages** ➜ **D1 SQL Database**。
3. 點擊 **Create database**：
   - 資料庫名稱請輸入：`a1`
   - 點擊 **Create** 完成建立。
4. 點進剛建立好的 `a1` 資料庫，切換到 **Console** 分頁：
5. 將專案中的 `schema.sql` 檔案內容完整複製並貼上，點擊 **Execute** 執行！
   - 此操作會建立 `wedding_wishes` 資料表並填入預設的 15 則新婚祝福語。

---

### 第三步：在 Cloudflare Pages 連接 GitHub 與部署

1. 在 Cloudflare 控制台左側選單，點選 **Workers & Pages** ➜ **Overview** ➜ **Create application**。
2. 切換到 **Pages** 分頁，選擇 **Connect to Git**。
3. 選擇你在第一步建立的 GitHub 倉庫（例如 `wedding-game`），點擊 **Begin setup**。
4. 部署設定：
   - **Project name**：自訂（例如 `wedding-game`）
   - **Production branch**：`main`
   - **Framework preset**：選擇 `None`
   - **Build output directory**：輸入 `.`（即專案根目錄）
5. 點擊 **Save and Deploy** 進行初次部署。

---

### 第四步：綁定 D1 資料庫 `a1`

部署完成後，需要將 D1 資料庫與 Pages Functions 關聯：
1. 進入你的 Pages 專案頁面 ➜ 點選 **Settings** ➜ **Functions**。
2. 向下滾動找到 **D1 Database Bindings**，點擊 **Add binding**。
3. 填寫以下設定：
   - **Variable name**（變數名稱）：`a1` （必填 `a1`）
   - **D1 database**：下拉選單選取剛建立的 `a1`
4. 點擊 **Save** 儲存。
5. 點擊頂部的 **Deployments** ➜ 在最新的部署點擊 **Retry deployment**（或往 GitHub push 一個新 commit）重新發布，綁定即正式生效！

---

## 🔄 日後如何同步更新？

只要你在本地修改了程式碼，執行：
```powershell
git add .
git commit -m "更新遊戲內容"
git push
```
Cloudflare Pages 會在幾秒鐘內**自動偵測 GitHub 更新並重新發布**，完全自動化！

---

## 🛠️ API 接口說明

- `GET /api/wish`：隨機取得一則祝福語。
- `POST /api/wish`：新增一則新婚祝福語（JSON: `{ "content": "新婚快樂！", "author": "阿明" }`）。
