# 部署指南：將 BianCang-Qwen2.5-7B 部署到雲端

由於 GitHub Pages 無法執行 LLM，您需要將模型權重託管到 **Hugging Face Spaces**。

## 步驟 1：註冊與準備
1. 前往 [Hugging Face](https://huggingface.co/) 註冊帳號。
2. 前往 [Spaces](https://huggingface.co/spaces) 頁面，點擊 **"Create new Space"**。
   - **Space Name**: 例如 `BianCang-TCM-Chat`
   - **License**: Apache 2.0 或其他
   - **SDK**: 選擇 **Gradio**
   - **Hardware**: 建議選擇 **Nvidia T4 small** (需付費，約 $0.6/hr) 或申請 **ZeroGPU**。
     - *注意：7B 模型在免費的 CPU Basic 上運行會非常非常慢 (可能 30秒才吐一個字)，建議用於展示時開啟 GPU。*
   - **Visibility**: Public (如果您希望前端能直接存取)

## 步驟 2：上傳檔案
Space 建立後，您會看到一個類似 Git 的儲存庫介面。您需要將以下檔案上傳上去：

1. **您的權重檔**：將您的 `BianCang-Qwen2.5-7B-Instruct_finetuned_model_1` 資料夾內的所有內容（`.safetensors`, `config.json`, `tokenizer.json` 等）全部上傳到 Space 的**根目錄**。
   - 由於檔案很大，建議使用 `git lfs` 上傳，或使用網頁版的 "Files" -> "Add file" -> "Upload files" (支援拖曳上傳)。

2. **程式碼檔案**：將我幫您產生的 `backend_deploy` 資料夾中的兩個檔案上傳到 Space 的根目錄：
   - `app.py` (主要執行檔)
   - `requirements.txt` (依賴套件)

## 步驟 3：獲取 API URL
1. 上傳完成後，Space 會顯示 "Building..."。
2. 等待狀態變為 "Running"。
3. 點擊 Space 頁面下方的 **"Embed this space"** 或直接複製您的 Space 網址 (例如 `https://huggingface.co/spaces/YourName/BianCang-TCM-Chat`)。
4. 您的 API 端點通常是：`https://{您的帳號}-{Space名稱}.hf.space/api/predict`
   - *注意：Gradio 4.x 的 API 呼叫方式可能不同，我們在前端使用 `@gradio/client` 庫會最簡單。*

## 步驟 4：更新前端 (GitHub Pages)
1. 回到您的 GitHub 專案。
2. 打開 `app.js`。
3. 找到 `HF_SPACE_ID` 變數，將其修改為您剛剛建立的 Space ID (格式：`您的帳號/Space名稱`)。
4. 推送更新到 GitHub。

---
**補充說明**：
如果您不想付費使用 GPU，另一個選擇是將模型權重上傳到 Hugging Face **Models** (非 Space)，然後使用 Hugging Face 的 **Inference API (Serverless)**。這通常有免費額度，但對於客製化微調模型，可能需要冷啟動時間。本指南採用的是自建 Space 方式，控制權較高。
