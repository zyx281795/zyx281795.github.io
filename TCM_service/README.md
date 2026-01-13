# 中醫藥材知識系統 - TCM Exam & Herb AI Assistant

[![License](https://img.shields.io/badge/License-Educational-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)](https://github.com)
[![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen.svg)](https://github.com)

> 整合 AI 技術與中醫藥材知識的學習平台，採用 Supervised Fine-Tuning 技術訓練之 BianCang-Qwen2-7B 模型，提供國考題庫練習、藥材百科查詢與智能問答服務。

---

## 目錄

- [專案簡介](#專案簡介)
- [核心功能](#核心功能)
- [技術架構](#技術架構)
- [系統需求](#系統需求)
- [安裝與部署](#安裝與部署)
- [功能詳解](#功能詳解)
- [文件結構](#文件結構)
- [開發指南](#開發指南)
- [研究成果](#研究成果)
- [數據來源](#數據來源)
- [授權說明](#授權說明)

---

## 專案簡介

本系統為中山醫學大學醫學資訊學系專題研究成果，旨在建構一套以大型語言模型為核心的中醫藥材知識系統，評估 Supervised Fine-Tuning 技術在專業中醫語境下的實務可行性。

### 研究團隊
- **專題學生**：張詠翔、官翰、簡祥竹
- **指導教授**：曾明性

### 研究主題
中醫藥材知識系統：語言模型於中醫藥材知識微調訓練與驗證研究

### 數據規模
- **300 種** 常用中草藥（含圖譜）
- **413 種** 醫砭中藥（含詳細藥理）
- **721 個** 常用方劑（含辨證要點）
- **1,751 題** 國考題庫（民國 94-114 年）

---

## 核心功能

### 1. 功能簡介
- 系統研究目標說明
- 研究摘要展示
- 項目簡報嵌入（PDF）
- 當前學習統計

### 2. 國考題庫
動態模擬測驗系統，支援兩階段國考題型：

**功能特色：**
- **階段選擇**：第一階段（基礎醫學）、第二階段（臨床醫學）
- **題數自訂**：5/10/25/50 題彈性選擇
- **隨機抽題**：每次測驗隨機組卷
- **計時功能**：自動計時，記錄作答時間
- **進度追蹤**：實時顯示當前題目進度
- **成績統計**：自動計分，顯示正確率
- **歷史紀錄**：儲存最近 10 次測驗成績（LocalStorage）

**技術實現：**
- Fisher-Yates 洗牌算法實現隨機抽題
- LocalStorage API 持久化測驗記錄
- 動態 DOM 渲染題目與選項

### 3. 醫砭集錦
整合《醫砭》經典中醫文獻資料庫：

**數據規模：**
- 413 種中藥 + 721 個方劑

**功能特色：**
- **智能搜索**：支援藥名、科屬、功效、主治等多維度搜索
- **類型篩選**：快速切換「全部」、「中藥」、「方劑」
- **分類篩選**：按藥物分類動態過濾
- **無限滾動**：自動分頁載入，提升性能
- **詳情彈窗**：點擊卡片查看完整信息

**中藥詳情包含：**
- 科屬、品種來源
- 性味歸經
- 功效、主治
- 用法用量
- 注意禁忌
- 現代藥理

**方劑詳情包含：**
- 來源、製法用量
- 功效、主治
- 方義、辨證要點
- 加減、現代應用

**技術實現：**
- Debounce 技術優化搜索性能（300ms）
- Intersection Observer API 實現無限滾動
- CSS Grid 響應式卡片佈局

### 4. 中藥百科
300 種常用中草藥完整資料庫：

**功能特色：**
- **多圖輪播**：每種藥材支援多張圖片切換
- **即時搜索**：輸入關鍵字即時過濾
- **詳細資訊**：名稱、別名、性味歸經、功能主治、應用
- **圖片預覽**：高清藥材圖片展示
- **自動容錯**：圖片載入失敗自動顯示替代圖

**技術實現：**
- 圖片懶加載（Lazy Loading）
- 圖片輪播導航（Image Carousel）
- 全文搜索算法（包含別名、功效）

### 5. 中醫藥材 Chatbot

**AI 模型：**
- **BianCang-Qwen2-7B** (DEMO 版本)
- 基礎模型：Qwen2.5-7B-Instruct
- 微調方法：LoRA (Low-Rank Adaptation)
- 訓練數據：1,751 題中醫國考選擇題
- 性能提升：正確率從 58.08% 提升至 72.76%

**功能特色：**
- **專業問答**：回答中醫藥材相關問題
- **繁體中文**：完整支援繁體中文對話
- **知識準確**：參考民國 94-114 年國考知識點
- **訓練圖表**：展示模型訓練收斂曲線
- **權重下載**：提供 Hugging Face Space 訪問連結

**Hugging Face 部署：**
- 平台：Hugging Face Spaces
- 連結：https://huggingface.co/spaces/Atypical281795/CSMU_TCM_Service
- 服務：互動式推論服務

---

## 技術架構

### 前端技術棧

#### **核心框架**
- **無框架設計**：純 HTML5 + CSS3 + Vanilla JavaScript
- **原因**：輕量化、零依賴、快速載入

#### **HTML5**
- **語義化標籤**：`<aside>`, `<nav>`, `<main>`, `<section>`
- **響應式設計**：`<meta name="viewport">`
- **可訪問性**：ARIA 標籤支持

#### **CSS3**
- **佈局技術**：
  - Flexbox（側邊欄、導航）
  - CSS Grid（卡片網格佈局）
- **視覺效果**：
  - CSS 變量（主題色彩管理）
  - Linear Gradient（漸變背景）
  - Box Shadow（卡片陰影）
  - Transition & Animation（平滑過渡）
- **響應式設計**：Media Queries

#### **JavaScript ES6+**
- **語法特性**：
  - `async/await`（非同步處理）
  - Arrow Functions（箭頭函數）
  - Template Literals（模板字符串）
  - Destructuring（解構賦值）
  - Modules（模組化）
- **Web APIs**：
  - **Fetch API**：載入 JSON 數據
  - **DOM API**：`querySelector`, `addEventListener`
  - **LocalStorage API**：持久化測驗記錄
  - **Intersection Observer API**：無限滾動（規劃中）

### 後端服務

#### **Hugging Face**
- **用途**：模型權重託管與部署
- **服務**：Spaces（互動式推論）

### 數據處理

#### **Python 3**
用於開發階段的數據預處理（見 `tools/` 文件夾）：
- 文本解析
- 數據轉換
- JSON 生成
- 編碼處理

#### **數據格式**
- **JSON**：前端數據存儲格式
  - `herbs_data.json` (232KB)
  - `yibian_data.json` (1.8MB)
  - `data.js` (12MB - 包含國考題庫)
- **CSV**：原始題庫數據
  - `第一階段(更新版).csv`
  - `第二階段(更新版).csv`

### 設計系統

#### **配色方案**
- **主色調**：翡翠綠（Emerald Green）
  - 側邊欄：`#065f46`
  - 按鈕/強調：`#047857`
  - 漸變：`#059669`
- **中性色**：
  - 背景：`#fafaf9`（石灰白）
  - 卡片：`#ffffff`（純白）
  - 文字：`#1c1917`（石炭黑）
- **功能色**：
  - 成功：`#10b981`（綠色）
  - 錯誤：`#dc2626`（紅色）
  - 警告：`#f59e0b`（橙色）

#### **字體系統**
- **中文**：標楷體、DFKai-SB、BiauKai
- **英文**：Times New Roman
- **回退**：serif（襯線字體）

---

## 安裝與部署

### 方法一：直接運行（推薦用於測試）

1. **下載專案**
```bash
git clone https://github.com/zyx281795/TCM-service.git
cd TCM_service
```

2. **直接開啟**
- 雙擊 `index.html` 文件
- 使用瀏覽器開啟

**注意**：某些瀏覽器可能因 CORS 限制無法載入 JSON 文件

### 方法二：本地伺服器（推薦用於開發）

#### 使用 Python
```bash
# Python 3
python -m http.server 8000

# 瀏覽器訪問
# http://localhost:8000
```

#### 使用 Node.js
```bash
# 安裝 http-server
npm install -g http-server

# 啟動伺服器
http-server -p 8000

# 瀏覽器訪問
# http://localhost:8000
```

### 方法三：GitHub Pages 部署

1. **推送到 GitHub**
```bash
git add .
git commit -m "Deploy TCM service"
git push origin main
```

2. **啟用 GitHub Pages**
- 進入倉庫 Settings
- Pages 設定選擇 `main` 分支
- 保存後等待部署完成

3. **訪問**
```
https://github.com/zyx281795/TCM-service.git
```
```

---

## 功能詳解

### 國考題庫系統

**數據來源：**
- 民國 94-114 年中醫師國家考試真題
- 第一階段（基礎醫學）
- 第二階段（臨床醫學）

**流程圖：**
```
用戶選擇階段 → 選擇題數 → 開始測驗
      ↓
  隨機抽題組卷
      ↓
  顯示題目與選項
      ↓
  用戶選擇答案
      ↓
  記錄答案（可前後切換）
      ↓
  提交測驗 → 計算成績
      ↓
  顯示結果（正確率、答對題數）
      ↓
  可選儲存記錄到 LocalStorage
```

**技術細節：**
```javascript
// 隨機抽題算法（Fisher-Yates Shuffle）
const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
ExamState.questions = shuffled.slice(0, questionCount);

// 計分邏輯
const score = Math.round((correct / total) * 100);

// LocalStorage 儲存
localStorage.setItem('examHistory', JSON.stringify(ExamState.examHistory));
```

### 醫砭集錦系統

**數據結構：**
```json
{
  "herbs": [
    {
      "type": "herb",
      "name": "地膚子",
      "category": "利尿通淋",
      "family": "藜科",
      "properties": "苦，寒。歸膀胱經。",
      "effects": "清熱利濕，止癢。",
      "indications": "用於淋證...",
      "usage": "煎服，10～15克。",
      ...
    }
  ],
  "formulas": [
    {
      "type": "formula",
      "name": "五皮散",
      "categories": "利水滲濕",
      "source": "中藏經",
      "composition": "生薑皮 10克...",
      "effects": "利水消腫，理氣健脾。",
      ...
    }
  ]
}
```

**搜索算法：**
```javascript
// 多欄位全文搜索
items = items.filter(item => {
    return (
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.family && item.family.toLowerCase().includes(query)) ||
        (item.effects && item.effects.toLowerCase().includes(query)) ||
        (item.indications && item.indications.toLowerCase().includes(query))
    );
});
```

**性能優化：**
- Debounce 搜索：避免頻繁觸發過濾
- 分頁載入：每頁 30 筆資料
- 虛擬滾動：僅渲染可見區域（規劃中）

### Chatbot 系統

**系統架構：**
```
用戶輸入問題
    ↓
合併系統提示 + 用戶問題
    ↓
調用 API
    ↓
接收 AI 生成回答
    ↓
顯示繁體中文答案
```

**系統提示詞：**
```
你是一個專業的中醫藥材知識助手。
你具備深厚的中醫理論基礎，特別擅長中藥材的性味、歸經、功效與主治。
你的回答應參考歷年（民國94-114年）中醫師國家考試的知識點。
請用繁體中文回答，不要提及你是 AI 或由 Google 開發。
```

**API 調用範例：**
```javascript
const payload = {
    contents: [{
        role: 'user',
        parts: [{ text: systemInstruction + '\n\n' + userPrompt }]
    }],
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048
    }
};

const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
```

---

## 文件結構

```
TCM_service/
├── index.html                    # 主頁面 (33KB)
├── app.js                        # 應用程式邏輯 (47KB)
├── styles.css                    # 樣式表 (27KB)
├── data.js                       # 前端數據模組 (12MB)
│   ├── window.HERBS_DATA           # 300 種藥材
│   ├── window.YIBIAN_DATA          # 醫砭資料
│   └── window.EXAM_DATA            # 國考題庫
├── herbs_data.json               # 藥材 JSON (232KB)
├── yibian_data.json              # 醫砭 JSON (1.8MB)
├── Biancang_Chart.png            # 訓練曲線圖
├── README.md                     # 主說明文檔
├── README_MODEL_DEPLOY.md        # 模型部署文檔
├── run.txt                       # 運行說明
│
├── tools/                        # 開發工具腳本
│   ├── README.md                # 工具說明文檔
│   ├── parse_yibian_fixed.py    # 醫砭數據解析
│   ├── generate_data_js_v2.py   # 生成 data.js
│   ├── convert_exam_data_v2.py  # 轉換國考數據
│   ├── check_encoding.py        # 檢查文件編碼
│   ├── check_images.py          # 驗證圖片
│   ├── analyze_csv.py           # 分析 CSV
│   ├── fix_image_paths.py       # 修正圖片路徑
│   └── move_pdf.py              # 移動 PDF 文件
│
├── backend_deploy/               # 後端部署（規劃中）
│   ├── app.py                   # Flask/FastAPI 應用
│   └── requirements.txt         # Python 依賴
│
├── tcm-exam-herb-ai-assistant/   # 參考專案
│   └── public/
│       ├── herbs/               # 藥材圖片 (300+ 張)
│       └── project_presentation.pdf
│
├── 電子書+醫砭/                   # 原始數據源
│   ├── 300種常用草藥圖譜電子書(txt)/
│   │   ├── 1.txt ~ 300.txt
│   ├── 中醫藥材功效/
│   └── 醫砭/
│       ├── 常用中藥/類別/        # 413 種
│       └── 常用方劑/類別/        # 721 個
│
├── 第一階段(更新版).csv           # 國考題庫（第一階段）
└── 第二階段(更新版).csv           # 國考題庫（第二階段）
```

---

## 開發指南

### 添加新藥材

1. **準備數據**
```json
{
  "id": 301,
  "name": "新藥材",
  "aliases": "別名",
  "properties": "性味歸經",
  "indications": "功能主治",
  "applications": "應用",
  "imageUrls": ["path/to/image.jpg"]
}
```

2. **更新 JSON 文件**
- 將數據添加到 `herbs_data.json`

3. **重新生成 data.js**
```bash
cd tools
python generate_data_js_v2.py
```

### 添加國考題目

1. **編輯 CSV 文件**
- 打開 `第一階段(更新版).csv` 或 `第二階段(更新版).csv`
- 添加新題目行

2. **轉換數據**
```bash
cd tools
python convert_exam_data_v2.py
```

3. **更新 data.js**
```bash
python generate_data_js_v2.py
```

### 修改 UI 樣式

**主題色修改：**
```css
/* styles.css */
:root {
    --primary-color: #047857;    /* 主色調 */
    --secondary-color: #059669;  /* 次要色 */
    --bg-color: #fafaf9;        /* 背景色 */
}
```

**卡片樣式：**
```css
.herb-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.herb-card:hover {
    transform: translateY(-4px);
}
```

### 調試模式

**啟用控制台日誌：**
```javascript
// app.js 中已包含詳細日誌
console.log('點擊醫砭卡片:', item.name);
console.log('顯示方劑詳情');
```

**查看日誌：**
- 按 F12 打開開發者工具
- 切換到 Console 標籤

---

## 🎓 研究成果

### BianCang-Qwen2-7B 模型

**訓練配置：**
- **基礎模型**：Qwen2.5-7B-Instruct
- **微調方法**：LoRA (Low-Rank Adaptation)
- **訓練數據**：1,751 題中醫國考選擇題（民國 94-114 年）
- **評估指標**：MCQ Accuracy（選擇題正確率）
- **對照模型**：Lingdan-13B-Base

**性能提升：**
```
基礎模型正確率：58.08%
        ↓
   LoRA 微調
        ↓
微調模型正確率：72.76%
        ↓
  提升：+14.68%
```

**統計檢驗：**
- **方法**：McNemar's test
- **結果**：微調前後作答表現存在顯著差異

**模型特色：**
- 模型內化知識策略
- 無需外部檢索機制
- 專注中醫藥材領域
- 支援繁體中文

**訪問模型：**
- 🤗 Hugging Face Space：https://huggingface.co/spaces/Atypical281795/CSMU_TCM_Service

---

## 數據來源

### 中藥百科
- **來源**：300 種常用草藥圖譜電子書
- **格式**：純文本 (.txt)
- **內容**：藥材名稱、別名、性味歸經、功能主治、應用
- **圖片**：tcm-exam-herb-ai-assistant 專案

### 醫砭集錦
- **來源**：醫砭 (yibian.hopto.org)
- **授權**：教育用途
- **內容**：
  - 常用中藥 413 種
  - 常用方劑 721 個
- **欄位**：科屬、性味、功效、主治、用法、禁忌、現代藥理等

### 國考題庫
- **來源**：中醫師國家考試歷年試題
- **年份**：民國 94-114 年
- **階段**：
  - 第一階段：基礎醫學
  - 第二階段：臨床醫學
- **題型**：四選一單選題
- **數量**：1,751 題

---

## 授權說明

### 使用限制
- **教育用途**：允許用於學習與教學
- **研究用途**：允許用於學術研究
- **商業用途**：需要額外授權
- **二次分發**：未經許可不得重新分發數據

### 引用說明

如在學術研究中使用本系統或數據，請引用：

```
張詠翔、官翰、簡祥竹（2026）。中醫藥材知識系統：
語言模型於中醫藥材知識微調訓練與驗證研究。
中山醫學大學醫學資訊學系專題研究。
指導教授：曾明性。
```

### 第三方資源

- **Google Gemini API**：遵循 Google AI 使用條款
- **Hugging Face**：遵循 Hugging Face 平台政策
- **醫砭資料**：僅供教育用途，原始資料版權歸醫砭所有

---

## 貢獻指南

歡迎提交 Issue 和 Pull Request！

### 報告問題
- 使用 GitHub Issues
- 提供詳細的錯誤描述
- 附上螢幕截圖（如適用）

### 提交代碼
1. Fork 本倉庫
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 聯絡方式

- **專題指導**：曾明性教授
- **技術支援**：張詠翔、官翰、簡祥竹
- **單位**：中山醫學大學 醫學資訊學系

---

## 版本歷史

### v2.0.0 (2026-01-05)
- 修復醫砭集錦方劑顯示問題
- 添加 Hugging Face 連結
- 重構工具腳本到 tools 文件夾
- 更新完整技術文檔

### v1.1.0 (2026-01-03)
- 新增醫砭集錦功能（413 中藥 + 721 方劑）
- 智能搜索與篩選
- 詳情彈窗優化

### v1.0.0 (2026-01-02)
- 系統框架建立
- 中藥百科功能（300 種）
- 國考題庫基礎功能
- 響應式 UI 設計

---

## 相關資源

- [Hugging Face 文檔](https://huggingface.co/docs)
- [醫砭網站](https://yibian.hopto.org/?lc=tw)
- [LoRA 論文](https://arxiv.org/abs/2106.09685)

---

<div align="center">

**開發時間**：2026-01-03 ~ 2026-01-05

**版本**：2.0.0

**技術棧**：HTML5 + CSS3 + ES6 JavaScript

**數據規模**：300 藥材 + 413 醫砭中藥 + 721 方劑 + 1,751 題庫 = **3,385 筆中醫藥資料**

---

Made by CSMU Medical Informatics Team

</div>
