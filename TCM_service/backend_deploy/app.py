import os
import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

print("=== Application Starting (LoRA Mode with Quantization) ===")

try:
    # 1. 設定 Base Model (基礎模型)
    BASE_MODEL_ID = "QLU-NLP/BianCang-Qwen2.5-7B"
    
    # 2. 自動偵測 Adapter (微調權重) 路徑
    if os.path.exists("BianCang-Qwen2.5-7B-Instruct_finetuned_model_1"):
        ADAPTER_PATH = "BianCang-Qwen2.5-7B-Instruct_finetuned_model_1"
    else:
        ADAPTER_PATH = "." 

    print(f"Base Model: {BASE_MODEL_ID}")
    print(f"Adapter Path: {ADAPTER_PATH}")

    # 3. 載入 Tokenizer
    print("Loading Tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID, trust_remote_code=True)

    # 4. 載入 Base Model (使用 4-bit 量化以節省 VRAM，適合 T4 GPU)
    print("Loading Base Model with 4-bit quantization...")
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4"
    )

    try:
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_ID,
            quantization_config=quantization_config,
            device_map="auto",
            trust_remote_code=True,
            offload_folder="offload" # 加入 offload 資料夾以防萬一
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
        model = PeftModel.from_pretrained(
            base_model, 
            ADAPTER_PATH,
            offload_folder="offload" # 加入 offload 資料夾解決 Peft 報錯
        )
        print("LoRA Adapter loaded successfully!")
    except Exception as e:
        print(f"Failed to load adapter: {e}")
        print("Running with Base Model only as fallback.")
        model = base_model

    def predict(message, history):
        # 構建 Prompt
        system_prompt = "你是一個專業的中醫藥材知識助手。你具備深厚的中醫理論基礎，特別擅長中藥材的性味、歸經、功效與主治。"
        
        messages = [{"role": "system", "content": system_prompt}]
        for human, assistant in history:
            messages.append({"role": "user", "content": human})
            messages.append({"role": "assistant", "content": assistant})
        messages.append({"role": "user", "content": message})
        
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
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

    # 建立 Gradio 介面
    demo = gr.ChatInterface(
        fn=predict,
        title="BianCang-Qwen2.5-7B TCM Chatbot",
        description="中醫藥材知識微調模型 (4-bit LoRA)"
    )

    if __name__ == "__main__":
        # 移除 Gradio 4.x 不支援的 show_api 參數
        demo.launch(server_name="0.0.0.0", server_port=7860)

except Exception as e:
    print(f"!!! CRITICAL ERROR ===\n{e}\n======================")
    raise e
