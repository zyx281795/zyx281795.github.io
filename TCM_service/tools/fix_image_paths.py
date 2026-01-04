import json
import os

json_path = 'herbs_data.json'
base_dir = r'tcm-exam-herb-ai-assistant/public/herbs'
valid_extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']

def fix_paths():
    print(f"Reading {json_path}...")
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON: {e}")
        return

    updates_count = 0
    
    for herb in data:
        updated_urls = []
        changed = False
        
        for url in herb.get('imageUrls', []):
            # Convert URL to local path
            local_path = url.replace('/', os.sep)
            
            if os.path.exists(local_path):
                # File exists, keep it
                updated_urls.append(url)
            else:
                # File missing, try to find alternative extension
                dir_name = os.path.dirname(local_path)
                file_name = os.path.basename(local_path)
                name_without_ext = os.path.splitext(file_name)[0]
                
                found_new = False
                for ext in valid_extensions:
                    candidate_name = name_without_ext + ext
                    candidate_path = os.path.join(dir_name, candidate_name)
                    
                    if os.path.exists(candidate_path):
                        # Found a match!
                        # Reconstruct the URL with forward slashes
                        new_url = os.path.join(os.path.dirname(url), candidate_name).replace(os.sep, '/')
                        updated_urls.append(new_url)
                        print(f"Fixed: {herb['name']} (ID {herb['id']}): {url} -> {new_url}")
                        found_new = True
                        changed = True
                        updates_count += 1
                        break
                
                if not found_new:
                    print(f"Warning: Could not find image for {herb['name']} (ID {herb['id']}): {url}")
                    updated_urls.append(url) # Keep original if no alternative found

        if changed:
            herb['imageUrls'] = updated_urls

    if updates_count > 0:
        print(f"Saving {updates_count} fixes to {json_path}...")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Done.")
    else:
        print("No changes needed.")

if __name__ == "__main__":
    fix_paths()
