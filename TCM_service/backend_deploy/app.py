import os
import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

print("=== Application Starting (LoRA Mode) ===")

try:
    # 1. 設定 Base Model (基礎模型)
    # 這是您微調時使用的原始模型
    BASE_MODEL_ID = "QLU-NLP/BianCang-Qwen2.5-7B"
    
    # 2. 自動偵測 Adapter (微調權重) 路徑
    # 這是您上傳的資料夾
    if os.path.exists("BianCang-Qwen2.5-7B-Instruct_finetuned_model_1"):
        ADAPTER_PATH = "BianCang-Qwen2.5-7B-Instruct_finetuned_model_1"
    else:
        ADAPTER_PATH = "." 

    print(f"Base Model: {BASE_MODEL_ID}")
    print(f"Adapter Path: {ADAPTER_PATH}")

    # 3. 載入 Tokenizer (通常使用 Base Model 的)
    print("Loading Tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID, trust_remote_code=True)

    # 4. 載入 Base Model
    print("Loading Base Model...")
    try:
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_ID,
            device_map="auto",
            torch_dtype=torch.float16,
            trust_remote_code=True
        )
    except Exception as e:
        print(f"GPU load failed: {e}. Fallback to CPU.")
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_ID,
            device_map="cpu",
            trust_remote_code=True
        )

    # 5. 掛載 LoRA Adapter
    print("Loading LoRA Adapter...")
    try:
        model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)
        print("LoRA Adapter loaded successfully!")
    except Exception as e:
        print(f"Failed to load adapter: {e}")
        print("Running with Base Model only as fallback.")
        model = base_model

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
