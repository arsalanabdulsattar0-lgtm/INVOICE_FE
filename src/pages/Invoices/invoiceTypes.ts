// ─── Shared Invoice Types & Initial Data ─────────────────────────────────────
// Extracted here so App.tsx can import these without statically pulling in the
// full InvoiceList page bundle (which would defeat code-splitting via lazy()).

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export interface Invoice {
  id: string; client: string; clientInitials: string; clientColor: string;
  issueDate: string; dueDate: string; amount: string; rawAmount: number;
  status: InvoiceStatus; payment: string; type: string;
}

export const initialInvoices: Invoice[] = [
  { id: 'SI-000248', client: 'BlueRitt Technologies Inc.', clientInitials: 'BT', clientColor: '#2759CD', issueDate: '2026-05-12', dueDate: '2026-06-12', amount: '$8,450.00', rawAmount: 8450, status: 'Draft', payment: 'Net 30', type: 'Service' },
  { id: 'SI-000247', client: 'Acme Corporation', clientInitials: 'AC', clientColor: '#10B981', issueDate: '2026-05-10', dueDate: '2026-05-25', amount: '$1,200.00', rawAmount: 1200, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000246', client: 'Global Solutions Ltd.', clientInitials: 'GS', clientColor: '#F59E0B', issueDate: '2026-05-08', dueDate: '2026-05-23', amount: '$3,500.00', rawAmount: 3500, status: 'Pending', payment: 'Net 15', type: 'Standard' },
  { id: 'SI-000245', client: 'Starlight Media Group', clientInitials: 'SM', clientColor: '#8B5CF6', issueDate: '2026-05-05', dueDate: '2026-05-20', amount: '$950.00', rawAmount: 950, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000244', client: 'Nexus Systems Corp.', clientInitials: 'NS', clientColor: '#EE4932', issueDate: '2026-05-01', dueDate: '2026-05-16', amount: '$12,000.00', rawAmount: 12000, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000243', client: 'Pinnacle Ventures', clientInitials: 'PV', clientColor: '#0EA5E9', issueDate: '2026-04-28', dueDate: '2026-05-13', amount: '$5,750.00', rawAmount: 5750, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000242', client: 'Apex Digital Studio', clientInitials: 'AD', clientColor: '#EC4899', issueDate: '2026-04-25', dueDate: '2026-05-10', amount: '$2,300.00', rawAmount: 2300, status: 'Pending', payment: 'Net 15', type: 'Service' },
  { id: 'SI-000241', client: 'Quantum Analytics', clientInitials: 'QA', clientColor: '#14B8A6', issueDate: '2026-04-20', dueDate: '2026-05-05', amount: '$6,800.00', rawAmount: 6800, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000240', client: 'Vortex Enterprises', clientInitials: 'VE', clientColor: '#2563EB', issueDate: '2026-04-18', dueDate: '2026-05-03', amount: '$4,120.00', rawAmount: 4120, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000239', client: 'Horizon Media', clientInitials: 'HM', clientColor: '#7C3AED', issueDate: '2026-04-15', dueDate: '2026-04-30', amount: '$1,850.00', rawAmount: 1850, status: 'Pending', payment: 'Net 15', type: 'Service' },
  { id: 'SI-000238', client: 'Titan Industrial', clientInitials: 'TI', clientColor: '#059669', issueDate: '2026-04-12', dueDate: '2026-05-12', amount: '$9,300.00', rawAmount: 9300, status: 'Draft', payment: 'Net 30', type: 'Standard' },
  { id: 'SI-000237', client: 'Nebula Software', clientInitials: 'NS', clientColor: '#DB2777', issueDate: '2026-04-10', dueDate: '2026-04-25', amount: '$5,200.00', rawAmount: 5200, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000236', client: 'Nova Creative', clientInitials: 'NC', clientColor: '#DC2626', issueDate: '2026-04-08', dueDate: '2026-04-23', amount: '$2,950.00', rawAmount: 2950, status: 'Overdue', payment: 'Overdue', type: 'Service' },
  { id: 'SI-000235', client: 'Alpha Logistics', clientInitials: 'AL', clientColor: '#D97706', issueDate: '2026-04-05', dueDate: '2026-04-20', amount: '$7,150.00', rawAmount: 7150, status: 'Paid', payment: 'Cleared', type: 'Standard' },
  { id: 'SI-000234', client: 'Spectra Design', clientInitials: 'SD', clientColor: '#4F46E5', issueDate: '2026-04-02', dueDate: '2026-04-17', amount: '$1,500.00', rawAmount: 1500, status: 'Pending', payment: 'Net 15', type: 'Product' },
  { id: 'SI-000233', client: 'Summit Partners', clientInitials: 'SP', clientColor: '#0891B2', issueDate: '2026-03-29', dueDate: '2026-04-29', amount: '$6,400.00', rawAmount: 6400, status: 'Paid', payment: 'Cleared', type: 'Standard' },
  { id: 'SI-000232', client: 'Infinity Group', clientInitials: 'IG', clientColor: '#EA580C', issueDate: '2026-03-26', dueDate: '2026-04-10', amount: '$3,250.00', rawAmount: 3250, status: 'Overdue', payment: 'Overdue', type: 'Product' },
  { id: 'SI-000231', client: 'Zenith Agency', clientInitials: 'ZA', clientColor: '#0D9488', issueDate: '2026-03-22', dueDate: '2026-04-06', amount: '$4,800.00', rawAmount: 4800, status: 'Pending', payment: 'Net 15', type: 'Service' },
  { id: 'SI-000230', client: 'Catalyst Ventures', clientInitials: 'CV', clientColor: '#9333EA', issueDate: '2026-03-18', dueDate: '2026-04-18', amount: '$8,900.00', rawAmount: 8900, status: 'Draft', payment: 'Net 30', type: 'Standard' },
  { id: 'SI-000229', client: 'Omega Solutions', clientInitials: 'OS', clientColor: '#2563EB', issueDate: '2026-03-15', dueDate: '2026-03-30', amount: '$1,100.00', rawAmount: 1100, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000228', client: 'Delta Consulting', clientInitials: 'DC', clientColor: '#059669', issueDate: '2026-03-12', dueDate: '2026-03-27', amount: '$3,700.00', rawAmount: 3700, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000227', client: 'Echo Studios', clientInitials: 'ES', clientColor: '#E11D48', issueDate: '2026-03-09', dueDate: '2026-03-24', amount: '$2,400.00', rawAmount: 2400, status: 'Overdue', payment: 'Overdue', type: 'Service' },
  { id: 'SI-000226', client: 'Matrix Corp', clientInitials: 'MC', clientColor: '#4F46E5', issueDate: '2026-03-05', dueDate: '2026-04-05', amount: '$11,500.00', rawAmount: 11500, status: 'Pending', payment: 'Net 30', type: 'Standard' },
  { id: 'SI-000225', client: 'Cyber Security Inc', clientInitials: 'CS', clientColor: '#0891B2', issueDate: '2026-03-02', dueDate: '2026-03-17', amount: '$5,600.00', rawAmount: 5600, status: 'Paid', payment: 'Cleared', type: 'Product' },
  { id: 'SI-000224', client: 'Pioneer Lab', clientInitials: 'PL', clientColor: '#D97706', issueDate: '2026-02-28', dueDate: '2026-03-15', amount: '$8,200.00', rawAmount: 8200, status: 'Draft', payment: 'Net 15', type: 'Standard' },
  { id: 'SI-000223', client: 'Solar Energy', clientInitials: 'SE', clientColor: '#10B981', issueDate: '2026-02-25', dueDate: '2026-03-27', amount: '$4,750.00', rawAmount: 4750, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000222', client: 'Lunar Interactive', clientInitials: 'LI', clientColor: '#8B5CF6', issueDate: '2026-02-20', dueDate: '2026-03-07', amount: '$1,900.00', rawAmount: 1900, status: 'Pending', payment: 'Net 15', type: 'Product' },
  { id: 'SI-000221', client: 'Vanguard Tech', clientInitials: 'VT', clientColor: '#EE4932', issueDate: '2026-02-15', dueDate: '2026-03-17', amount: '$10,200.00', rawAmount: 10200, status: 'Overdue', payment: 'Overdue', type: 'Standard' },
  { id: 'SI-000220', client: 'Aurora Media', clientInitials: 'AM', clientColor: '#0EA5E9', issueDate: '2026-02-10', dueDate: '2026-02-25', amount: '$3,100.00', rawAmount: 3100, status: 'Paid', payment: 'Cleared', type: 'Service' },
  { id: 'SI-000219', client: 'Quantum Crest', clientInitials: 'QC', clientColor: '#EC4899', issueDate: '2026-02-05', dueDate: '2026-02-20', amount: '$6,300.00', rawAmount: 6300, status: 'Pending', payment: 'Net 15', type: 'Standard' },
];
