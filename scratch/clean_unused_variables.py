import re

path = "c:/INVOICE_FE/src/pages/Settings/components/PrintTemplatesModule.tsx"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Clean lucide-react imports
# Remove Eye and EyeOff
code = code.replace("Eye, Copy", "Copy")
code = code.replace("EyeOff, FileText", "FileText")

# 2. Remove isAdminRole state
code = re.sub(r"const\s+\[isAdminRole,\s*setIsAdminRole\]\s*=\s*useState<boolean>\(true\);", "", code)

# 3. Remove collapsedSections state
code = re.sub(r"const\s+\[collapsedSections,\s*setCollapsedSections\]\s*=\s*useState<Record<string,\s*boolean>>\(\{\}\);", "", code)

# 4. Remove toggleSectionCollapse function
code = re.sub(
    r"// ─── Collapsible Sections Map toggler ───\s*const\s+toggleSectionCollapse\s*=\s*\(secId:\s*string\)\s*=>\s*\{[^}]*setCollapsedSections\([^)]*\)[^}]*\};",
    "",
    code
)
# Try plain replace if regex fails
toggle_func = """  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [secId]: !prev[secId]
    }));
  };"""
code = code.replace(toggle_func, "")

# 5. Remove handleElementDrop function
element_drop_func = """  const handleElementDrop = (targetId: string, targetIsCustom: boolean) => {
    if (!draggedElement) return;
    executeFieldMove(draggedElement.id, draggedElement.type, targetId, targetIsCustom ? 'custom' : 'default', 'bottom');
  };"""
code = code.replace(element_drop_func, "")

# 6. Remove unused idx in activeColumns.map
code = code.replace("activeColumns.map((col, idx) => {", "activeColumns.map((col) => {")

# 7. Check if any other occurrences of unused toggleSectionCollapse or handleElementDrop
code = code.replace("const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});", "")

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS: Unused variables and imports cleaned.")
