path = "c:/INVOICE_FE/src/pages/Settings/components/PrintTemplatesModule.tsx"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# Replace the signature to omit the unused parameter
code = code.replace(
    "const handleDoubleClick = (e: React.MouseEvent, id: string, currentLabel?: string) => {",
    "const handleDoubleClick = (e: React.MouseEvent, id: string) => {"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS: handleDoubleClick signature updated.")
