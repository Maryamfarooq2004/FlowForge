import os
import re

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Aggressive replacements
    new_content = re.sub(r'al-shifa', 'my-org', content, flags=re.IGNORECASE)
    new_content = re.sub(r'Ahmed Khan', 'User Name', new_content)
    new_content = re.sub(r'Ahmed', 'User', new_content)
    new_content = re.sub(r'sara@', 'user@', new_content, flags=re.IGNORECASE)
    new_content = re.sub(r'Sarah J\. Miller', 'Maryam Farooq', new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

root_dir = r'd:\FYP\FYP_implemenation\src'
modified_count = 0
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.js', '.jsx')):
            if clean_file(os.path.join(root, file)):
                modified_count += 1

print(f'Cleaned {modified_count} files.')
