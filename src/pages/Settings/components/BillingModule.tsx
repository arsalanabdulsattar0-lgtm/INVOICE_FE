import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useTheme } from '../../../context/ThemeContext';
import { ScrollArea } from '../../../components/ui/ScrollArea';
import { Modal } from '../../../components/ui/Modal';

interface BillingModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

export const BillingModule: React.FC<BillingModuleProps> = ({ brand }) => {
  // Plan states
  const [planName, setPlanName] = useState('Enterprise Pro Suite');
  const [planPrice, setPlanPrice] = useState(4500);
  const [nextBillDate, setNextBillDate] = useState('2026-06-01');

  // Card states
  const [cardBrand, setCardBrand] = useState('VISA');
  const [cardLast4, setCardLast4] = useState('4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');

  // Transaction history state (numeric amounts, no prefix in rows)
  const [receipts, setReceipts] = useState([
    { id: 'TXN-98432', date: '2026-05-01', amount: 4500, status: 'Paid' },
    { id: 'TXN-87612', date: '2026-04-01', amount: 4500, status: 'Paid' },
    { id: 'TXN-76510', date: '2026-03-01', amount: 4500, status: 'Paid' },
  ]);

  // Modal open states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  // Form states for upgrade modal
  const [selectedPlan, setSelectedPlan] = useState('Enterprise Pro Suite');

  // Form states for card modal
  const [cardholderName, setCardholderName] = useState('Arsalan Abdul Sattar');
  const [cardNumberForm, setCardNumberForm] = useState('4242424242424242');
  const [cardExpiryForm, setCardExpiryForm] = useState('12/28');
  const [cardCvvForm, setCardCvvForm] = useState('123');

  // Upgrade Plan handler
  const handleUpgradePlan = () => {
    let price = 4500;
    if (selectedPlan === 'Startup Core') price = 1500;
    else if (selectedPlan === 'Professional') price = 3000;

    setPlanName(selectedPlan);
    setPlanPrice(price);
    
    // Add current date to transaction list to simulate functional payment update
    const newTxnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const todayStr = new Date().toISOString().split('T')[0];
    
    setReceipts(prev => [
      { id: newTxnId, date: todayStr, amount: price, status: 'Paid' },
      ...prev,
    ]);

    setShowUpgradeModal(false);
  };

  // Card update handler
  const handleUpdateCard = () => {
    const cleanNum = cardNumberForm.replace(/\s+/g, '');
    const last4 = cleanNum.slice(-4) || '4242';
    
    // Simple card brand check
    let brandName = 'VISA';
    if (cleanNum.startsWith('5')) brandName = 'MASTERCARD';
    else if (cleanNum.startsWith('3')) brandName = 'AMEX';

    setCardBrand(brandName);
    setCardLast4(last4);
    setCardExpiry(cardExpiryForm);
    setShowCardModal(false);
  };

  // Cancel plan handler
  const handleCancelPlan = () => {
    if (window.confirm('Are you sure you want to cancel your plan subscription?')) {
      setPlanName('Free Tier');
      setPlanPrice(0);
      setNextBillDate('Cancelled');
    }
  };

  const plansList = [
    { name: 'Startup Core', price: 1500, desc: 'Best for freelancers & small firms.' },
    { name: 'Professional', price: 3000, desc: 'Great for growing agency teams.' },
    { name: 'Enterprise Pro Suite', price: 4500, desc: 'Full custom branding & limits.' },
  ];

  return (
    <div className="space-y-6">
      {/* Subscription Overview Card */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: brand.dark + '10' }}>
        {/* Card header bar */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Subscription overview</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border bg-slate-50/50" style={{ borderColor: brand.dark + '10' }}>
              <span className="text-[10px] font-bold text-slate-400">Active plan</span>
              <h3 className="text-base font-black text-slate-800 mt-1">{planName}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {planPrice > 0 ? (
                  <>
                    Next bill on: <strong>{nextBillDate}</strong> ({planPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} / month)
                  </>
                ) : (
                  'Subscription status: inactive'
                )}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" size="xs" onClick={() => { setSelectedPlan(planName); setShowUpgradeModal(true); }} style={{ backgroundColor: brand.primary }}>Upgrade plan</Button>
                {planPrice > 0 && (
                  <Button variant="white" size="xs" onClick={handleCancelPlan}>Cancel plan</Button>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl border bg-slate-50/50" style={{ borderColor: brand.dark + '10' }}>
              <span className="text-[10px] font-bold text-slate-400">Payment method</span>
              <h3 className="text-base font-black text-slate-800 mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-900 rounded text-white text-[9px] font-bold flex items-center justify-center">
                  {cardBrand}
                </span>
                •••• •••• •••• {cardLast4}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Expires: <strong>{cardExpiry}</strong></p>
              <div className="mt-4">
                <Button variant="white" size="xs" onClick={() => setShowCardModal(true)}>Update card</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table Card */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: brand.dark + '10' }}>
        {/* Table header bar */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Payment history</h3>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: brand.soft, color: brand.dark }}>
              {receipts.length} transactions
            </span>
          </div>
        </div>

        <ScrollArea maxHeight="220px">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b" style={{ borderColor: brand.dark + '10' }}>
                {['Transaction ID', 'Date', 'Amount (Rs.)', 'Status'].map((h, idx) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-left border-b ${idx !== 0 ? 'border-l border-slate-50' : ''}`}
                    style={{ borderColor: brand.dark + '10' }}
                  >
                    <span className="text-[10px] font-black tracking-widest whitespace-nowrap" style={{ color: brand.dark }}>
                      {h}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {receipts.map(r => (
                <tr key={r.id} className="border-b transition-colors hover:bg-slate-50/60 last:border-0" style={{ borderColor: brand.dark + '08' }}>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-mono font-medium text-slate-600">{r.id}</td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-500">{r.date}</td>
                  {/* Standard prefix-free numeric values in body rows */}
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-bold text-slate-800">
                    {r.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-bold text-emerald-600">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* Upgrade Plan Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade plan"
        size="lg"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowUpgradeModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleUpgradePlan} style={{ backgroundColor: brand.primary }}>
              Confirm plan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Select your preferred subscription tier. Your card will be billed immediately.</p>
          <div className="grid grid-cols-1 gap-3">
            {plansList.map(plan => (
              <label
                key={plan.name}
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  selectedPlan === plan.name
                    ? 'border-blue-600 bg-blue-50/10'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">{plan.name}</span>
                  <span className="text-sm font-black text-slate-850">
                    {plan.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Rs.) / mo
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{plan.desc}</p>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      {/* Update Card Modal */}
      <Modal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        title="Update card details"
        size="lg"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowCardModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleUpdateCard} style={{ backgroundColor: brand.primary }}>
              Save details
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Cardholder name *"
            variant="compact"
            placeholder="e.g. Arsalan Abdul Sattar"
            value={cardholderName}
            onChange={e => setCardholderName(e.target.value)}
          />
          <Input
            label="Card number *"
            variant="compact"
            placeholder="e.g. 4242 4242 4242 4242"
            value={cardNumberForm}
            onChange={e => setCardNumberForm(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry date *"
              variant="compact"
              placeholder="MM/YY"
              value={cardExpiryForm}
              onChange={e => setCardExpiryForm(e.target.value)}
            />
            <Input
              label="CVV *"
              variant="compact"
              type="password"
              placeholder="•••"
              maxLength={4}
              value={cardCvvForm}
              onChange={e => setCardCvvForm(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
