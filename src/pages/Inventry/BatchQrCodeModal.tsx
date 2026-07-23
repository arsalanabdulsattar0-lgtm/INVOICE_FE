import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { getQRCodeSvgPath } from '../../utils/qrCode';
import { QrCode, Download, Printer, X, Box, CalendarPlus, CalendarOff } from 'lucide-react';

interface ProductBatch {
  id: string;
  product_id: string;
  product_name: string;
  batch_no: string;
  mfg_date?: string;
  expiry_date: string;
}

interface BatchQrCodeModalProps {
  viewingQrBatch: ProductBatch | null;
  brand: any;
  onClose: () => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

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
  } catch (e) {}

  const mfgDateText = formatDate(viewingQrBatch.mfg_date);
  const expiryDateText = formatDate(viewingQrBatch.expiry_date);

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
      canvas.width = 400;
      canvas.height = 580;
      const context = canvas.getContext('2d');
      if (context) {
        // Fill white background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 400, 580);
        
        // Draw QR Code centered
        context.drawImage(image, 50, 40, 300, 300);
        
        // Set text alignment
        context.textAlign = 'center';
        
        // Product Code Label
        context.font = 'bold 22px sans-serif';
        context.fillStyle = '#0F172A';
        context.fillText('Product Code', 200, 380);
        
        // Product Code Value
        context.font = '600 20px sans-serif';
        context.fillStyle = '#64748B';
        context.fillText(productCode, 200, 410);
        
        // Mfg Date Label
        context.font = 'bold 22px sans-serif';
        context.fillStyle = '#0F172A';
        context.fillText('Manufacturing Date', 200, 455);
        
        // Mfg Date Value
        context.font = '600 20px sans-serif';
        context.fillStyle = '#64748B';
        context.fillText(mfgDateText, 200, 485);

        // Expiry Date Label
        context.font = 'bold 22px sans-serif';
        context.fillStyle = '#0F172A';
        context.fillText('Expiry Date', 200, 530);
        
        // Expiry Date Value
        context.font = '600 20px sans-serif';
        context.fillStyle = '#64748B';
        context.fillText(expiryDateText, 200, 560);
        
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
                width: 300px;
                height: 300px;
                margin: 0 auto 20px auto;
              }
              .qr-container svg {
                width: 100%;
                height: 100%;
              }
              .info-row {
                margin: 16px 0;
              }
              .info-label {
                font-size: 28px;
                font-weight: bold;
                color: #0f172a;
              }
              .info-value {
                font-size: 26px;
                font-weight: 600;
                color: #64748b;
                margin-top: 8px;
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
              <div class="info-row">
                <div class="info-label">Product Code</div>
                <div class="info-value">${productCode}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Manufacturing Date</div>
                <div class="info-value">${mfgDateText}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Expiry Date</div>
                <div class="info-value">${expiryDateText}</div>
              </div>
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-[400px] w-full border border-slate-100 overflow-hidden flex flex-col"
      >
        {/* Premium Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100/60 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${brand.primary}15` }}
            >
              <QrCode className="w-5 h-5" style={{ color: brand.primary }} />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-slate-800 tracking-tight">Generate QR Code</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Scan to view batch details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-8 flex flex-col items-center justify-center bg-white flex-grow relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />
          
          {/* QR Code Graphic Container */}
          <div className="w-48 h-48 bg-white flex items-center justify-center p-3 border border-slate-100 rounded-2xl mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group overflow-hidden z-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <svg
                id="qr-code-svg"
                className="w-full h-full text-slate-900 relative z-10"
                viewBox={`0 0 ${size} ${size}`}
                shapeRendering="crispEdges"
              >
                <path fill="#FFFFFF" d={`M0,0h${size}v${size}H0z`} />
                <path fill="currentColor" d={path} />
              </svg>
            </div>

            {/* Information Box */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex flex-col">
              
              {/* Product Code */}
              <div className="flex items-center gap-3 p-3 border-b border-slate-200/60 transition-colors hover:bg-slate-100/50">
                <div className="w-8 h-8 rounded-[10px] bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                  <Box className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-slate-900 capitalize">Product Code</div>
                  <div className="text-[12px] font-semibold text-slate-500 truncate mt-0.5">{productCode}</div>
                </div>
              </div>

              {/* Manufacturing Date */}
              <div className="flex items-center gap-3 p-3 border-b border-slate-200/60 transition-colors hover:bg-slate-100/50">
                <div className="w-8 h-8 rounded-[10px] bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                  <CalendarPlus className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-slate-900 capitalize">Manufacturing Date</div>
                  <div className="text-[12px] font-semibold text-slate-500 truncate mt-0.5">{mfgDateText}</div>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-100/50">
                <div className="w-8 h-8 rounded-[10px] bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                  <CalendarOff className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-slate-900 capitalize">Expiry Date</div>
                  <div className="text-[12px] font-semibold text-slate-500 truncate mt-0.5">{expiryDateText}</div>
                </div>
              </div>

            </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-2.5 px-5 py-5 bg-white border-t border-slate-100/60 flex-shrink-0">
          <Button
            variant="white"
            size="md"
            icon={Download}
            onClick={handleDownloadPng}
            className="flex-1 !rounded-[12px] !h-11 shadow-sm hover:shadow group border-slate-200 hover:border-slate-300 !text-[13px] font-semibold"
          >
            <span className="hidden sm:inline ml-1">Download PNG</span>
            <span className="sm:hidden ml-1">PNG</span>
          </Button>
          
          <Button
            variant="white"
            size="md"
            icon={Printer}
            onClick={handlePrintLabel}
            className="flex-1 !rounded-[12px] !h-11 shadow-sm hover:shadow group border-slate-200 hover:border-slate-300 !text-[13px] font-semibold"
          >
            <span className="hidden sm:inline ml-1">Print Label</span>
            <span className="sm:hidden ml-1">Print</span>
          </Button>
          
          <Button
            variant="primary"
            size="md"
            icon={X}
            onClick={onClose}
            className="flex-1 !rounded-[12px] !h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all !text-[13px] font-semibold"
            style={{ backgroundColor: brand.primary, borderColor: brand.primary }}
          >
            <span className="ml-1">Close</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
