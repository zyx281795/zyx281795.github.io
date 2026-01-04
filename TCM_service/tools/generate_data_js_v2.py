import json
import os

def read_json_safe(file_path):
    # Try utf-8-sig first (handles BOM)
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            return json.load(f)
    except:
        pass
    
    # Try standard utf-8
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        pass
        
    # Try cp950 (Big5) as fallback
    try:
        with open(file_path, 'r', encoding='cp950') as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed to read {file_path}: {e}")
        return None

try:
    print("Reading herbs_data.json...")
    herbs_data = read_json_safe('herbs_data.json')
    if herbs_data is None:
        raise Exception("Could not read herbs_data.json")

    print("Reading yibian_data.json...")
    yibian_data = read_json_safe('yibian_data.json')
    if yibian_data is None:
        raise Exception("Could not read yibian_data.json")

    print("Creating data.js...")
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write("// Auto-generated data file for local usage (file:// protocol support)\n")
        
        # Use ensure_ascii=True to escape all unicode characters.
        # This prevents encoding issues in browsers and text editors.
        
        f.write("window.HERBS_DATA = ")
        json.dump(herbs_data, f, ensure_ascii=True, indent=2)
        f.write(";\n")
        
        f.write("window.YIBIAN_DATA = ")
        json.dump(yibian_data, f, ensure_ascii=True, indent=2)
        f.write(";\n")
    
    print("Success: data.js created.")

except Exception as e:
    print(f"Error: {e}")