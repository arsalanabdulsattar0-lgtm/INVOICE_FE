import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ModalHeader } from '../../components/ui/Typography';
import { getQRCodeSvgPath } from '../../utils/qrCode';

interface ProductBatch {
  id: string;
  product_id: string;
  product_name: string;
  batch_no: string;
  mfg_date?: string;
  expiry_date: string;
  // ... other properties exist but we only need these for the QR modal
}

interface BatchQrCodeModalProps {
  viewingQrBatch: ProductBatch | null;
  brand: any;
  onClose: () => void;
}

export const BatchQrCodeModal: React.FC<BatchQrCodeModalProps> = ({ viewingQrBatch, brand, onClose }) => {
  if (!viewingQrBatch) return null;

  let productCode = 'N/A';
  try {
    const stored = localStorage.getItem('products_list');
    if (stored) {
      const prods = JSON.parse(stored);
      const matched = prods.find((p: any) => p.id === viewingQrBatch.product_id);
      if (matched && matched.code) {
        productCode = matched.code;
      }
    }
  } catch(e) {}

  const qrText = `Product Name : ${viewingQrBatch.product_name}\nProduct Code : ${productCode}\nMfg Date : ${viewingQrBatch.mfg_date || 'N/A'}\nExpiry Date : ${viewingQrBatch.expiry_date || 'N/A'}`;
  const { size, path } = getQRCodeSvgPath(qrText);

  const handleDownloadPng = () => {
    const svgElement = document.getElementById('qr-code-svg') as SVGGraphicsElement & HTMLElement;
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 360;
      const context = canvas.getContext('2d');
      if (context) {
        // Fill white background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 300, 360);
        
        // Draw QR Code centered
        context.drawImage(image, 50, 20, 200, 200);
        
        // Set text alignment
        context.textAlign = 'center';
        
        // Product Code Label
        context.font = '10px sans-serif';
        context.fillStyle = '#94A3B8';
        context.fillText('Product Code', 150, 245);
        
        // Product Code Value
        context.font = 'bold 13px sans-serif';
        context.fillStyle = '#1E293B';
        context.fillText(productCode, 150, 262);
        
        // Mfg Date Label
        context.font = '10px sans-serif';
        context.fillStyle = '#94A3B8';
        context.fillText('Mfg Date', 150, 290);
        
        // Mfg Date Value
        context.font = 'bold 13px sans-serif';
        context.fillStyle = '#1E293B';
        context.fillText(viewingQrBatch.mfg_date || 'N/A', 150, 307);

        // Expiry Date Label
        context.font = '10px sans-serif';
        context.fillStyle = '#94A3B8';
        context.fillText('Expiry Date', 150, 330);
        
        // Expiry Date Value
        context.font = 'bold 13px sans-serif';
        context.fillStyle = '#1E293B';
        context.fillText(viewingQrBatch.expiry_date || 'N/A', 150, 347);
        
        const png = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = png;
        downloadLink.download = `QR_Batch_${viewingQrBatch.batch_no}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const svgElement = document.getElementById('qr-code-svg');
      const svgOuterHtml = svgElement ? svgElement.outerHTML : '';
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Label - Product ${productCode}</title>
            <style>
              html, body {
                height: 100%;
                margin: 0;
                padding: 0;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                background: white;
              }
              .label-card {
                border: 1px dashed #94a3b8;
                padding: 20px;
                border-radius: 12px;
                background: white;
                display: inline-block;
              }
              .qr-container {
                width: 150px;
                height: 150px;
                margin: 0 auto 10px auto;
              }
              .qr-container svg {
                width: 100%;
                height: 100%;
              }
              .info-text {
                font-size: 12px;
                font-weight: bold;
                color: #1e293b;
                margin: 4px 0;
              }
              .subtitle {
                font-size: 10px;
                color: #64748b;
              }
              @media print {
                html, body {
                  height: 100vh;
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: center !important;
                  justify-content: center !important;
                }
                .label-card {
                  border: none !important;
                  padding: 0 !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="label-card">
              <div class="qr-container">
                ${svgOuterHtml}
              </div>
              <div class="info-text">Product Code: ${productCode}</div>
              <div class="subtitle">Mfg Date: ${viewingQrBatch.mfg_date || 'N/A'}</div>
              <div class="subtitle">Expiry Date: ${viewingQrBatch.expiry_date || 'N/A'}</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-sm w-full border overflow-hidden flex flex-col"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
      >
        <ModalHeader
          title="Generate QR Code"
          onClose={onClose}
        />

        <div className="px-6 py-8 flex flex-col items-center justify-center bg-slate-50 border-b border-slate-100 flex-grow">
          <Card className="p-6 bg-white flex flex-col items-center w-64 shadow-sm border border-slate-200/60 rounded-2xl">
            <div className="w-40 h-40 bg-white flex items-center justify-center p-1 border border-slate-100 rounded-xl mb-4">
              <svg
                id="qr-code-svg"
                className="w-full h-full text-slate-900"
                viewBox={`0 0 ${size} ${size}`}
                shapeRendering="crispEdges"
              >
                <path fill="#FFFFFF" d={`M0,0h${size}v${size}H0z`} />
                <path fill="currentColor" d={path} />
              </svg>
            </div>

            <div className="text-center space-y-1.5 w-full">
              <div>
                <div className="text-[10px] font-medium text-slate-400">Product Code</div>
                <div className="text-[12px] font-bold text-slate-800">{productCode}</div>
              </div>
              
              <div>
                <div className="text-[10px] font-medium text-slate-400">Mfg Date</div>
                <div className="text-[12px] font-bold text-slate-800">
                  {viewingQrBatch.mfg_date || 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-medium text-slate-400">Expiry Date</div>
                <div className="text-[12px] font-bold text-slate-800">
                  {viewingQrBatch.expiry_date || 'N/A'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 bg-white flex-shrink-0">
          <Button
            variant="white"
            size="md"
            onClick={handleDownloadPng}
          >
            Download PNG
          </Button>
          <Button
            variant="white"
            size="md"
            onClick={handlePrintLabel}
          >
            Print Label
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            style={{ backgroundColor: brand.primary }}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
