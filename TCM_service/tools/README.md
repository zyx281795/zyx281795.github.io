# 開發工具腳本說明

本文件夾包含專案開發過程中使用的數據處理和轉換工具。這些腳本不參與系統部署，僅用於開發階段的數據準備。

## 📂 腳本列表

### 數據解析與轉換

#### `parse_yibian_fixed.py`
**用途**：解析醫砭原始文本數據
- 從「電子書+醫砭/醫砭」資料夾讀取中藥和方劑文本
- 提取結構化信息（性味歸經、功效、主治等）
- 生成 `yibian_data.json`（413種中藥 + 721個方劑）

#### `generate_data_js.py` & `generate_data_js_v2.py`
**用途**：生成前端數據文件
- 將 JSON 數據轉換為 JavaScript 模塊格式
- 生成 `data.js`（包含 window.HERBS_DATA 和 window.YIBIAN_DATA）
- v2 版本增加了更多數據驗證

#### `convert_exam_data.py` & `convert_exam_data_v2.py`
**用途**：轉換國考題庫數據
- 讀取「第一階段(更新版).csv」和「第二階段(更新版).csv」
- 解析題目、選項、答案等字段
- 生成結構化的題庫 JSON 數據
- v2 版本改善了編碼處理和錯誤容錯

### 數據驗證與檢查

#### `check_encoding.py`
**用途**：檢查文件編碼
- 檢測 CSV 和文本文件的編碼格式
- 確保中文字符正確顯示

#### `check_images.py`
**用途**：驗證藥材圖片
- 檢查圖片文件是否存在
- 驗證圖片路徑的正確性
- 生成圖片清單報告

#### `analyze_csv.py`
**用途**：分析 CSV 數據結構
- 查看 CSV 文件的列結構
- 統計數據行數
- 檢測異常數據

### 文件管理

#### `fix_image_paths.py`
**用途**：修正圖片路徑
- 統一圖片路徑格式
- 修正相對路徑錯誤
- 批量更新 JSON 中的圖片引用

#### `move_pdf.py`
**用途**：移動 PDF 文件
- 將 PDF 文檔移到正確位置
- 整理項目文件結構

## 🔧 使用方式

所有腳本均為 Python 3 腳本，執行前需確保安裝 Python 3.7+：

```bash
# 基本使用
cd tools
python script_name.py

# 範例：解析醫砭數據
python parse_yibian_fixed.py

# 範例：生成 data.js
python generate_data_js_v2.py
```

## ⚠️ 注意事項

1. **執行目錄**：某些腳本需要在專案根目錄執行
2. **數據依賴**：確保原始數據文件存在於正確位置
3. **編碼問題**：處理中文數據時注意使用 UTF-8 編碼
4. **備份數據**：運行數據轉換腳本前建議備份原始數據

## 📝 開發流程

典型的數據準備流程：

1. **解析原始數據** → `parse_yibian_fixed.py`
2. **轉換國考題庫** → `convert_exam_data_v2.py`
3. **生成前端數據** → `generate_data_js_v2.py`
4. **驗證數據完整性** → `check_images.py`, `analyze_csv.py`
5. **修正問題** → `fix_image_paths.py`, `check_encoding.py`

---

**最後更新**：2026-01-05
