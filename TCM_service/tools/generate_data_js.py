import json
import os

try:
    print("Reading herbs_data.json...")
    with open('herbs_data.json', 'r', encoding='utf-8') as f:
        herbs_content = f.read()
        # Verify JSON validity
        json.loads(herbs_content)

    print("Reading yibian_data.json...")
    with open('yibian_data.json', 'r', encoding='utf-8') as f:
        yibian_content = f.read()
        # Verify JSON validity
        json.loads(yibian_content)

    print("Creating data.js...")
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write("// Auto-generated data file for local usage (file:// protocol support)\n")
        f.write(f"window.HERBS_DATA = {herbs_content};\n")
        f.write(f"window.YIBIAN_DATA = {yibian_content};\n")
    
    print("Success: data.js created.")

except Exception as e:
    print(f"Error: {e}")
