import csv
import json
import os

def read_csv_data(file_path):
    questions = []
    # Try different encodings
    encodings = ['utf-8', 'utf-8-sig', 'cp950', 'big5']
    
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding, newline='') as f:
                # Check if it looks readable
                sample = f.read(1024)
                if not sample: 
                    continue
                f.seek(0)
                
                reader = csv.DictReader(f)
                for row in reader:
                    # Basic validation
                    if 'question' not in row or 'answer' not in row:
                        continue
                        
                    questions.append({
                        'id': row.get('num', ''),
                        'question': row['question'],
                        'answer': row['answer'].strip(),
                        'source': row.get('filename', '')
                    })
                
                print(f"Successfully read {len(questions)} questions from {file_path} using {encoding}")
                return questions
        except Exception as e:
            continue
            
    print(f"Failed to read {file_path} with any known encoding.")
    return []

def update_data_js():
    stage1_path = '第一階段(更新版).csv'
    stage2_path = '第二階段(更新版).csv'
    data_js_path = 'data.js'
    
    print("Reading Stage 1 CSV...")
    stage1_data = read_csv_data(stage1_path)
    
    print("Reading Stage 2 CSV...")
    stage2_data = read_csv_data(stage2_path)
    
    exam_data = {
        "stage1": stage1_data,
        "stage2": stage2_data
    }
    
    print(f"Total Stage 1: {len(stage1_data)}")
    print(f"Total Stage 2: {len(stage2_data)}")
    
    # Read existing data.js
    if os.path.exists(data_js_path):
        with open(data_js_path, 'r', encoding='utf-8') as f:
            current_content = f.read()
    else:
        current_content = "// Auto-generated data file\n"
        
    # Remove existing EXAM_DATA if present (simple string check/split)
    # Actually, we can just append it, or replace if we find the key.
    # To be safe and clean, let's look for "window.EXAM_DATA =" and truncate there, 
    # but since we are generating it, we can just append if it's not there,
    # or rewrite the whole file if we have HERBS/YIBIAN data in memory? 
    # No, we don't want to re-read herbs/yibian if we can avoid it.
    
    # Safer approach: Read herbs/yibian from the file content we just read, then re-write everything.
    # But `herbs_data` can be huge. 
    # Let's just append. If it's defined twice, the second one overwrites (in JS).
    # But files grow indefinitely.
    
    # Better: Split the file by `window.EXAM_DATA =`
    new_content_parts = current_content.split('window.EXAM_DATA =')
    base_content = new_content_parts[0].strip()
    
    # Prepare the JS string
    exam_js = f"\n\nwindow.EXAM_DATA = {json.dumps(exam_data, ensure_ascii=True, indent=2)};\n"
    
    final_content = base_content + exam_js
    
    with open(data_js_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
        
    print("Successfully updated data.js with EXAM_DATA")

if __name__ == "__main__":
    update_data_js()
