import type { Product } from '../pages/Inventry/ProductList';

// ─────────────────────────────────────────────────────────────────────────────
// Seed data – 55 real chemical / flavour ingredient products
// Organized across categories matching productData.ts
// Used to pre-populate localStorage on first launch.
// ─────────────────────────────────────────────────────────────────────────────

interface SeedEntry {
  name: string;
  code: string;
  category_id: string;  // cat-1=Flavour, cat-2=Hardware, cat-3=Cabling, cat-4=Networking, cat-5=Software, cat-6=Services
  description: string;
  fbr_uom: string;
  sale_price: number;
  cost: number;
  gst_rate: number;
}

const SEED_ENTRIES: SeedEntry[] = [
  // ── Sweeteners & Bulk Carriers (cat-1) ──────────────────────────────────
  { name: 'Dextrose Anhydrous',               code: 'SW-001', category_id: 'cat-1', description: 'Pure anhydrous dextrose used as a sweetener and bulk carrier in food and pharmaceutical formulations.', fbr_uom: 'KG',  sale_price: 120,  cost: 80,   gst_rate: 18 },
  { name: 'Dextrose Monohydrate',             code: 'SW-002', category_id: 'cat-1', description: 'Dextrose monohydrate, widely used in energy drinks, pharmaceuticals, and food industry as a sweetener.', fbr_uom: 'KG',  sale_price: 115,  cost: 75,   gst_rate: 18 },
  { name: 'Sorbitol 70% Solution',            code: 'SW-003', category_id: 'cat-1', description: 'Liquid sorbitol 70% solution, used as a humectant, sweetener, and bulk carrier in oral care and food.', fbr_uom: 'KG',  sale_price: 95,   cost: 60,   gst_rate: 18 },
  { name: 'Maltodextrin DE 10-12',            code: 'SW-004', category_id: 'cat-1', description: 'Maltodextrin with dextrose equivalent 10-12, used as a filler, binder, and carrier in spray drying.', fbr_uom: 'KG',  sale_price: 145,  cost: 95,   gst_rate: 18 },
  { name: 'Glucose Syrup',                    code: 'SW-005', category_id: 'cat-1', description: 'High-purity glucose syrup used as a sweetener, humectant, and fermentation substrate.', fbr_uom: 'KG',  sale_price: 88,   cost: 55,   gst_rate: 18 },
  { name: 'Sucralose',                        code: 'SW-006', category_id: 'cat-1', description: 'High-intensity non-caloric sweetener, 600x sweeter than sugar. Stable across wide pH and temperature ranges.', fbr_uom: 'KG',  sale_price: 3800, cost: 2600, gst_rate: 18 },
  { name: 'Aspartame',                        code: 'SW-007', category_id: 'cat-1', description: 'Low-calorie dipeptide sweetener, approximately 200x sweeter than sucrose. Used in beverages and confectionery.', fbr_uom: 'KG',  sale_price: 2200, cost: 1500, gst_rate: 18 },
  { name: 'Acesulfame Potassium (Ace-K)',     code: 'SW-008', category_id: 'cat-1', description: 'Potassium salt of acesulfamic acid, 200x sweeter than sucrose. Synergises well with other sweeteners.', fbr_uom: 'KG',  sale_price: 2500, cost: 1700, gst_rate: 18 },

  // ── Acidulants & Preservatives (cat-2) ───────────────────────────────────
  { name: 'Citric Acid Monohydrate',          code: 'AC-001', category_id: 'cat-2', description: 'Food-grade citric acid monohydrate, used as an acidulant, preservative, and chelating agent.', fbr_uom: 'KG',  sale_price: 280,  cost: 190,  gst_rate: 18 },
  { name: 'Citric Acid Anhydrous',            code: 'AC-002', category_id: 'cat-2', description: 'Anhydrous citric acid powder with high purity, suitable for dry mix formulations and effervescent tablets.', fbr_uom: 'KG',  sale_price: 295,  cost: 200,  gst_rate: 18 },
  { name: 'Malic Acid',                       code: 'AC-003', category_id: 'cat-2', description: 'DL-Malic acid, provides a smooth tart taste. Used in beverages, confectionery, and fruit flavour enhancement.', fbr_uom: 'KG',  sale_price: 420,  cost: 290,  gst_rate: 18 },
  { name: 'Tartaric Acid',                    code: 'AC-004', category_id: 'cat-2', description: 'Natural tartaric acid used as an acidulant in beverages, baking powder, and cream of tartar production.', fbr_uom: 'KG',  sale_price: 510,  cost: 350,  gst_rate: 18 },
  { name: 'Sodium Benzoate',                  code: 'AC-005', category_id: 'cat-2', description: 'Widely used food preservative effective against yeast and bacteria. Soluble in water, food-grade quality.', fbr_uom: 'KG',  sale_price: 195,  cost: 130,  gst_rate: 18 },
  { name: 'Potassium Sorbate',               code: 'AC-006', category_id: 'cat-2', description: 'Potassium salt of sorbic acid, used as a mold and yeast inhibitor in beverages, dairy, and baked goods.', fbr_uom: 'KG',  sale_price: 480,  cost: 330,  gst_rate: 18 },
  { name: 'Ascorbic Acid (Vitamin C)',        code: 'AC-007', category_id: 'cat-2', description: 'Pharmaceutical-grade L-Ascorbic acid used as antioxidant, nutrient fortifier, and dough conditioner.', fbr_uom: 'KG',  sale_price: 650,  cost: 450,  gst_rate: 18 },

  // ── Aroma Chemicals (Fragrance) (cat-3) ──────────────────────────────────
  { name: 'Vanillin',                         code: 'AR-001', category_id: 'cat-3', description: 'Synthetic vanillin, primary aromatic component of vanilla. Used in food, fragrance, and pharmaceutical industries.', fbr_uom: 'KG',  sale_price: 1800, cost: 1200, gst_rate: 18 },
  { name: 'Ethyl Vanillin',                   code: 'AR-002', category_id: 'cat-3', description: 'Ethyl vanillin is 3-4x more potent than vanillin. Used in chocolate, ice cream, and bakery applications.', fbr_uom: 'KG',  sale_price: 3200, cost: 2100, gst_rate: 18 },
  { name: 'Menthol Crystals BP',              code: 'AR-003', category_id: 'cat-3', description: 'British Pharmacopoeia grade menthol crystals. Provides cooling sensation in confectionery, oral care, and tobacco.', fbr_uom: 'KG',  sale_price: 2800, cost: 1900, gst_rate: 18 },
  { name: 'Linalool',                         code: 'AR-004', category_id: 'cat-3', description: 'Naturally occurring terpene alcohol with a floral, lavender-like scent. Used in perfumery and flavour applications.', fbr_uom: 'KG',  sale_price: 1200, cost: 800,  gst_rate: 18 },
  { name: 'Geraniol',                         code: 'AR-005', category_id: 'cat-3', description: 'Monoterpenoid and alcohol with a rose-like scent. Used in rose, geranium, and citrus fragrance compositions.', fbr_uom: 'KG',  sale_price: 1450, cost: 960,  gst_rate: 18 },
  { name: 'Citral',                           code: 'AR-006', category_id: 'cat-3', description: 'Natural terpene aldehyde with strong lemon aroma. Key ingredient in lemon grass oil and citrus fragrances.', fbr_uom: 'KG',  sale_price: 1100, cost: 730,  gst_rate: 18 },
  { name: 'Limonene (D-Limonene)',            code: 'AR-007', category_id: 'cat-3', description: 'D-Limonene, a cyclic terpene with fresh orange peel aroma. Used as a flavour compound, solvent, and cleaner.', fbr_uom: 'KG',  sale_price: 680,  cost: 450,  gst_rate: 18 },
  { name: 'Benzyl Alcohol',                   code: 'AR-008', category_id: 'cat-3', description: 'Aromatic alcohol with mild pleasant scent. Used as a solvent, preservative, and fragrance ingredient.', fbr_uom: 'KG',  sale_price: 520,  cost: 340,  gst_rate: 18 },
  { name: 'Phenyl Ethyl Alcohol',             code: 'AR-009', category_id: 'cat-3', description: 'PEA with characteristic rose odour. Widely used in rose-type fragrances and cosmetic formulations.', fbr_uom: 'KG',  sale_price: 980,  cost: 650,  gst_rate: 18 },
  { name: 'Coumarin',                         code: 'AR-010', category_id: 'cat-3', description: 'Benzopyrone with a sweet hay-like odour. Used in fougère, oriental, and floral fragrance compositions.', fbr_uom: 'KG',  sale_price: 1350, cost: 900,  gst_rate: 18 },
  { name: 'Musk Ketone',                      code: 'AR-011', category_id: 'cat-3', description: 'Nitro musk with powerful musky odour. Widely used as a fixative in fine fragrances and personal care products.', fbr_uom: 'KG',  sale_price: 2100, cost: 1400, gst_rate: 18 },
  { name: 'Iso E Super',                      code: 'AR-012', category_id: 'cat-3', description: 'Woody, cedar-like aroma chemical with diffusive quality. Used in masculine and unisex fragrance compositions.', fbr_uom: 'KG',  sale_price: 2400, cost: 1600, gst_rate: 18 },
  { name: 'Hedione (Methyl Dihydrojasmonate)', code: 'AR-013', category_id: 'cat-3', description: 'Jasmine-like aroma chemical with transparent floral note. Essential ingredient in many floral and fresh fragrances.', fbr_uom: 'KG',  sale_price: 1900, cost: 1280, gst_rate: 18 },

  // ── Flavour Compounds (cat-4) ────────────────────────────────────────────
  { name: 'Ethyl Maltol',                     code: 'FL-001', category_id: 'cat-4', description: 'Flavour enhancer with fruity, caramel-like sweetness. 5x more potent than maltol. Used in beverages and confectionery.', fbr_uom: 'KG',  sale_price: 3500, cost: 2400, gst_rate: 18 },
  { name: 'Maltol',                           code: 'FL-002', category_id: 'cat-4', description: 'Naturally occurring compound with caramel/toffee-like aroma. Used to enhance sweet and fruity flavour profiles.', fbr_uom: 'KG',  sale_price: 2200, cost: 1500, gst_rate: 18 },
  { name: 'Ethyl Butyrate (Pineapple/Fruity)', code: 'FL-003', category_id: 'cat-4', description: 'Ethyl ester of butyric acid with strong pineapple/fruity aroma. Used in tropical fruit flavour formulations.', fbr_uom: 'KG',  sale_price: 890,  cost: 590,  gst_rate: 18 },
  { name: 'Isoamyl Acetate (Banana)',         code: 'FL-004', category_id: 'cat-4', description: 'Isoamyl acetate with characteristic banana and pear aroma. Common ingredient in fruit flavours and confectionery.', fbr_uom: 'KG',  sale_price: 750,  cost: 500,  gst_rate: 18 },
  { name: 'Ethyl Acetate',                    code: 'FL-005', category_id: 'cat-4', description: 'Ethyl ester with fruity solvent-like odour. Used as a carrier solvent and flavour modifier in food industry.', fbr_uom: 'KG',  sale_price: 340,  cost: 220,  gst_rate: 18 },
  { name: 'Benzaldehyde (Almond/Cherry)',     code: 'FL-006', category_id: 'cat-4', description: 'Aromatic aldehyde with almond/cherry-like aroma. Used in cherry, almond, and marzipan flavour compounds.', fbr_uom: 'KG',  sale_price: 680,  cost: 450,  gst_rate: 18 },
  { name: 'Cinnamaldehyde (Cinnamon)',        code: 'FL-007', category_id: 'cat-4', description: 'Trans-cinnamaldehyde with warm cinnamon aroma. Used in cinnamon flavours, confectionery, and oral care products.', fbr_uom: 'KG',  sale_price: 920,  cost: 610,  gst_rate: 18 },
  { name: 'Eugenol (Clove)',                  code: 'FL-008', category_id: 'cat-4', description: 'Phenylpropanoid with clove-like aroma. Used in clove flavours, dental preparations, and as an antiseptic.', fbr_uom: 'KG',  sale_price: 840,  cost: 560,  gst_rate: 18 },
  { name: 'Anethole (Anise)',                 code: 'FL-009', category_id: 'cat-4', description: 'Trans-anethole with sweet liquorice/anise aroma. Key flavour compound in anise, fennel, and sambuca products.', fbr_uom: 'KG',  sale_price: 780,  cost: 520,  gst_rate: 18 },
  { name: 'Furaneol (Strawberry/Caramel)',    code: 'FL-010', category_id: 'cat-4', description: 'DMHF (Furaneol) with intense strawberry and caramel notes. Powerful flavour enhancer used in fruit formulations.', fbr_uom: 'KG',  sale_price: 4200, cost: 2900, gst_rate: 18 },

  // ── Essential Oils & Naturals (cat-5) ────────────────────────────────────
  { name: 'Peppermint Oil',                   code: 'EO-001', category_id: 'cat-5', description: 'Steam-distilled peppermint oil with high menthol content. Used in confectionery, oral care, and pharmaceutical products.', fbr_uom: 'KG',  sale_price: 2200, cost: 1500, gst_rate: 18 },
  { name: 'Orange Oil Cold Pressed',          code: 'EO-002', category_id: 'cat-5', description: 'Cold pressed orange peel oil with fresh citrus aroma. Used in beverages, confectionery, and fragrance blending.', fbr_uom: 'KG',  sale_price: 850,  cost: 560,  gst_rate: 18 },
  { name: 'Lemon Oil',                        code: 'EO-003', category_id: 'cat-5', description: 'Cold pressed lemon peel oil with bright zesty aroma. Widely used in food flavouring, cosmetics, and household products.', fbr_uom: 'KG',  sale_price: 920,  cost: 610,  gst_rate: 18 },
  { name: 'Eucalyptus Oil 80%',              code: 'EO-004', category_id: 'cat-5', description: 'Eucalyptus oil standardised to 80% cineole content. Used in pharmaceutical, oral care, and inhalation products.', fbr_uom: 'KG',  sale_price: 1100, cost: 730,  gst_rate: 18 },
  { name: 'Clove Leaf Oil',                   code: 'EO-005', category_id: 'cat-5', description: 'Steam-distilled clove leaf oil rich in eugenol. Used in dental preparations, confectionery, and fragrance blending.', fbr_uom: 'KG',  sale_price: 980,  cost: 650,  gst_rate: 18 },
  { name: 'Lavender Oil',                     code: 'EO-006', category_id: 'cat-5', description: 'True lavender essential oil with floral, herbaceous aroma. Used in aromatherapy, cosmetics, and personal care formulations.', fbr_uom: 'KG',  sale_price: 3500, cost: 2400, gst_rate: 18 },
  { name: 'Rose Water Concentrate',           code: 'EO-007', category_id: 'cat-5', description: 'Concentrated rose water with authentic rose aroma. Used in beverages, confectionery, cosmetics, and culinary applications.', fbr_uom: 'LTR', sale_price: 1200, cost: 800,  gst_rate: 18 },

  // ── Solvents & Carriers (cat-6) ──────────────────────────────────────────
  { name: 'Propylene Glycol USP',             code: 'SC-001', category_id: 'cat-6', description: 'USP-grade propylene glycol used as a solvent, humectant, and carrier for flavour and fragrance compounds.', fbr_uom: 'KG',  sale_price: 380,  cost: 250,  gst_rate: 18 },
  { name: 'Glycerine (Refined Glycerol) 99.5%', code: 'SC-002', category_id: 'cat-6', description: 'Pharmaceutical-grade glycerol 99.5% purity. Used as a humectant, solvent, and sweetening agent in food and pharma.', fbr_uom: 'KG',  sale_price: 320,  cost: 210,  gst_rate: 18 },
  { name: 'Triacetin (Glyceryl Triacetate)',  code: 'SC-003', category_id: 'cat-6', description: 'Triacetin used as a plasticiser and solvent for flavours in tobacco, confectionery, and pharmaceutical applications.', fbr_uom: 'KG',  sale_price: 520,  cost: 345,  gst_rate: 18 },
  { name: 'Ethyl Alcohol (Denatured)',        code: 'SC-004', category_id: 'cat-6', description: 'Denatured ethyl alcohol used as a solvent and carrier in fragrance, cosmetic, and flavour manufacturing.', fbr_uom: 'LTR', sale_price: 420,  cost: 280,  gst_rate: 18 },
  { name: 'MCT Oil (Medium Chain Triglycerides)', code: 'SC-005', category_id: 'cat-6', description: 'Food-grade MCT oil derived from coconut. Used as a carrier for fat-soluble flavours, supplements, and nutraceuticals.', fbr_uom: 'KG',  sale_price: 750,  cost: 500,  gst_rate: 18 },

  // ── Emulsifiers & Stabilizers (cat-7) ────────────────────────────────────
  { name: 'Gum Arabic (Acacia Gum)',          code: 'EM-001', category_id: 'cat-7', description: 'Natural exudate gum used as an emulsifier, stabiliser, and encapsulating agent for flavours and beverages.', fbr_uom: 'KG',  sale_price: 680,  cost: 450,  gst_rate: 18 },
  { name: 'Xanthan Gum',                      code: 'EM-002', category_id: 'cat-7', description: 'Polysaccharide gum used as a thickener, stabiliser, and suspension agent in food and cosmetic formulations.', fbr_uom: 'KG',  sale_price: 980,  cost: 650,  gst_rate: 18 },
  { name: 'Lecithin (Soy)',                   code: 'EM-003', category_id: 'cat-7', description: 'Soy-derived lecithin used as an emulsifier in chocolate, margarine, bakery, and pharmaceutical products.', fbr_uom: 'KG',  sale_price: 420,  cost: 280,  gst_rate: 18 },
  { name: 'Polysorbate 80 (Tween 80)',        code: 'EM-004', category_id: 'cat-7', description: 'Non-ionic surfactant and emulsifier used to solubilise flavours, vitamins, and active ingredients in aqueous systems.', fbr_uom: 'KG',  sale_price: 580,  cost: 385,  gst_rate: 18 },
  { name: 'CMC (Carboxymethyl Cellulose)',    code: 'EM-005', category_id: 'cat-7', description: 'Sodium carboxymethyl cellulose used as a thickener, stabiliser, and binder in food, pharma, and personal care.', fbr_uom: 'KG',  sale_price: 340,  cost: 225,  gst_rate: 18 },
];

export function buildSeededProducts(): Product[] {
  return SEED_ENTRIES.map((entry, i): Product => ({
    id: crypto.randomUUID(),
    name: entry.name,
    code: entry.code,
    category_id: entry.category_id,
    brand_id: `br-${(i % 6) + 1}`,
    make_id: `mk-${(i % 5) + 1}`,
    model_id: `md-${(i % 5) + 1}`,
    size_id: `sz-${(i % 5) + 1}`,
    uom_id: entry.fbr_uom === 'LTR' ? 'uom-3' : 'uom-1',
    sale_price: entry.sale_price,
    cost: entry.cost,
    mrp_ex_tax: Math.round(entry.sale_price * 0.92 * 100) / 100,
    mrp_inc_tax: Math.round(entry.sale_price * 1.18 * 100) / 100,
    opening_qty: 20 + (i % 8) * 5,
    opening_rate: entry.cost,
    low_stock_level: 10,
    weight: 0.5 + (i % 10) * 0.05,
    gst_rate: entry.gst_rate,
    non_filer_gst_rate: entry.gst_rate + 6,
    adt_rate: 2,
    sale_discount: 5,
    purchase_discount: 8,
    fbr_uom: entry.fbr_uom,
    sro_item_serial_no: `SRO-SR-${100 + i}`,
    sro_schedule_no: `SCH-N-${200 + i}`,
    fbr_sale_rate: entry.sale_price,
    fbr_sale_type: 'Taxable',
    hs_code: `HS-${2900 + i}`,
    gst_tax_id: 'tax-gst-18',
    non_filer_tax_id: 'tax-nf-4',
    adt_tax_id: 'tax-adt-1',
    fbr_tax_id: 'tax-fbr-active',
    description: entry.description,
    notes: 'Store in a cool, dry place away from direct sunlight.',
    is_active: true,
    expiry_date: i % 4 === 0 ? '30-Jun-2028' : i % 4 === 1 ? '31-Dec-2027' : i % 4 === 2 ? '31-Mar-2028' : '30-Sep-2027',
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preferred_supplier_id: `sup-${(i % 5) + 1}`,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch seed – 2 batches per product = 110 batches total
// Each batch references the corresponding seed product by a stable pseudo-id.
// ─────────────────────────────────────────────────────────────────────────────

export interface SeededBatch {
  id: string;
  product_id: string;
  product_name: string;
  batch_no: string;
  mfg_date: string;
  expiry_date: string;
  is_active: boolean;
  supplier?: string;
  food_grade?: boolean;
  coa_available?: boolean;
  halal_certificate?: boolean;
  dg_type?: string;
  flash_point?: string;
}

// Supplier names aligned with sup-1…sup-5 in productData.ts
const SUPPLIER_NAMES: Record<number, string> = {
  1: 'Logitech Wholesale',
  2: 'ASUS Distribution',
  3: 'Cisco Partner PK',
  4: 'Intel Distributors',
  5: 'Local Supplier',
};

function batchMfgDate(yearsAgo: number, monthOffset = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  d.setMonth(d.getMonth() - monthOffset);
  return d.toISOString().split('T')[0];
}

function batchExpiryDate(yearsFromNow: number, monthOffset = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + yearsFromNow);
  d.setMonth(d.getMonth() + monthOffset);
  return d.toISOString().split('T')[0];
}

export function buildSeededBatches(): SeededBatch[] {
  const batches: SeededBatch[] = [];

  SEED_ENTRIES.forEach((entry, i) => {
    const productId = `seed-prod-${i + 1}`;
    const supplierNo = (i % 5) + 1;

    // Batch A — primary / current lot
    batches.push({
      id: `sb-${i + 1}-a`,
      product_id: productId,
      product_name: entry.name,
      batch_no: `${entry.code}-LOT${String(i + 1).padStart(3, '0')}A`,
      mfg_date: batchMfgDate(1, i % 6),
      expiry_date: batchExpiryDate(3, i % 4),
      is_active: true,
      supplier: SUPPLIER_NAMES[supplierNo],
      food_grade: ['cat-1', 'cat-2', 'cat-4', 'cat-5'].includes(entry.category_id),
      coa_available: true,
      halal_certificate: i % 3 !== 2,
      dg_type: 'Non DG',
      flash_point: '',
    });

    // Batch B — older / reserve lot
    batches.push({
      id: `sb-${i + 1}-b`,
      product_id: productId,
      product_name: entry.name,
      batch_no: `${entry.code}-LOT${String(i + 1).padStart(3, '0')}B`,
      mfg_date: batchMfgDate(2, i % 3),
      expiry_date: batchExpiryDate(2, (i + 2) % 6),
      is_active: i % 5 !== 4,   // most active, a few inactive for realism
      supplier: SUPPLIER_NAMES[supplierNo],
      food_grade: ['cat-1', 'cat-2', 'cat-4', 'cat-5'].includes(entry.category_id),
      coa_available: i % 4 !== 3,
      halal_certificate: i % 4 !== 3,
      dg_type: 'Non DG',
      flash_point: '',
    });
  });

  return batches;
}
