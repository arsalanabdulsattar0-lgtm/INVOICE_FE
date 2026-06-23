import React from 'react';

// ──────────────────────────────────────────────────────────────────────────────
// BPLedgerPrintTemplate — ERP-style Business Partner Ledger (Detailed)
// Matches reference image: compact, no cards, classic tabular ERP layout
// ──────────────────────────────────────────────────────────────────────────────

interface LedgerRow {
  no: number;
  invNo: string;
  type: string;
  typeCode: string;
  date: string;
  reference: string;
  detail: string;
  debit: number;
  credit: number;
  balance: number;
}

interface Partner {
  name: string;
  customer_id?: string;
  id?: string;
  bp_type?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  credit_limit?: number;
  opening_balance?: number;
}

interface BPLedgerPrintTemplateProps {
  partner: Partner | null;
  ledgerData: LedgerRow[];
  dateFrom: string;
  dateTo: string;
  partnerFrom?: string;
  partnerTo?: string;
  voucherFrom?: string;
  voucherTo?: string;
  companyName?: string;
  companyLogo?: string | null;
  printedBy?: string;
}

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const BPLedgerPrintTemplate: React.FC<BPLedgerPrintTemplateProps> = ({
  partner,
  ledgerData,
  dateFrom,
  dateTo,
  partnerFrom = '',
  partnerTo = '',
  voucherFrom = '1',
  voucherTo = '9999999',
  companyName = 'AM INTERNATIONAL',
  companyLogo = null,
  printedBy = 'System',
}) => {
  const now = new Date();
  const printDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const printTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const rows = ledgerData.filter(r => r.no > 0); // skip opening balance row
  const openingRow = ledgerData.find(r => r.no === 0);

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  const closingBalance = ledgerData.length > 0 ? ledgerData[ledgerData.length - 1].balance : 0;
  const amountPaid = rows.reduce((s, r) => s + r.credit, 0);
  const outstanding = closingBalance;
  const creditLimit = partner?.credit_limit || 0;
  const previousBalance = openingRow?.balance ?? 0;
  const partnerId = partner ? (partner.customer_id || partner.id || '—') : '—';

  const s: Record<string, React.CSSProperties> = {
    page: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9pt',
      color: '#000',
      background: '#fff',
      padding: '10mm 12mm',
      minHeight: '297mm',
      width: '210mm',
      boxSizing: 'border-box',
      position: 'relative',
    },
    companyName: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '13pt',
      marginBottom: '1pt',
    },
    reportTitle: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '10pt',
      marginBottom: '6pt',
    },
    filterRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '5pt',
      fontSize: '8pt',
    },
    filterTable: {
      borderCollapse: 'collapse' as const,
    },
    filterLabel: {
      fontWeight: 'bold',
      paddingRight: '4pt',
      whiteSpace: 'nowrap' as const,
    },
    filterVal: {
      paddingRight: '10pt',
    },
    rightInfoTable: {
      borderCollapse: 'collapse' as const,
      textAlign: 'right' as const,
    },
    partnerBox: {
      border: '1px solid #000',
      marginBottom: '4pt',
      padding: '3pt 5pt',
    },
    partnerGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr 2fr',
      gap: '1pt 4pt',
      fontSize: '8.5pt',
    },
    partnerLabel: {
      fontWeight: 'bold',
    },
    ledgerTable: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '8pt',
      marginBottom: '4pt',
    },
    th: {
      borderBottom: '2px solid #000',
      borderTop: '1px solid #000',
      padding: '2pt 3pt',
      textAlign: 'left' as const,
      fontWeight: 'bold',
      whiteSpace: 'nowrap' as const,
      background: '#f0f0f0',
    },
    thRight: {
      borderBottom: '2px solid #000',
      borderTop: '1px solid #000',
      padding: '2pt 3pt',
      textAlign: 'right' as const,
      fontWeight: 'bold',
      whiteSpace: 'nowrap' as const,
      background: '#f0f0f0',
    },
    td: {
      padding: '1.5pt 3pt',
      borderBottom: '1px dotted #ccc',
      verticalAlign: 'top' as const,
    },
    tdRight: {
      padding: '1.5pt 3pt',
      borderBottom: '1px dotted #ccc',
      textAlign: 'right' as const,
      verticalAlign: 'top' as const,
    },
    totalRow: {
      borderTop: '1.5px solid #000',
      borderBottom: '1.5px solid #000',
      fontWeight: 'bold',
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: '4pt',
      fontSize: '8.5pt',
    },
    summaryLeft: {
      borderTop: '1px solid #000',
      paddingTop: '3pt',
    },
    summaryRight: {
      borderTop: '1px solid #000',
      paddingTop: '3pt',
      textAlign: 'right' as const,
    },
    summaryLine: {
      display: 'flex',
      gap: '8pt',
      marginBottom: '2pt',
    },
    summaryLabel: {
      fontWeight: 'bold',
      minWidth: '140pt',
    },
    footer: {
      position: 'absolute' as const,
      bottom: '8mm',
      left: '12mm',
      right: '12mm',
      borderTop: '1px solid #aaa',
      paddingTop: '3pt',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '7.5pt',
      color: '#444',
    },
  };

  return (
    <div id="bp-ledger-printable" style={s.page}>
      {/* ── Company & Title ─────────────────────────────────────────────── */}
      {companyLogo ? (
        <div style={{ textAlign: 'center', marginBottom: '3pt' }}>
          <img src={companyLogo} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
      ) : null}
      <div style={s.companyName}>{partner?.name || companyName}</div>
      <div style={s.reportTitle}>Business Partner Ledger (Detailed)</div>

      {/* ── Filter row ──────────────────────────────────────────────────── */}
      <div style={s.filterRow}>
        <table style={s.filterTable}>
          <tbody>
            <tr>
              <td style={s.filterLabel}>Date From:</td>
              <td style={s.filterVal}>{dateFrom}</td>
              <td style={{ paddingRight: '4pt', fontWeight: 'bold' }}>To</td>
              <td style={s.filterVal}>{dateTo}</td>
            </tr>
            <tr>
              <td style={s.filterLabel}>Business Partner From:</td>
              <td style={s.filterVal}>{partnerFrom || partnerId}</td>
              <td style={{ paddingRight: '4pt', fontWeight: 'bold' }}>To</td>
              <td style={s.filterVal}>{partnerTo || partnerId}</td>
            </tr>
            <tr>
              <td style={s.filterLabel}>Voucher From:</td>
              <td style={s.filterVal}>{voucherFrom}</td>
              <td style={{ paddingRight: '4pt', fontWeight: 'bold' }}>To</td>
              <td style={s.filterVal}>{voucherTo}</td>
            </tr>
          </tbody>
        </table>

        <table style={s.rightInfoTable}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', paddingRight: '4pt' }}>Date:</td>
              <td style={{ color: '#1a56db' }}>{printDate}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', paddingRight: '4pt' }}>Time:</td>
              <td style={{ color: '#1a56db' }}>{printTime}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: 'right', paddingTop: '2pt' }}>Page 1 of 1</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Partner Info Box ────────────────────────────────────────────── */}
      <div style={s.partnerBox}>
        <div style={s.partnerGrid}>
          <span style={s.partnerLabel}>Business Partner No:</span>
          <span>{partnerId}</span>
          <span style={s.partnerLabel}>Name:</span>
          <span style={{ fontWeight: 'bold' }}>{partner?.name || '—'}</span>

          <span style={s.partnerLabel}>Contact:</span>
          <span>{partner?.contact_person || partner?.phone || partner?.email || ''}</span>
          <span style={s.partnerLabel}>Previous Balance:</span>
          <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{fmt(previousBalance)}</span>
        </div>
      </div>

      {/* ── Transaction Table ────────────────────────────────────────────── */}
      <table style={s.ledgerTable}>
        <thead>
          <tr>
            <th style={{ ...s.th, width: '5%' }}>No</th>
            <th style={{ ...s.th, width: '8%' }}>Document No</th>
            <th style={{ ...s.th, width: '9%' }}>Date</th>
            <th style={{ ...s.th, width: '5%' }}>Type</th>
            <th style={{ ...s.th, width: '9%' }}>Ref</th>
            <th style={{ ...s.th, width: '30%' }}>Details</th>
            <th style={{ ...s.thRight, width: '11%' }}>Debit</th>
            <th style={{ ...s.thRight, width: '11%' }}>Credit</th>
            <th style={{ ...s.thRight, width: '12%' }}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ ...s.td, textAlign: 'center', padding: '8pt', color: '#888' }}>
                No transactions found for the selected period.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx}>
                <td style={s.td}>{row.invNo !== '—' ? row.no : ''}</td>
                <td style={{ ...s.td, color: '#1a56db' }}>{row.invNo !== '—' ? row.invNo : ''}</td>
                <td style={s.td}>{row.date}</td>
                <td style={s.td}>{row.typeCode !== 'OB' ? row.typeCode : ''}</td>
                <td style={s.td}>{row.reference !== '—' ? row.reference : ''}</td>
                <td style={s.td}>{row.detail !== '—' ? row.detail : ''}</td>
                <td style={s.tdRight}>{row.debit > 0 ? fmt(row.debit) : '0.00'}</td>
                <td style={s.tdRight}>{row.credit > 0 ? fmt(row.credit) : '0.00'}</td>
                <td style={s.tdRight}>{fmt(row.balance)}</td>
              </tr>
            ))
          )}

          {/* Totals row */}
          <tr style={s.totalRow}>
            <td colSpan={6} style={{ ...s.td, borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000' }}></td>
            <td style={{ ...s.tdRight, fontWeight: 'bold', borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000' }}>{fmt(totalDebit)}</td>
            <td style={{ ...s.tdRight, fontWeight: 'bold', borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000' }}>{fmt(totalCredit)}</td>
            <td style={{ ...s.tdRight, fontWeight: 'bold', borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000' }}>{fmt(closingBalance)}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <div style={s.summaryRow}>
        <div style={s.summaryLeft}>
          <div style={s.summaryLine}>
            <span style={s.summaryLabel}>Amount Outstanding:</span>
            <span style={{ fontWeight: 'bold' }}>{fmt(outstanding)}</span>
          </div>
          <div style={s.summaryLine}>
            <span style={s.summaryLabel}>Amount Paid This Period:</span>
            <span>{fmt(amountPaid)}</span>
          </div>
          <div style={s.summaryLine}>
            <span style={s.summaryLabel}>Credit Limit:</span>
            <span>{creditLimit > 0 ? fmt(creditLimit) : '—'}</span>
          </div>
        </div>
        <div style={s.summaryRight}>
          <div style={s.summaryLine}>
            <span style={{ fontWeight: 'bold', minWidth: '70pt', textAlign: 'right' }}>Total Debit:</span>
            <span style={{ minWidth: '70pt', textAlign: 'right', fontWeight: 'bold' }}>{fmt(totalDebit)}</span>
          </div>
          <div style={s.summaryLine}>
            <span style={{ fontWeight: 'bold', minWidth: '70pt', textAlign: 'right' }}>Total Credit:</span>
            <span style={{ minWidth: '70pt', textAlign: 'right' }}>{fmt(totalCredit)}</span>
          </div>
          <div style={s.summaryLine}>
            <span style={{ fontWeight: 'bold', minWidth: '70pt', textAlign: 'right' }}>Closing Balance:</span>
            <span style={{ minWidth: '70pt', textAlign: 'right', fontWeight: 'bold' }}>{fmt(closingBalance)}</span>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div style={s.footer}>
        <span>Printed By: {printedBy}</span>
        <span>Printed Date: {printDate} {printTime}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};

export default BPLedgerPrintTemplate;
