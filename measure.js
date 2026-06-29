const fs = require('fs');
const sample = Array.from({ length: 20000 }, (_, i) => {
  const isSupplier = i % 4 === 0;
  return {
    id: `${i}`,
    customer_id: `BP${i}`,
    name: `BP ${i}`,
    // Omit fields to save space. We can cast them as undefined if TS complains, 
    // but at runtime they'll be absent from JSON.
    // Let's only include required fields, or set empty strings to undefined
    email: undefined,
    phone: undefined,
    mobile: undefined,
    website: undefined,
    is_walkin: false,
    is_filer: true,
    credit_limit: 0,
    opening_balance: 0,
    opening_date: undefined,
    payment_term_days: 0,
    discount_percent: 0,
    address: undefined,
    city: undefined,
    province: undefined,
    country: undefined,
    ntn: undefined,
    stn: undefined,
    cnic: undefined,
    wht_type: undefined,
    is_active: true,
    sales_person_id: undefined,
    bp_type: isSupplier ? 'supplier' : 'customer',
  };
});
const str = JSON.stringify(sample);
console.log(`Size: ${(str.length / 1024 / 1024).toFixed(2)} MB`);
