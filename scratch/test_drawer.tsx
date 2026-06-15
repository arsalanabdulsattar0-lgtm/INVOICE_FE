import React from 'react';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../src/context/ThemeContext';
import { WarehouseDrawer } from '../src/pages/Settings/components/WarehouseDrawer';

try {
  const html = renderToString(
    <ThemeProvider>
      <WarehouseDrawer
        isOpen={true}
        onClose={() => {}}
        warehouse={null}
        onSave={() => {}}
      />
    </ThemeProvider>
  );

  console.log('--- Rendered HTML ---');
  console.log(html);
  console.log('---------------------');
} catch (error) {
  console.error('Error rendering WarehouseDrawer:', error);
}
