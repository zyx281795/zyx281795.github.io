import os
import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# 設定模型路徑 (上傳到 Hugging Face 後，這裡通常不需要改，或者填寫您的 Model ID)
# 如果您是將權重檔案直接放在 Space 的根目錄，可以使用 "."
# 如果您是上傳了 Model 到 Hub，請填寫 "您的帳號/模型名稱"
MODEL_PATH = "." 

print("Loading model...")

# 載入 Tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)

# 載入模型 (使用 GPU)
# 如果是免費的 CPU Space，請將 device_map="auto" 改為 device="cpu" 並移除 torch_dtype
# 但強烈建議使用 T4 GPU (Hugging Face 上有提供)
try:
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        device_map="auto",
        torch_dtype=torch.float16,
        trust_remote_code=True
    )
except Exception as e:
    print(f"Error loading model with GPU config: {e}")
    print("Falling back to CPU/Default config...")
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
