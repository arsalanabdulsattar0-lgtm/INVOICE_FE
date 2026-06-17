import os

src_dir = r'c:\INVOICE_FE\src'
matches = []
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.html', '.css')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'locked' in content.lower():
                    matches.append((path, "locked"))
                if 'free typing' in content.lower():
                    matches.append((path, "free typing"))
            except Exception as e:
                pass

print("Search results:")
for path, match_type in matches:
    print(f"Found '{match_type}' in {path}")
