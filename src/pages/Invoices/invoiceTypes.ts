// ─── Shared Invoice Types & Initial Data ─────────────────────────────────────
// Extracted here so App.tsx can import these without statically pulling in the
// full InvoiceList page bundle (which would defeat code-splitting via lazy()).

import type { Invoice, InvoiceStatus } from '../../types';

export type { Invoice, InvoiceStatus };

export const initialInvoices: Invoice[] = [
  { id: 'SI-000248', customer: 'BlueRitt Technologies Inc.', customerInitials: 'BT', customerColor: '#2759CD', issueDate: '2026-05-12', dueDate: '2026-06-12', amount: 'Rs. 8,450.00', rawAmount: 8450, status: 'Draft', payment: 'Net 30', type: 'Service' },
  { id: 'SI-000247', customer: 'Acme Corporation', customerInitials: 'AC', customerColor: '#10B981', issueDate: '2026-05-10', dueDate: '2026-05-25', amount: 'Rs. 1,200.00', rawAmount: 1200, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000246', customer: 'Global Solutions Ltd.', customerInitials: 'GS', customerColor: '#F59E0B', issueDate: '2026-05-08', dueDate: '2026-05-23', amount: 'Rs. 3,500.00', rawAmount: 3500, status: 'Pending', payment: 'Net 15', type: 'Standard' },
  { id: 'SI-000245', customer: 'Starlight Media Group', customerInitials: 'SM', customerColor: '#8B5CF6', issueDate: '2026-05-05', dueDate: '2026-05-20', amount: 'Rs. 950.00', rawAmount: 950, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000244', customer: 'Nexus Systems Corp.', customerInitials: 'NS', customerColor: '#EE4932', issueDate: '2026-05-01', dueDate: '2026-05-16', amount: 'Rs. 12,000.00', rawAmount: 12000, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000243', customer: 'Pinnacle Ventures', customerInitials: 'PV', customerColor: '#0EA5E9', issueDate: '2026-04-28', dueDate: '2026-05-13', amount: 'Rs. 5,750.00', rawAmount: 5750, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000242', customer: 'Apex Digital Studio', customerInitials: 'AD', customerColor: '#EC4899', issueDate: '2026-04-25', dueDate: '2026-05-10', amount: 'Rs. 2,300.00', rawAmount: 2300, status: 'Pending', payment: 'Net 15', type: 'Service' },
  { id: 'SI-000241', customer: 'Quantum Analytics', customerInitials: 'QA', customerColor: '#14B8A6', issueDate: '2026-04-20', dueDate: '2026-05-05', amount: 'Rs. 6,800.00', rawAmount: 6800, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000240', customer: 'Vortex Enterprises', customerInitials: 'VE', customerColor: '#2563EB', issueDate: '2026-04-18', dueDate: '2026-05-03', amount: 'Rs. 4,120.00', rawAmount: 4120, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000239', customer: 'Horizon Media', customerInitials: 'HM', customerColor: '#7C3AED', issueDate: '2026-04-15', dueDate: '2026-04-30', amount: 'Rs. 1,850.00', rawAmount: 1850, status: 'Pending', payment: 'Net 15', type: 'Service' },
  { id: 'SI-000238', customer: 'Titan Industrial', customerInitials: 'TI', customerColor: '#059669', issueDate: '2026-04-12', dueDate: '2026-05-12', amount: 'Rs. 9,300.00', rawAmount: 9300, status: 'Draft', payment: 'Net 30', type: 'Standard' },
  { id: 'SI-000237', customer: 'Nebula Software', customerInitials: 'NS', customerColor: '#DB2777', issueDate: '2026-04-10', dueDate: '2026-04-25', amount: 'Rs. 5,200.00', rawAmount: 5200, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000236', customer: 'Nova Creative', customerInitials: 'NC', customerColor: '#DC2626', issueDate: '2026-04-08', dueDate: '2026-04-23', amount: 'Rs. 2,950.00', rawAmount: 2950, status: 'Overdue', payment: 'Overdue', type: 'Service' },
  { id: 'SI-000235', customer: 'Alpha Logistics', customerInitials: 'AL', customerColor: '#D97706', issueDate: '2026-04-05', dueDate: '2026-04-20', amount: 'Rs. 7,150.00', rawAmount: 7150, status: 'Paid', payment: 'Cleared', type: 'Standard' },
  { id: 'SI-000234', customer: 'Spectra Design', customerInitials: 'SD', customerColor: '#4F46E5', issueDate: '2026-04-02', dueDate: '2026-04-17', amount: 'Rs. 1,500.00', rawAmount: 1500, status: 'Pending', payment: 'Net 15', type: 'Product' },
  { id: 'SI-000233', customer: 'Summit Partners', customerInitials: 'SP', customerColor: '#0891B2', issueDate: '2026-03-29', dueDate: '2026-04-29', amount: 'Rs. 6,400.00', rawAmount: 6400, status: 'Paid', payment: 'Cleared', type: 'Standard' },
  { id: 'SI-000232', customer: 'Infinity Group', customerInitials: 'IG', customerColor: '#EA580C', issueDate: '2026-03-26', dueDate: '2026-04-10', amount: 'Rs. 3,250.00', rawAmount: 3250, status: 'Overdue', payment: 'Overdue', type: 'Product' },
  { id: 'SI-000231', customer: 'Zenith Agency', customerInitials: 'ZA', customerColor: '#0D9488', issueDate: '2026-03-22', dueDate: '2026-04-06', amount: 'Rs. 4,800.00', rawAmount: 4800, status: 'Pending', payment: 'Net 15', type: 'Service' },
  { id: 'SI-000230', customer: 'Catalyst Ventures', customerInitials: 'CV', customerColor: '#9333EA', issueDate: '2026-03-18', dueDate: '2026-04-18', amount: 'Rs. 8,900.00', rawAmount: 8900, status: 'Draft', payment: 'Net 30', type: 'Standard' },
  { id: 'SI-000229', customer: 'Omega Solutions', customerInitials: 'OS', customerColor: '#2563EB', issueDate: '2026-03-15', dueDate: '2026-03-30', amount: 'Rs. 1,100.00', rawAmount: 1100, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000228', customer: 'Delta Consulting', customerInitials: 'DC', customerColor: '#059669', issueDate: '2026-03-12', dueDate: '2026-03-27', amount: 'Rs. 3,700.00', rawAmount: 3700, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000227', customer: 'Echo Studios', customerInitials: 'ES', customerColor: '#E11D48', issueDate: '2026-03-09', dueDate: '2026-03-24', amount: 'Rs. 2,400.00', rawAmount: 2400, status: 'Overdue', payment: 'Overdue', type: 'Service' },
  { id: 'SI-000226', customer: 'Matrix Corp', customerInitials: 'MC', customerColor: '#4F46E5', issueDate: '2026-03-05', dueDate: '2026-04-05', amount: 'Rs. 11,500.00', rawAmount: 11500, status: 'Pending', payment: 'Net 30', type: 'Standard' },
  { id: 'SI-000225', customer: 'Cyber Security Inc', customerInitials: 'CS', customerColor: '#0891B2', issueDate: '2026-03-02', dueDate: '2026-03-17', amount: 'Rs. 5,600.00', rawAmount: 5600, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000224', customer: 'Pioneer Lab', customerInitials: 'PL', customerColor: '#D97706', issueDate: '2026-02-28', dueDate: '2026-03-15', amount: 'Rs. 8,200.00', rawAmount: 8200, status: 'Draft', payment: 'Net 15', type: 'Standard' },
  { id: 'SI-000223', customer: 'Solar Energy', customerInitials: 'SE', customerColor: '#10B981', issueDate: '2026-02-25', dueDate: '2026-03-27', amount: 'Rs. 4,750.00', rawAmount: 4750, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000222', customer: 'Lunar Interactive', customerInitials: 'LI', customerColor: '#8B5CF6', issueDate: '2026-02-20', dueDate: '2026-03-07', amount: 'Rs. 1,900.00', rawAmount: 1900, status: 'Pending', payment: 'Net 15', type: 'Product' },
  { id: 'SI-000221', customer: 'Vanguard Tech', customerInitials: 'VT', customerColor: '#EE4932', issueDate: '2026-02-15', dueDate: '2026-03-17', amount: 'Rs. 10,200.00', rawAmount: 10200, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000220', customer: 'Aurora Media', customerInitials: 'AM', customerColor: '#0EA5E9', issueDate: '2026-02-10', dueDate: '2026-02-25', amount: 'Rs. 3,100.00', rawAmount: 3100, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000219', customer: 'Quantum Crest', customerInitials: 'QC', customerColor: '#EC4899', issueDate: '2026-02-05', dueDate: '2026-02-20', amount: 'Rs. 6,300.00', rawAmount: 6300, status: 'Pending', payment: 'Net 15', type: 'Standard' },
];
