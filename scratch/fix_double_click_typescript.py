path = "c:/INVOICE_FE/src/pages/Settings/components/PrintTemplatesModule.tsx"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# Replace handleDoubleClick signature to accept _currentLabel
code = code.replace(
    "const handleDoubleClick = (e: React.MouseEvent, id: string) => {",
    "const handleDoubleClick = (e: React.MouseEvent, id: string, _currentLabel?: string) => {"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS: handleDoubleClick updated with ignored parameter _currentLabel.")
