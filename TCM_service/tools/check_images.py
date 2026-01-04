import json
import os

targets = ['枇杷葉', '硫磺', '青葙子']
json_path = 'herbs_data.json'
base_dir = r'tcm-exam-herb-ai-assistant/public/herbs'

try:
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for herb in data:
        if herb['name'] in targets:
            print(f"--- {herb['name']} (ID: {herb['id']}) ---")
            urls = herb.get('imageUrls', [])
            print(f"Configured URLs: {urls}")
            
            for url in urls:
                # The URL in json likely includes 'tcm-exam-herb-ai-assistant/public/herbs/...' 
                # or just 'herbs/...'? Let's check.
                # Based on previous read_file output: "tcm-exam-herb-ai-assistant/public/herbs/1-1-1.jpg"
                
                # We need to map this to the local file system path.
                # The current working directory is C:\Users\Ryan\Desktop\TCM_service
                # The file structure is C:\Users\Ryan\Desktop\TCM_service\tcm-exam-herb-ai-assistant\public\herbs\...
                
                # Normalize path separators
                local_path = url.replace('/', os.sep)
                
                if os.path.exists(local_path):
                    print(f"  [OK] Found: {local_path}")
                else:
                    print(f"  [MISSING] Not found: {local_path}")
            
            # check what files actually exist for this ID
            # Assuming files start with the ID, e.g., "3-3-1.jpg" for ID 3?
            # Let's search the directory for files starting with "{herb['id']}-"
            print(f"  Searching for files starting with '{herb['id']}-' in {base_dir}...")
            if os.path.exists(base_dir):
                found_files = [f for f in os.listdir(base_dir) if f.startswith(f"{herb['id']}-")]
                print(f"  Actual files found: {found_files}")
            else:
                print(f"  Directory {base_dir} does not exist!")

except Exception as e:
    print(f"Error: {e}")
