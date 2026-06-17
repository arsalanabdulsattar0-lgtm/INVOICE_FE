import os

diff_path = r'c:\INVOICE_FE\diff.txt'
if os.path.exists(diff_path):
    print("Reading diff.txt...")
    with open(diff_path, 'r', encoding='utf-16') as f:
        content = f.read()
    
    print("Searching for 'CodeSettingsModule'...")
    lines = content.splitlines()
    for idx, line in enumerate(lines):
        if 'CodeSettingsModule' in line or 'Locked' in line or 'typing' in line or 'department' in line:
            print(f"{idx}: {line}")
else:
    print("diff.txt does not exist")
