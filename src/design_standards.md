# INVOICE_FE — Design Standards Reference
PROJECT DEVELOPMENT RULES

Before implementing any UI:

1. Read design_standards.md first.
2. Reuse existing components.
3. Never create new Button, Card, Input, Select, Table components if a standard version already exists.
4. Follow existing typography exactly.
5. Follow existing spacing exactly.
6. Follow existing theme tokens exactly.
7. Maintain visual consistency with Create Invoice screen.
8. Never introduce a new design system.
9. Never hardcode colors if theme tokens exist.
10. Prefer modifying existing components over creating duplicates.

MANDATORY:

- design_standards.md is the single source of truth.
- Existing UI components must always be reused.
- Existing theme must always be respected.
- Existing font sizes must always be respected.
- Existing spacing system must always be respected.
- Existing Create Invoice screen is the visual reference for all new screens.

> **Rule:** Koi bhi naya feature ya screen banana ho, **pehle yeh document padho**, phir existing standard components use karo. Apni marzi se nayi styling mat banao.

---

## 📜 Core Design Policies & Rules

### 🔄 Component Reuse Policy
Before creating any UI element:
1. Search existing components first
2. Reuse existing component
3. Extend existing component if absolutely required
4. Create new component only as last resort

**Never create new:**
- Buttons
- Inputs
- Selects
- ComboBoxes
- Cards
- Chips
- Tables
- Drawers
- Modals
unless explicitly requested.

### 🛡️ Existing Component Protection
All existing implemented components are the source of truth. Do not redesign existing components.
Do not modify:
- Colors
- Border Radius
- Shadows
- Heights
- Typography
- Spacing
unless explicitly requested.
**If there is any conflict:** Existing implementation wins over documentation.

### 🎨 Design Authority
This document is the single source of truth for UI. All screens must follow this document.
Consistency is more important than creativity. Do not introduce new design systems.

### 📐 Spacing System
Use only these gaps:
- `gap-1` = 4px
- `gap-2` = 8px
- `gap-3` = 12px
- `gap-4` = 16px
- `gap-5` = 20px
- `gap-6` = 24px

Page sections spacing: `space-y-5`
Card internal padding: `p-3` (default) or `p-4` (large)
Do not invent custom spacing values.

### 📋 Form Layout Standard
- **2-column layout** = default
- **Desktop**: `grid-cols-2`
- **Large forms**: `grid-cols-3`
- **Mobile**: `grid-cols-1`

**Field order:**
1. Basic Information
2. Contact Information
3. Tax Information
4. Financial Information
5. Notes

### 🤖 AI Generation Rules
Before generating any screen:
1. Read `design_standards.md`
2. Reuse existing components
3. Use existing typography
4. Use existing spacing
5. Use existing colors

Do **not**:
- Create new button styles
- Create new input styles
- Create new card styles
- Create new typography scales
- Create new spacing scales
Reuse existing implementation.

### ⚙️ Settings Module Standard
Settings pages must follow:
- **Left**: Settings Navigation
- **Right**: Content Area

Each settings page must contain:
- Header
- Summary Card
- Data Table
- Filter Drawer
- Add/Edit Drawer
No custom layouts allowed.

### 💵 Currency & Symbology Formatting
- **Standard**: Always place the currency denomination/symbology inside the column headers, section headers, or card labels (e.g. `Price (Rs.)`, `Amount (Rs.)`, `Total balance (Rs.)`, `Gross Subtotal (Rs.)`).
- **No Prefixes in Rows**: Never append currency symbol prefixes (e.g., `Rs. 450`, `PKR 120`) to the individual list/table row cells or numeric totals values. Formatted values must be prefix-free numeric strings (e.g., `450.00`, `12,850.50`).

### 🔡 Text Case — Mandatory Rule
- **Standard**: All visible UI text (headings, labels, table headers, buttons, placeholders, section titles, page titles, badges) must be in **sentence case** (first letter capital, rest lowercase).
- **Never use** `uppercase` CSS class or `text-transform: uppercase` anywhere in the UI.
- **No ALL CAPS** text is allowed in any component, table header, badge, or label.
- **Exception**: Short abbreviations or units already in a standard form (e.g. `Rs.`, `PKR`, `ID`, `SKU`, `Qty`) are allowed as-is.

### 👤 Initials Avatar Boxes (Color Boxes)
- **Standard**: Do NOT render colored initials box avatars (displaying client initials like `BT`, `GS`, `AC` in styled color squares) next to client or customer names in listings, invoice rows, or dashboards. Render standard client text directly.

### 📐 Table Columns & padding (Actions Column)
- **Standard Widths**: Keep actions columns at `w-20` for rows with 3 icons (Products, Customers) and `w-28` for rows with 4 icons (Invoices).
- **Header Padding**: Use `px-2` / `!px-2` horizontal padding on the Action header cell (`<th>`) when the label is "Actions" to prevent text wrapping or horizontal clipping.

### 🖥️ Preview Modal Design
- **Standard Header**: Modal headers must feature a single-line title structure (`h2 className="text-lg font-black"`) containing the invoice/entity ID and standard colored status badges. Do not use two-line headers or subtitles in modals.
- **Scroll Padding**: Use standard padding of `p-6` in the modal scrollable area.
- **Financial Cards**: Use soft styled border cards for warnings or overdue items (e.g. Balance Due alert uses `bg-rose-50/50 border border-rose-100 rounded-xl text-rose-600`) instead of heavy blocks.
- **Print Layout Calculations**: Printed invoice layouts must dynamically compute subtotals, tax rate totals, discount totals, shipping charges, and balance due calculations from the source invoice document details.

> [!IMPORTANT]
> This document is mandatory. Every new screen, feature, component, modal, drawer, table, form, card, button, input, filter, and dashboard widget must follow this document. No custom styling is allowed unless explicitly requested.

---

## 📁 Standard Components — Paths

| Component | File |
|-----------|------|
| `Button` | `src/components/ui/Button.tsx` |
| `Card` | `src/components/ui/Card.tsx` |
| `Chip` + semantic chips | `src/components/ui/Chip.tsx` |
| `FilterDrawer` | `src/components/ui/FilterDrawer.tsx` |
| `ProductFilterDrawer` | `src/components/ui/ProductFilterDrawer.tsx` |
| `Input`, `TextArea`, `Select`, `ComboBox`, `ScrollArea`, `Toggle` | `src/components/ui/FormControls.tsx` |
| `InlineProductForm` | `src/components/ui/InlineProductForm.tsx` |
| Theme tokens | `src/context/ThemeContext.tsx` → `useTheme()` → `brand` |

---

## 🎨 Theme Tokens — `brand`

Har component mein theme colors yahan se aate hain. **Direct hex color mat likhо — brand tokens use karo jahan bhi possible ho.**

```tsx
const { brand } = useTheme();
```

| Token | Kab use karo |
|-------|-------------|
| `brand.primary` | Main action color, header bar bg, active states |
| `brand.dark` | Page titles, strong text |
| `brand.accent` | Alert/warning dots, secondary accents |
| `brand.soft` | Light tinted badge backgrounds |
| `brand.surface` | Subtle section backgrounds |
| `brand.border` | Themed borders |
| `brand.textPrimary` | Body text |
| `brand.textSecondary` | Muted/secondary text |

### Fixed Non-Theme Colors (consistent across all themes)

| Purpose | Color |
|---------|-------|
| Page background | `#F4F7FD` |
| White card bg | `#FFFFFF` |
| Table row border | `brand.dark + '08'` |
| Section border | `brand.dark + '10'` |
| Text — body | `#304166` |
| Text — muted | `#64748B` (slate-500) |
| Text — lighter | `#94A3B8` (slate-400) |

---

## 🔤 Typography Scale

**Yeh font sizes hi use karni hain — baray ya chote mat karo:**

| Use Case | Class |
|----------|-------|
| Page title (h1) | `text-2xl font-black tracking-tight` |
| Section heading | `text-[13px] font-black` — styled with `brand.dark` (or `text-slate-900`) |
| Table header (`<th>`) | `text-[10px] font-black tracking-widest` — **sentence case, never uppercase** |
| Table body cell | `text-[12px] font-normal` |
| Sub-label / caption | `text-[10px] font-medium text-slate-400` |
| Badge / chip | `text-[9px]` (xs) · `text-[11px]` (sm) · `text-[12px]` (md) |
| Button text | Auto set by `Button` size prop |
| Form label | `text-[11px] font-bold text-slate-400` |
| Form input | `text-[11px]` (compact) · `text-sm` (default) |

---

## 🧩 Component Usage Guide

---

### 1. `Button`

```tsx
import { Button } from '../../components/ui/Button';
```

**Props:**

| Prop | Type | Values |
|------|------|--------|
| `variant` | string | `primary` · `secondary` · `danger` · `ghost` · `outline` · `white` |
| `size` | string | `xs` · `sm` · `md` · `lg` |
| `icon` | LucideIcon | any Lucide icon |
| `iconPosition` | string | `left` (default) · `right` |
| `loading` | boolean | shows spinner |
| `fullWidth` | boolean | `w-full` |

**Examples:**

```tsx
// Primary action
<Button variant="primary" size="md" icon={Plus}>Add Customer</Button>

// White/outline toolbar button
<Button variant="white" size="md" icon={SlidersHorizontal}>Filter</Button>

// Danger
<Button variant="danger" size="sm" icon={Trash2}>Delete</Button>

// Ghost (icon-only)
<Button variant="ghost" size="xs" icon={Eye} title="View" className="!px-1" />

// Loading state
<Button variant="primary" size="md" loading>Saving...</Button>
```

**Visual variants:**

| Variant | Looks Like |
|---------|-----------|
| `primary` | Blue filled, rounded-lg, shadow |
| `white` | White bg, light border, subtle shadow |
| `ghost` | Transparent, slate hover |
| `danger` | Red tinted bg, red text |
| `outline` | Transparent with border |
| `secondary` | Slate-100 bg |

---

### 2. `Card`

```tsx
import Card from '../../components/ui/Card';
```

Base: `bg-white rounded-xl border p-3`

```tsx
// Default
<Card>Content here</Card>

// Override padding or border
<Card className="p-4 shadow-sm" style={{ borderColor: brand.dark + '10' }}>
  Content
</Card>
```

---

### 3. `Chip` — Pill Badge

```tsx
import { Chip, ActiveChip, InactiveChip, FilerChip, NonFilerChip, InfoChip, NeutralChip } from '../../components/ui/Chip';
```

**Props:**

| Prop | Type | Default |
|------|------|---------|
| `label` | string | required |
| `icon` | LucideIcon | — |
| `iconColor` | string | same as `color` |
| `color` | string | `#475569` |
| `bg` | string | `#FFFFFF` |
| `border` | string | `#E2E8F0` |
| `size` | `'xs'` · `'sm'` · `'md'` | `'sm'` |
| `onClick` | `() => void` | — |

**Pre-built semantic chips (use these first):**

```tsx
// Status chips — table rows mein
<ActiveChip   label="Active"    size="md" onClick={() => toggle(id)} />
<InactiveChip label="Inactive"  size="md" onClick={() => toggle(id)} />

// Tax status chips
<FilerChip    label="Filer"     size="md" />
<NonFilerChip label="Non-Filer" size="md" />

// Info / neutral
<InfoChip    label="Draft"   size="md" />
<NeutralChip label="Walk-in" size="md" />
```

**Custom chip (jab preset na ho):**

```tsx
<Chip
  label="Pending"
  color="#D97706"
  bg="#FFFBEB"
  border="#FDE68A"
  size="xs"
/>
```

**Clickable / action chip (AI bar style):**

```tsx
<Chip
  label="Add Customer"
  icon={PlusCircle}
  iconColor="#10B981"
  color="#374151"
  bg="#FFFFFF"
  border="#E2E8F0"
  size="sm"
  onClick={() => doSomething()}
/>
```

---

### 4. `FilterDrawer`

```tsx
import { FilterDrawer } from '../../components/ui/FilterDrawer';
```

**Props:**

| Prop | Type |
|------|------|
| `isOpen` | boolean |
| `onClose` | `() => void` |
| `onReset` | `() => void` |
| `onApply` | `() => void` |
| `title` | string (default: "Filters") |
| `resetLabel` | string (default: "Reset All") |
| `applyLabel` | string (default: "Apply Filters") |
| `children` | ReactNode — filter controls |

```tsx
<FilterDrawer
  isOpen={showFilterDrawer}
  onClose={() => setShowFilterDrawer(false)}
  onReset={handleResetFilters}
  onApply={() => setShowFilterDrawer(false)}
>
  {/* Filter controls yahan — niche wale patterns use karo */}
</FilterDrawer>
```

---

### 4a. `ProductFilterDrawer`

```tsx
import { ProductFilterDrawer } from '../../components/ui/ProductFilterDrawer';
```

Controlled product filter sidebar populated with standard selects, inputs, and comboboxes.

```tsx
<ProductFilterDrawer
  isOpen={showFilterDrawer}
  onClose={() => setShowFilterDrawer(false)}
  onReset={handleResetFilters}
  selectedCategory={selectedCategory}
  setSelectedCategory={(cat) => setSelectedCategory(cat)}
  priceOperator={priceOperator}
  setPriceOperator={(op) => setPriceOperator(op)}
  priceValue={priceValue}
  setPriceValue={(val) => setPriceValue(val)}
  stockOperator={stockOperator}
  setStockOperator={(op) => setStockOperator(op)}
  stockValue={stockValue}
  setStockValue={(val) => setStockValue(val)}
  selectedStatus={selectedStatus}
  setSelectedStatus={(status) => setSelectedStatus(status)}
  selectedSupplier={selectedSupplier}
  setSelectedSupplier={(sup) => setSelectedSupplier(sup)}
/>
```

---

### 5. `Input`

```tsx
import { Input } from '../../components/ui/FormControls';
```

```tsx
<Input
  variant="compact"           // 'default' | 'compact' | 'transparent'
  label="Customer Name *"
  placeholder="e.g. Acme Corp"
  value={editing.name}
  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
/>

// Number input
<Input variant="compact" label="Credit Limit (Rs.)" type="number" value={val} onChange={...} />

// Date input
<Input variant="compact" label="Date" type="date" value={val} onChange={...} />
```

---

### 6. `TextArea`

```tsx
import { TextArea } from '../../components/ui/FormControls';
```

```tsx
<TextArea
  label="Billing Address"
  value={editing.address}
  onChange={(e) => setEditing({ ...editing, address: e.target.value })}
  placeholder="Street, floor, building..."
  className="!rounded-lg text-[11px] py-1.5 px-3 h-14"
/>
```

---

### 7. `Select`

```tsx
import { Select } from '../../components/ui/FormControls';
```

Options format: `{ value: string; label: string }[]`

```tsx
<Select
  label="Status"
  value={selectedStatus}
  onChange={(e) => setSelectedStatus(e.target.value)}
  options={[
    { value: 'all',      label: 'All' },
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]}
/>
```

---

### 8. `ComboBox`

```tsx
import { ComboBox } from '../../components/ui/FormControls';
```

> ⚠️ **Options format:** `{ id: string; name: string; subtitle?: string }[]`
> `value` / `label` **nahi** — sirf `id` / `name`.

```tsx
<ComboBox
  label="Category"
  value={selectedCategoryId}           // string (id)
  onChange={(id) => setCategory(id)}   // returns the selected id
  options={[
    { id: 'cat-1', name: 'Electronics' },
    { id: 'cat-2', name: 'Hardware',   subtitle: 'Physical parts' },
  ]}
  placeholder="Select category..."
  variant="compact"   // 'default' | 'compact'
/>
```

> **Dropdown**: opens only when 3+ characters typed (search mode).

---

### 9. `ScrollArea`

```tsx
import { ScrollArea } from '../../components/ui/FormControls';
```

```tsx
<ScrollArea maxHeight="450px" className="w-full" style={{ overscrollBehavior: 'contain' }}>
  <table>...</table>
</ScrollArea>

---

### 9a. `Toggle`

```tsx
import { Toggle } from '../../components/ui/FormControls';
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `checked` | boolean | Toggle state |
| `onChange` | `(val: boolean) => void` | Change handler |
| `label` | string (optional) | Label text rendered on the right |
| `className` | string (optional) | Additional Tailwind classes |

```tsx
<Toggle
  checked={isActive}
  onChange={(val) => setIsActive(val)}
  label="Product is Active"
/>
```

---

### 9b. `InlineProductForm`

```tsx
import InlineProductForm from '../../components/ui/InlineProductForm';
```

Overlay modal form for creating or editing products with multi-step progression.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Control drawer visibility |
| `onClose` | `() => void` | Close handler |
| `initialData` | `Partial<Product>` (optional) | Pre-populate form for editing |

```tsx
<InlineProductForm
  isOpen={isProductFormOpen}
  onClose={() => setShowProductForm(false)}
  initialData={editingProduct}
/>
```

---

## 📐 Page Layout Patterns

### Page Wrapper (every listing page)

```tsx
<div className="min-h-full p-6 space-y-5" style={{ background: '#F4F7FD' }}>
  {/* Page Header */}
  {/* Stats Cards */}
  {/* Table Card */}
</div>
```

---

### Page Header

```tsx
<motion.div
  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
>
  <div>
    <h1 className="text-2xl font-black tracking-tight" style={{ color: brand.dark }}>
      Page Title
    </h1>
    <p className="text-[12px] font-medium text-slate-400 mt-0.5">
      Subtitle / count text
    </p>
  </div>
  <div className="flex items-center gap-2.5">
    {/* Filter + Add buttons */}
    <Button variant="white" size="md" icon={SlidersHorizontal} onClick={...}>Filter</Button>
    <Button variant="primary" size="md" icon={Plus}>Add Item</Button>
  </div>
</motion.div>
```

---

### Stats Cards Row

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map((stat, i) => (
    <motion.div key={stat.label}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07 }}
      className="bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all group cursor-default"
      style={{ borderColor: brand.dark + '10' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 tracking-wide">{stat.label}</p>
          <p className="text-2xl font-black mt-1 tracking-tight" style={{ color: brand.dark }}>{stat.value}</p>
          <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
          style={{ background: stat.bg }}>
          <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
        </div>
      </div>
    </motion.div>
  ))}
</div>
```

---

### Table Card Wrapper

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
  style={{ borderColor: brand.dark + '10' }}
>
  {/* Table Header Bar */}
  {/* Bulk Actions Bar */}
  {/* ScrollArea + table */}
  {/* Pagination */}
</motion.div>
```

---

### Table Header Bar (brand colored)

```tsx
<div className="px-4 py-2.5 flex items-center justify-between text-white"
  style={{ backgroundColor: brand.primary }}>
  <div className="flex items-center gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
    <h3 className="text-[11px] font-black tracking-wide">Section Title</h3>
    <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ backgroundColor: brand.soft, color: brand.dark }}>
      {count} Items
    </span>
  </div>
  <div className="flex items-center gap-2">
    {/* Search input, Sort button, View toggle */}
  </div>
</div>
```

---

### Table `<thead>` — Headers

```tsx
<thead className="sticky top-0 z-10 bg-white">
  <tr className="border-b" style={{ borderColor: brand.dark + '10' }}>
    {/* Checkbox column */}
    <th className="px-4 py-3 text-center w-12 border-b">
      <input type="checkbox" ... className="rounded border-slate-300 cursor-pointer w-4 h-4" />
    </th>
    {/* Data columns */}
    {columns.map((h, idx) => (
      <th key={h.label}
        className={`px-4 py-3 text-left border-b ${h.key ? 'cursor-pointer hover:bg-blue-50/40 select-none' : ''} transition-colors ${idx !== 0 ? 'border-l border-slate-100' : ''} ${h.width}`}
        style={{ borderColor: brand.dark + '10' }}
        onClick={() => h.key && handleSort(h.key)}
      >
        <span className="text-[10px] font-black tracking-widest inline-flex items-center gap-0.5 whitespace-nowrap"
          style={{ color: sortKey === h.key ? brand.primary : brand.dark + '70' }}>
          {h.label}
          {h.key && <SortArrow col={h.key} />}
        </span>
      </th>
    ))}
  </tr>
</thead>
```

---

### Table `<tbody>` — Data Rows

```tsx
<motion.tr key={item.id}
  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 350, damping: 30, delay: i * 0.03 }}
  className={`group border-b transition-colors hover:bg-slate-50/60 cursor-pointer last:border-0 ${isSelected ? 'bg-blue-50/15' : ''}`}
  style={{ borderColor: brand.dark + '08' }}
>
  {/* All <td> cells: */}
  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">
    Value here
  </td>
</motion.tr>
```

**Cell text standard:** `text-[12px] font-normal` — **bold mat karo cells mein.**
- **Status / Tax Filer Badges:** Always use `size="md"` (standard 12px) for ActiveChip, InactiveChip, FilerChip, and NonFilerChip inside table list cells. Badges must have a thin vertical padding (`py-0.5`) and use `whitespace-nowrap` to prevent label text from wrapping.

---

### Pagination

```tsx
{totalPages > 1 && (
  <div className="px-4 py-3 border-t flex items-center justify-between"
    style={{ borderColor: brand.dark + '08', background: brand.surface + '60' }}>
    <p className="text-[11px] font-medium text-slate-400">
      Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, total)} of {total}
    </p>
    <div className="flex items-center gap-1">
      <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1} variant="white" size="xs" icon={ChevronLeft} className="w-8 h-8 px-0" />
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <Button key={p} onClick={() => setCurrentPage(p)}
          variant={currentPage === p ? 'primary' : 'white'} size="xs" className="w-8 h-8 px-0 border-none">
          {p}
        </Button>
      ))}
      <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages} variant="white" size="xs" icon={ChevronRight} className="w-8 h-8 px-0" />
    </div>
  </div>
)}
```

---

## 🎛️ FilterDrawer — Inner Filter Patterns

FilterDrawer ke andar yeh standard patterns use karo:

### Segmented Control (3-option toggle)

```tsx
<div className="space-y-1.5">
  <label className="block text-[11px] font-bold text-slate-500">Filter Label</label>
  <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
    {[
      { key: 'all',    label: 'All' },
      { key: 'opt1',   label: 'Option 1' },
      { key: 'opt2',   label: 'Option 2' },
    ].map(opt => {
      const isActive = selectedValue === opt.key;
      return (
        <button key={opt.key}
          onClick={() => setSelectedValue(opt.key)}
          className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer ${
            isActive
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
</div>
```

### ComboBox Filter (dropdown select)

```tsx
<div className="space-y-1.5">
  <label className="block text-[11px] font-bold text-slate-500">Filter Label</label>
  <ComboBox
    value={selectedId === 'all' ? '' : selectedId}
    onChange={(val) => { setSelectedId(val || 'all'); setCurrentPage(1); }}
    options={[
      { id: 'opt-1', name: 'Option One' },
      { id: 'opt-2', name: 'Option Two' },
    ]}
    placeholder="Select..."
    variant="compact"
  />
</div>
```

### Comparison Operator Filter (price / quantity)

```tsx
<div className="space-y-1.5">
  <label className="block text-[11px] font-bold text-slate-500">Price filter</label>
  <div className="flex gap-2">
    <Select
      variant="compact"
      value={priceOperator}
      onChange={(e) => setPriceOperator(e.target.value)}
      options={[
        { value: 'all', label: 'Any' },
        { value: '=',   label: '= Equal' },
        { value: '!=',  label: '≠ Not equal' },
        { value: '<',   label: '< Less than' },
        { value: '>',   label: '> Greater than' },
        { value: '<=',  label: '≤ Less or equal' },
        { value: '>=',  label: '≥ Greater or equal' },
      ]}
    />
    <Input variant="compact" type="number" placeholder="0" value={priceValue} onChange={...} />
  </div>
</div>
```

---

## ✅ Developer Checklist

Koi bhi screen ya feature banana se pehle:

- [ ] `ThemeContext.tsx` se brand tokens use kar raha hun (direct hex nahi)
- [ ] `Button.tsx` — sare buttons is component se
- [ ] `Card.tsx` — sare white cards is component se
- [ ] `Chip.tsx` — sare status/category badges is component se
- [ ] `FilterDrawer.tsx` — filter sidebar is component se
- [ ] `FormControls.tsx` — sare inputs, selects, comboboxes, toggles is file se
- [ ] `InlineProductForm.tsx` — product add/edit form is component se
- [ ] Table `<th>`: `text-[10px] font-black tracking-widest`
- [ ] Table `<td>`: `text-[12px] font-normal` (bold nahi). Status chips inside rows use `size="md"` (standard 12px) with `py-0.5` padding.
- [ ] Page bg: `#F4F7FD`
- [ ] Page title: `text-2xl font-black tracking-tight`
- [ ] ComboBox options format: `{ id, name }` (not `{ value, label }`)
- [ ] Currency values are formatted prefix-free, denomination added to the column headers/labels (e.g. `(Rs.)`)
- [ ] Initials colored box avatars are removed from lists, tables, and dashboards (render text directly)
- [ ] Table Actions columns are sized strictly: `w-20` (3 actions) / `w-28` (4 actions), header padding is `px-2` (`!px-2`)
- [ ] Preview modals have a single-line standard title header and soft themed cards for warnings/totals
- [ ] Printable templates calculate totals dynamically and include all relevant listing columns (Code, Description, Unit, Qty, Rate, Tax, Discount, Total)
- [ ] File attachment boxes use `max-h-[120px] overflow-y-auto` with `accept` restricted to image/pdf/xlsx/docx only
- [ ] Table header cells and list page heading numbers use `color: brand.dark` (black) — never slate/gray
- [ ] Form section headings follow the standard `<h4>` + Lucide icon pattern (see § Form Section Headings)
- [ ] All form buttons use `size="md"` — no over-wide full-width buttons on modal/drawer footers
- [ ] Dashboard trend card uses the Revenue Trend pattern (3M/6M/12M range filters + dual AreaChart for revenue/target + custom tooltip)
- [ ] `Header` (`AICommandBar`) is hidden/null on the Settings page — `if (activeView === 'settings') return null`

---

## 📎 File Attachment Standard

### Attachment Box Constraints

```tsx
// Max height capped — scroll if more files added
<div className="max-h-[120px] overflow-y-auto space-y-1 pr-1">
  {attachments.map(file => (
    <AttachmentRow key={file.name} file={file} onRemove={...} />
  ))}
</div>
```

- **Max height**: `max-h-[120px]` — box never grows taller regardless of how many files are attached.
- **Overflow**: `overflow-y-auto` — scrollbar appears when files overflow the box height.
- **Accepted file types**: restricted to the following only:

```tsx
<input
  type="file"
  accept="image/*,.pdf,.xlsx,.xls,.docx,.doc"
  multiple
  onChange={handleFileChange}
/>
```

| Allowed Type | Extensions |
|---|---|
| Images | `image/*` (jpg, png, webp, svg…) |
| PDF | `.pdf` |
| Excel | `.xlsx`, `.xls` |
| Word | `.docx`, `.doc` |

**No other file types are accepted.** Always validate on the input `accept` attribute and optionally re-validate in the `onChange` handler.

---

## 🖤 Table Header & Heading Color — Black Standard

All table column headers (`<th>`), list page heading numbers, and section count labels **must use `brand.dark` (black)** — never muted slate/gray.

```tsx
// ✅ Correct
<th className="text-[10px] font-black tracking-widest"
    style={{ color: brand.dark }}>
  Customer Name
</th>

// ✅ Correct — page subtitle count
<p className="text-[12px] font-medium mt-0.5" style={{ color: brand.dark }}>
  {total} customers
</p>

// ❌ Wrong — do not use slate-400/500 for headers or count numbers
<th className="text-[10px] font-medium text-slate-400 ...">
```

This applies to:
- All `<th>` column headers across every table
- Page sub-heading counts (e.g. "24 invoices")
- Customer list heading and number labels
- Any `text-[11px] font-medium text-slate-400` labels that serve as a heading — change to `brand.dark`

---

## 🏷️ Form Section Headings — Icon Standard

Every form card/section heading must use a **Lucide icon + text** pattern. This is the standard used in `CustomerManagement.tsx` and must be applied to all forms (Products, Invoices, Settings, etc.).

```tsx
import { User, MapPin, Building2, CreditCard, FileText } from 'lucide-react';

// Standard section heading
<h4 className="text-[13px] font-black ml-1 flex items-center gap-2"
    style={{ color: brand.dark }}>
  <User className="w-3.5 h-3.5" style={{ color: brand.primary }} />
  Basic contact information
</h4>
```

### Icon Map — Use these icons per section type

| Section | Icon |
|---|---|
| Basic / personal info | `User` |
| Address / location | `MapPin` |
| Business / company | `Building2` |
| Financial / billing | `CreditCard` |
| Tax information | `Receipt` |
| Notes / remarks | `FileText` |
| Classification / category | `Layers` |
| Pricing | `Tag` |
| Inventory / stock | `Warehouse` |
| Contact details | `Phone` |
| Email | `Mail` |
| Settings / preferences | `Settings` |

**Rules:**
- Icon size: `w-3.5 h-3.5`
- Icon color: `brand.primary`
- Text color: `brand.dark`
- Font: `text-[13px] font-black`
- Gap between icon and text: `gap-2`
- Always sentence case (never ALL CAPS)

---

## 🔘 Button Sizing & Width Standard

### Size Rule

| Context | Size |
|---|---|
| Page header actions (Add, Filter, Export) | `size="md"` |
| Modal / drawer footer (Save, Cancel) | `size="md"` |
| Table row inline actions | `size="xs"` (`ghost` variant, icon-only) |
| Bulk action bar | `size="sm"` |
| FilterDrawer footer (Reset / Apply) | `size="sm"` |

### Width Rule

- **Never use `fullWidth` or `w-full` on modal/drawer footer buttons.** Buttons must be compact, sized by their content + padding only.
- **Do not manually set wide `px-*` values** — let the `Button` component handle its own padding.
- Modal/drawer footers must use `flex justify-end gap-2` layout, **not** stretched/full-width buttons.

```tsx
// ✅ Correct footer button layout
<div className="flex justify-end gap-2 pt-4 border-t mt-4">
  <Button variant="white"   size="md" onClick={onClose}>Cancel</Button>
  <Button variant="primary" size="md" icon={Save} loading={saving}>Save</Button>
</div>

// ❌ Wrong — do not stretch buttons
<Button variant="primary" size="md" fullWidth>Save</Button>
```

---

## 📊 Dashboard — Standard Widgets

### 1. Top Header Bar & Greeting Bar
- **Top Header Bar**: Background `#FFFFFF`, border-bottom `1px solid #e5e7eb`, height `58px`. Contains Logo + Name ("Ledger"), navigation links (`["Dashboard", "Invoices", "Clients", "Reports"]`), notification bell icon, and a user profile avatar with name and role ("Admin").
- **Greeting & Quick Action Bar**: Background `#FFFFFF`, border-bottom `1px solid #e5e7eb`, padding `10px 28px`. Includes a greeting ("Good evening, Aman.") and secondary status subtitle ("Saturday, May 23 • 14 invoices need your attention"). On the right, contains two main action buttons: "Add Client" and "New Invoice".

### 2. Dashboard Stats Cards (4-Column Grid)
Stats cards at the top of the dashboard follow a 4-column grid layout. Each card has a left-edge colored accent bar (4px wide), uppercase label, large bold value, and helper sub-text.
- `Outstanding` → accent `#2563eb`
- `Paid this month` → accent `#16a34a`
- `Overdue` → accent `#dc2626`
- `Avg. Invoice` → accent `#7c3aed`

### 3. Revenue Trend Card (Last 12 Months)
The **Revenue — Last 12 Months** card is the standard trend chart widget. It must follow this specification:
- **Header**: Includes title, trend percentage (`↑ 58.4% vs last month`), and time range selector tabs (`3M`, `6M`, `12M`).
- **Chart**: `AreaChart` (Recharts) of height `180px` containing:
  - `CartesianGrid` (dasharray `"3 3"`, stroke `#f1f5f9`, vertical false).
  - `XAxis` showing months, `YAxis` showing formatted tick marks (e.g. `$50k`).
  - **Revenue Area**: stroke `#16a34a`, strokeWidth `2.5`, fill `url(#revGrad)`, and active dot.
  - **Target Area**: stroke `#cbd5e1`, strokeWidth `1.5`, dashed line (`strokeDasharray="4 4"`), fill `url(#targGrad)`.
  - **Gradients**: 
    - `revGrad`: linearGradient from `#16a34a` (opacity 0.18) to (opacity 0).
    - `targGrad`: linearGradient from `#94a3b8` (opacity 0.1) to (opacity 0).
  - **Custom Tooltip**: White background, light border, rounded-lg (`10px`), subtle shadow, showing Month, Revenue, and Target.
  - **Legend**: Colored markers at the bottom indicating "Revenue" and "Target", with a bold total revenue label (e.g. `Total: $61,400`).

### 4. Recent Invoices Table
- Table showing recent invoices with columns: `Invoice`, `Client`, `Date`, `Due`, `Amount`, `Status`.
- **Status Badges**: Styled pill badges with semantic backgrounds and text colors:
  - `Paid` → bg `#dcfce7`, text `#15803d`
  - `Pending` → bg `#fef9c3`, text `#a16207`
  - `Overdue` → bg `#fee2e2`, text `#b91c1c`

### 5. Invoice Status Donut Card
- SVG donut chart displaying status distribution.
- **Spec**: Outer concentric SVG circle breakdown representing:
  - Track: `#f1f5f9`
  - `Paid`: `#16a34a`
  - `Pending`: `#fbbf24`
  - `Overdue`: `#dc2626`
  - Centered text displaying total invoice amount and "Total" label.
- **Legend**: Right-side details showing status name, percentage share, and total value.

### 6. Top Clients Card
- Displays top clients of the quarter ranked by revenue.
- Includes a progress bar with a client-specific accent color (`progress` percentage mapped to width).

### 7. Quick Actions Card
- Grid of 4 quick action buttons with pastel colored backgrounds and emoji/icons:
  - `Send Reminder` → bg `#fef9c3`, text `#92400e`
  - `Export CSV` → bg `#eff6ff`, text `#1d4ed8`
  - `Mark Paid` → bg `#f0fdf4`, text `#166534`
  - `New Client` → bg `#fdf4ff`, text `#7e22ce`

---

## 🧭 Header & Navigation — Per-Page Rules

### `AICommandBar` Visibility

The `AICommandBar` is rendered inside `Header.tsx`. It must be **hidden on the Settings page** to avoid cluttering the Settings layout.

**Implementation** — in `Header.tsx`:

```tsx
const Header: React.FC<Props> = ({ activeView, onViewChange }) => {
  const { brand } = useTheme();

  // Hide entire header (and AICommandBar) on Settings page
  if (activeView === 'settings') return null;

  return (
    <header className="relative z-[100] min-h-[110px] px-8 pt-6 pb-4 ...">
      <div className="flex-grow w-full">
        <AICommandBar activeView={activeView} onViewChange={onViewChange} />
      </div>
    </header>
  );
};
```

**Rule:** If a future page also does not need the AI command bar, add its view name to the early-return guard:
```tsx
if (['settings', 'help'].includes(activeView)) return null;
```
