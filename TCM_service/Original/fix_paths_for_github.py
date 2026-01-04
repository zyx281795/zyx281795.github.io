import json
import re

json_path = 'data.js'

print(f"Reading {json_path}...")
try:
    with open(json_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract JSON part
    match = re.search(r'window\.HERBS_DATA\s*=\s*(\[.*?\]);', content, re.DOTALL)
    if not match:
        print("Could not find HERBS_DATA in data.js")
        exit(1)
        
    herbs_json_str = match.group(1)
    herbs_data = json.loads(herbs_json_str)
    
    print(f"Loaded {len(herbs_data)} herbs. Fixing paths...")
    
    # Path prefix to replace
    # Currently: "tcm-exam-herb-ai-assistant/public/herbs/"
    # Target: "herbs/..." (relative to index.html in the root)
    # Why? Because on GitHub Pages, the root is the repo root.
    # The image files are in tcm-exam-herb-ai-assistant/public/herbs
    # BUT, wait. If index.html is at root, and images are in tcm-exam-herb-ai-assistant/public/herbs,
    # then "tcm-exam-herb-ai-assistant/public/herbs/1-1-1.jpg" SHOULD be correct IF that folder structure exists on GitHub.
    
    # However, maybe the user wants to serve from root directly?
    # Let's assume the user deployed the *contents* of TCM_service to GitHub Pages.
    # So index.html is at root.
    # And the folder tcm-exam-herb-ai-assistant/public/herbs exists?
    # Let's check if the path is correct relative to index.html.
    
    # If the user uploaded C:\Users\Ryan\Desktop\TCM_service content to GitHub,
    # then "tcm-exam-herb-ai-assistant/public/herbs/" is the correct relative path.
    
    # Wait, check if there's a double encoding issue or backslash issue?
    # The previous `data.js` output shows forward slashes: "tcm-exam-herb-ai-assistant/public/herbs/1-1-1.jpg"
    
    # Maybe the issue is case sensitivity on GitHub Pages (Linux) vs Windows?
    # We already fixed extensions.
    
    # Let's try to verify if the path structure on GitHub matches.
    # Repo: https://github.com/zyx281795/TCM_service
    # If I browse there... 
    # It seems the folder is "tcm-exam-herb-ai-assistant".
    
    # Ah, let's just make sure we are not assuming anything about the deployment root.
    # If the user is deploying the *root* folder, then the path is correct.
    
    # Let's try to remove the project folder prefix if it's redundant?
    # No, that folder physically exists in the file list.
    
    # Maybe the issue is the leading slash? No, there isn't one.
    
    # Let's try to just ensure standard relative paths.
    # We will iterate and ensure no backslashes.
    
    count = 0
    for herb in herbs_data:
        new_urls = []
        for url in herb.get('imageUrls', []):
            # Ensure forward slashes
            clean_url = url.replace('\\', '/')
            new_urls.append(clean_url)
            if clean_url != url:
                count += 1
        herb['imageUrls'] = new_urls
        
    print(f"Fixed slashes for {count} urls.")
    
    # We need to write this back into data.js
    # We'll replace the HERBS_DATA part
    
    new_herbs_json = json.dumps(herbs_data, ensure_ascii=True, indent=2)
    
    # Replace in content
    new_content = content.replace(herbs_json_str, new_herbs_json)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Updated data.js")

except Exception as e:
    print(f"Error: {e}")
