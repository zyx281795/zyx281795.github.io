import json

def try_decode(file_path, encoding):
    try:
        with open(file_path, 'r', encoding=encoding) as f:
            content = f.read()
            # Try to parse JSON to ensure it's valid structure
            data = json.loads(content)
            # Check if we can print a sample name to see if it looks like Chinese
            # Getting the last item to match the tail output we saw
            if 'formulas' in data:
                last_formula = data['formulas'][-1]
                print(f"Success with {encoding}: Name = {last_formula.get('name')}")
                return content
    except Exception as e:
        print(f"Failed with {encoding}: {e}")
        return None

file_path = 'yibian_data.json'
print(f"Testing encoding for {file_path}...")

# Try UTF-8 first (it seemed to produce garbage but didn't crash)
content_utf8 = try_decode(file_path, 'utf-8')

# Try CP950 (Big5)
content_cp950 = try_decode(file_path, 'cp950')

# Try UTF-16
content_utf16 = try_decode(file_path, 'utf-16')
