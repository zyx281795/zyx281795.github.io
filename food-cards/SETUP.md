# Food Cards 投稿審核設定

這個頁面已支援：公開投稿 → Gmail 審核 → 核准後自動更新 GitHub Pages。

## 1. 建立 GitHub Fine-grained Personal Access Token

在 GitHub 建立一個只允許存取 `zyx281795/zyx281795.github.io` 的 fine-grained token。

Repository permissions 只需要：
- Contents: Read and write
- Metadata: Read-only

請不要把 Token 寫進任何 GitHub 檔案或前端 JavaScript。

## 2. 建立 Google Apps Script

1. 開啟 https://script.google.com/
2. New project
3. 將 `food-cards/apps-script/Code.gs` 的內容完整貼進去
4. Project Settings → Script Properties → 新增：
   - `GITHUB_TOKEN` = 上一步建立的 token
5. Deploy → New deployment → Web app
6. Execute as: Me
7. Who has access: Anyone
8. Deploy
9. 完成 Google 授權（寄信與外部 HTTP request）
10. 複製部署後的 `/exec` URL

## 3. 接上前端

修改 `food-cards/config.js`：

```js
window.FOOD_CARDS_CONFIG = {
  submissionEndpoint: "https://script.google.com/macros/s/你的部署ID/exec"
};
```

commit 到 `main` 後即可啟用投稿。

## 完整流程

1. 訪客進入 `/food-cards/`
2. 填寫店名、Google Maps、推薦理由、暱稱
3. Apps Script 收到投稿，但不公開
4. Apps Script 寄審核信到站長 Gmail
5. Email 內有「核准並發布」與「拒絕」按鈕
6. 核准後 Apps Script 使用私密 GitHub Token 更新 `food-cards/restaurants.json`
7. GitHub Pages 自動取得最新 JSON，新字卡出現

## 安全設計

- GitHub Token 不存在瀏覽器端
- 投稿者沒有 GitHub write 權限
- 每一筆投稿使用獨立且高熵的審核 token
- 未核准資料不會寫入公開 JSON
- Maps URL 在後端再驗證一次
- 欄位有長度限制，前端顯示時也進行 HTML escaping

## 如果修改 Apps Script

Apps Script Web App 修改程式後，請重新建立/更新 deployment，確認前端 `config.js` 仍指向有效的 `/exec` URL。
