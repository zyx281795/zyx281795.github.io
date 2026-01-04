import os
import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

print("=== Application Starting ===")

try:
    # 自動偵測模型路徑
    # 優先尋找權重資料夾，若找不到則看根目錄
    if os.path.exists("BianCang-Qwen2.5-7B-Instruct_finetuned_model_1"):
        MODEL_PATH = "BianCang-Qwen2.5-7B-Instruct_finetuned_model_1"
    else:
        MODEL_PATH = "." 

    print(f"Loading model from: {MODEL_PATH}")

    # 載入 Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)

    # 載入模型
    # 強制使用 CPU 模式以避免在免費用戶端出現 CUDA Out of Memory
    # 如果您有 GPU (T4/A10G)，可將 device_map 改為 "auto" 並取消註解 torch_dtype
    print("Loading model on CPU (this might be slow)...")
    try:
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_PATH,
            device_map="cpu", # 強制 CPU
            # torch_dtype=torch.float16, # CPU 上通常不支援 float16 推論，註解掉以防萬一
            trust_remote_code=True
        )
    except Exception as e:
        print(f"Error loading model: {e}")
        # Final fallback attempt
        model = AutoModelForCausalLM.from_pretrained(MODEL_PATH, trust_remote_code=True)

    def predict(message, history):
        # 構建 Prompt (根據 Qwen 的格式)
        # 注意：如果您的微調模型有特殊的 Prompt Template，請在此修改
        
        system_prompt = "你是一個專業的中醫藥材知識助手。你具備深厚的中醫理論基礎，特別擅長中藥材的性味、歸經、功效與主治。"
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        for human, assistant in history:
            messages.append({"role": "user", "content": human})
            messages.append({"role": "assistant", "content": assistant})
        
        messages.append({"role": "user", "content": message})
        
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
        
        generated_ids = model.generate(
            model_inputs.input_ids,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )
        
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]
        
        response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return response

    # 建立 Gradio 介面 (這會自動產生 API)
    demo = gr.ChatInterface(
        fn=predict,
        title="BianCang-Qwen2.5-7B TCM Chatbot",
        description="中醫藥材知識微調模型"
    )

    if __name__ == "__main__":
        demo.launch(server_name="0.0.0.0", server_port=7860, show_api=True)

except Exception as e:
    print(f"!!! CRITICAL ERROR ===\n{e}\n======================")
    raise e
