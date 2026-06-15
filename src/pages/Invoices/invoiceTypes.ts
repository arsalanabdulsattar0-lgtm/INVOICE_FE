// ─── Shared Invoice Types & Initial Data ─────────────────────────────────────
// Extracted here so App.tsx can import these without statically pulling in the
// full InvoiceList page bundle (which would defeat code-splitting via lazy()).

import type { Invoice, InvoiceStatus } from '../../types';
import { initialInvoices } from '../../utils/invoiceData';

export type { Invoice, InvoiceStatus };
export { initialInvoices };

