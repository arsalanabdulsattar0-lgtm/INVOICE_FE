const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', 'utf8');

// 1. Business Partner replacement
const customerStart = `      ) : activeTab === 'customer' ? (
        <div className="flex-grow flex gap-6 min-h-0 overflow-hidden">
          {/* Left Side Panel */}
          <Card className="w-[180px] p-3 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-sm shrink-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">Partner Types</h4>
            <div className="space-y-1">
              {TAB_MODULES['customer'].map(mod => {
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={\`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer \${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }\`}
                    style={isActive ? { backgroundColor: brand.primary } : undefined}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Side Panel */}
          <div className="flex-grow flex flex-col h-full min-h-0 overflow-hidden">
            {activeModule === 'customer' && (
              <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
                <DocumentSettingsModule brand={brand} activeTab="Customer" hideTabs={true} />
              </div>
            )}
          </div>
        </div>`;

const customerFixed = `      ) : activeTab === 'customer' ? (
        <div className="flex-grow flex flex-col h-full min-h-0 overflow-hidden pr-1">
          <DocumentSettingsModule brand={brand} activeTab="Customer" hideTabs={false} />
        </div>`;

if (content.includes(customerStart)) {
  content = content.replace(customerStart, customerFixed);
} else {
  console.log("Customer block not found.");
}

// 2. Inventory replacement
const inventoryStart = `      ) : activeTab === 'inventory' ? (
        <div className="flex-grow flex gap-6 min-h-0 overflow-hidden">
          {/* Left Side Panel */}
          <Card className="w-[180px] p-3 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-sm shrink-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">Inventory Modules</h4>
            <div className="space-y-1">
              {TAB_MODULES['inventory'].map(mod => {
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={\`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer \${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }\`}
                    style={isActive ? { backgroundColor: brand.primary } : undefined}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Side Panel */}
          <div className="flex-grow flex flex-col h-full min-h-0 overflow-hidden">
            {/* The rest goes to the generic Numbering Settings layout! */}
          </div>
        </div>`;

const inventoryFixed = `      ) : activeTab === 'inventory' ? (
        <div className="flex-grow flex gap-6 min-h-0 overflow-hidden">
          {/* Left Side Panel */}
          <Card className="w-[180px] p-3 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-sm shrink-0">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">Inventory Modules</h4>
            <div className="space-y-1">
              {TAB_MODULES['inventory'].map(mod => {
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={\`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer \${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}
                    style={isActive ? { backgroundColor: brand.primary } : undefined}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Side Panel */}
          <div className="flex-grow flex flex-col h-full min-h-0 overflow-hidden">
            {activeModule === 'product' && (
              <div className="flex w-full h-full gap-4">
                <div className="w-1/2 overflow-y-auto custom-scrollbar border-r border-[#E2E8F0] pr-4">
                  <ProductSetupModule brand={brand} />
                </div>
                <div className="w-1/2 overflow-y-auto custom-scrollbar">
                  <DocumentSettingsModule brand={brand} activeTab="Inventory" hideTabs={true} />
                </div>
              </div>
            )}
            {activeModule === 'warehouse' && (
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                <WarehouseModule brand={brand} />
              </div>
            )}
            {activeModule === 'stock_adjustment' && (
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                <AdjustmentTypeModule brand={brand} />
              </div>
            )}
          </div>
        </div>`;

if (content.includes(inventoryStart)) {
  content = content.replace(inventoryStart, inventoryFixed);
} else {
  console.log("Inventory block not found.");
}

fs.writeFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', content, 'utf8');
