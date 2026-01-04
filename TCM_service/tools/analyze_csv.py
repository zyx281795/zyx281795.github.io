import csv
import re

def analyze_file(file_path):
    print(f"--- Analyzing {file_path} ---")
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            missing_options = 0
            pua_chars = set()
            
            for row in reader:
                q = row.get('question', '')
                if not q: continue
                count += 1
                
                # Check for options
                if '(A)' not in q:
                    missing_options += 1
                    if missing_options < 3:
                        print(f"Sample missing (A): {q[:100]}...")
                
                # Check for PUA/Compatibility chars
                for char in q:
                    cp = ord(char)
                    if (0xE000 <= cp <= 0xF8FF) or (0xF900 <= cp <= 0xFAFF):
                        hex_val = f"{cp:04x}"
                        pua_chars.add(r"\u" + hex_val)

            print(f"Total rows: {count}")
            print(f"Rows missing '(A)': {missing_options}")
            print(f"PUA Characters found: {list(pua_chars)[:20]}")
            
    except Exception as e:
        print(f"Error: {e}")

analyze_file('第一階段(更新版).csv')
analyze_file('第二階段(更新版).csv')