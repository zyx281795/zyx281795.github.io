import csv
import json
import re
import os

# Common PUA mappings (simplified) - just for testing, actually browsers handle most if font is right.
# We will focus on formatting options.

def normalize_text(text):
    if not text: return ""
    
    # 1. Normalize Options (A, B, C, D)
    # Pattern: Look for A, B, C, D followed by . or : or )
    # We want to ensure they start on a new line for better display.
    
    # Replace "A.", "A:", "[A]" with "(A)"
    text = re.sub(r'\s*(?:A\.|A:| \[A\]|\(A\))\s*', '\n(A) ', text)
    text = re.sub(r'\s*(?:B\.|B:| \[B\]|\(B\))\s*', '\n(B) ', text)
    text = re.sub(r'\s*(?:C\.|C:| \[C\]|\(C\))\s*', '\n(C) ', text)
    text = re.sub(r'\s*(?:D\.|D:| \[D\]|\(D\))\s*', '\n(D) ', text)
    
    # Remove leading dots or garbage if common
    text = text.strip()
    if text.startswith('.'):
        text = text[1:].strip()
        
    return text

def read_csv_data(file_path):
    questions = []
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                raw_q = row.get('question', '')
                raw_a = row.get('answer', '').strip()
                
                if not raw_q or not raw_a:
                    continue
                
                # Normalize
                clean_q = normalize_text(raw_q)
                
                # Basic validation: must have at least (A) and (B) to be a valid MCQ
                # if '(A)' not in clean_q or '(B)' not in clean_q:
                #    continue 
                # Actually, let's keep them but maybe the user will see weird text.
                # Better to include them than miss 600 questions.
                
                questions.append({
                    'id': row.get('num', ''),
                    'question': clean_q,
                    'answer': raw_a,
                    'source': row.get('filename', '')
                })
                
        print(f"Successfully processed {len(questions)} questions from {file_path}")
        return questions
    except Exception as e:
        print(f"Failed to read {file_path}: {e}")
        return []

def update_data_js():
    stage1_path = '第一階段(更新版).csv'
    stage2_path = '第二階段(更新版).csv'
    data_js_path = 'data.js'
    
    print("Processing Stage 1...")
    stage1_data = read_csv_data(stage1_path)
    
    print("Processing Stage 2...")
    stage2_data = read_csv_data(stage2_path)
    
    exam_data = {
        "stage1": stage1_data,
        "stage2": stage2_data
    }
    
    # Read existing data.js to preserve HERBS/YIBIAN data
    # We need to be careful not to duplicate EXAM_DATA if we run this multiple times.
    # The safest way is to read the file, find where EXAM_DATA starts, and replace it.
    
    if os.path.exists(data_js_path):
        with open(data_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        print("Error: data.js not found!")
        return

    # Split content at 'window.EXAM_DATA ='
    # This assumes the file structure we created earlier.
    parts = content.split('window.EXAM_DATA =')
    base_content = parts[0].strip()
    
    # Construct new JS
    # Using ensure_ascii=False to keep Chinese characters readable in the file (if UTF-8)
    # But wait, previous fix required ensure_ascii=True to fix encoding issues?
    # Actually, ensure_ascii=True is SAFER for the browser to render correctly if file encoding varies.
    # Let's use ensure_ascii=True.
    
    new_exam_js = f"\n\nwindow.EXAM_DATA = {json.dumps(exam_data, ensure_ascii=True, indent=2)};\n"
    
    final_content = base_content + new_exam_js
    
    with open(data_js_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
        
    print("Successfully updated data.js with normalized EXAM_DATA")

if __name__ == "__main__":
    update_data_js()
