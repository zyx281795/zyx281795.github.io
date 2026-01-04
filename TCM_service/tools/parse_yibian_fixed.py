import os
import json

def parse_yibian_file(file_path):
    """解析醫砭資料檔案"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    data = {}
    lines = content.split('\n')

    # 解析前面的 key-value pairs
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        # 檢查是否為 tab 分隔的 key-value
        if '\t' in line and not line.endswith('來源') and not line.endswith('歸經') and not line.endswith('功效') and not line.endswith('主治') and not line.endswith('用量') and not line.endswith('禁忌') and not line.endswith('藥理') and not line.endswith('別錄') and not line.endswith('要點') and not line.endswith('應用') and not line.endswith('加減') and not line.endswith('方義'):
            parts = line.split('\t', 1)
            if len(parts) == 2:
                key = parts[0].strip()
                value = parts[1].strip()
                data[key] = value
        else:
            # 遇到 section header，跳出循環
            break
        i += 1

    # 解析 section-based content
    current_section = None
    section_content = []

    while i < len(lines):
        line = lines[i].strip()

        # 檢查是否為 section header
        if line and not line.startswith(' ') and (
            line in ['品種來源', '性味歸經', '功效', '主治', '文獻別錄', '用法用量', '注意禁忌', '現代藥理',
                    '來源', '製法用量', '方義', '辨證要點', '現代應用', '加減']
        ):
            # 保存前一個 section
            if current_section and section_content:
                data[current_section] = '\n'.join(section_content).strip()

            current_section = line
            section_content = []
        elif line:
            # 累積 section 內容
            section_content.append(line)

        i += 1

    # 保存最後一個 section
    if current_section and section_content:
        data[current_section] = '\n'.join(section_content).strip()

    return data

def process_herbs(base_path):
    """處理中藥資料"""
    herbs = []
    categories_path = os.path.join(base_path, '常用中藥', '類別')

    for category in os.listdir(categories_path):
        category_path = os.path.join(categories_path, category)
        if not os.path.isdir(category_path):
            continue

        for herb_folder in os.listdir(category_path):
            herb_path = os.path.join(category_path, herb_folder)
            if not os.path.isdir(herb_path):
                continue

            txt_file = os.path.join(herb_path, f"{herb_folder}.txt")
            if os.path.exists(txt_file):
                try:
                    raw_data = parse_yibian_file(txt_file)

                    herb = {
                        'type': 'herb',
                        'name': raw_data.get('藥名', herb_folder),
                        'alias': raw_data.get('別名', ''),
                        'category': raw_data.get('類別', category),
                        'family': raw_data.get('科屬', ''),
                        'source': raw_data.get('品種來源', ''),
                        'properties': raw_data.get('性味歸經', ''),
                        'effects': raw_data.get('功效', ''),
                        'indications': raw_data.get('主治', ''),
                        'references': raw_data.get('文獻別錄', ''),
                        'usage': raw_data.get('用法用量', ''),
                        'contraindications': raw_data.get('注意禁忌', ''),
                        'pharmacology': raw_data.get('現代藥理', ''),
                        'note': raw_data.get('附註', '')
                    }

                    herbs.append(herb)
                except Exception as e:
                    print(f"Error parsing {txt_file}: {e}")

    return herbs

def process_formulas(base_path):
    """處理方劑資料"""
    formulas = []
    categories_path = os.path.join(base_path, '常用方劑', '類別')

    for category in os.listdir(categories_path):
        category_path = os.path.join(categories_path, category)
        if not os.path.isdir(category_path):
            continue

        for formula_folder in os.listdir(category_path):
            formula_path = os.path.join(category_path, formula_folder)
            if not os.path.isdir(formula_path):
                continue

            txt_file = os.path.join(formula_path, f"{formula_folder}.txt")
            if os.path.exists(txt_file):
                try:
                    raw_data = parse_yibian_file(txt_file)

                    formula = {
                        'type': 'formula',
                        'name': raw_data.get('方劑名稱', formula_folder),
                        'categories': raw_data.get('類別', category),
                        'source': raw_data.get('來源', ''),
                        'composition': raw_data.get('製法用量', ''),
                        'effects': raw_data.get('功效', ''),
                        'indications': raw_data.get('主治', ''),
                        'rationale': raw_data.get('方義', ''),
                        'diagnosticCriteria': raw_data.get('辨證要點', ''),
                        'modifications': raw_data.get('加減', ''),
                        'modernApplications': raw_data.get('現代應用', ''),
                        'note': raw_data.get('附註', '')
                    }

                    formulas.append(formula)
                except Exception as e:
                    print(f"Error parsing {txt_file}: {e}")

    return formulas

# 主程序
base_path = r'C:\Users\Ryan\Desktop\TCM_service\電子書+醫砭\醫砭'

print("Processing herbs...")
herbs = process_herbs(base_path)
print(f"Found {len(herbs)} herbs")

print("Processing formulas...")
formulas = process_formulas(base_path)
print(f"Found {len(formulas)} formulas")

# 組合資料
yibian_data = {
    'herbs': herbs,
    'formulas': formulas
}

# 寫入 JSON 檔案
output_file = r'C:\Users\Ryan\Desktop\TCM_service\yibian_data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(yibian_data, f, ensure_ascii=False, indent=2)

print(f"Data saved to {output_file}")
print(f"Total: {len(herbs)} herbs + {len(formulas)} formulas = {len(herbs) + len(formulas)} items")
