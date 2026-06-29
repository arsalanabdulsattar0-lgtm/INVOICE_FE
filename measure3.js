const sample = Array.from({ length: 20000 }, (_, i) => {
  const isSupplier = i % 4 === 0;
  return {
    id: `${i}`,
    customer_id: `BP-${i}`,
    name: `Business Partner ${i}`,
    is_walkin: false,
    is_filer: true,
    credit_limit: 0,
    opening_balance: 0,
    payment_term_days: 0,
    discount_percent: 0,
    is_active: true,
    bp_type: isSupplier ? 'supplier' : 'customer',
  };
});
const str = JSON.stringify(sample);
console.log(`Size: ${(str.length / 1024 / 1024).toFixed(2)} MB`);
