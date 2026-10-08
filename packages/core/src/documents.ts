import type { CargoDetails, CargoType } from './domain.ts';

/**
 * When a document is needed for a load that starts in a customs zone.
 * - always: every import load
 * - sector: only for the listed cargo types
 * - conditional: depends on facts the app can't infer yet; shown as optional with `condition` text
 */
export type DocumentRule =
  | { kind: 'always' }
  | { kind: 'sector'; cargoTypes: CargoType[] }
  | { kind: 'conditional'; condition: string };

export interface DocumentRequirement {
  id: string;
  label: string;
  /** Who issues it — shown under the label in the vault and on the driver's customs pass. */
  issuer: string;
  /** Forms that satisfy this requirement (e.g. C21 or C32 A/B). */
  acceptedForms?: string[];
  rule: DocumentRule;
  /** false = drafted from general knowledge; confirm with the customs authority before launch. */
  verified: boolean;
}

/**
 * Guyana — from "Guyana Import Requirements and Documentation" (GRA/US Commercial Guide, published 2024-01-10).
 */
export const guyanaDocuments: DocumentRequirement[] = [
  {
    id: 'bill_of_lading',
    label: 'Bill of Lading / Airway Bill',
    issuer: 'Carrier — with Freight Certified stamp',
    rule: { kind: 'always' },
    verified: true,
  },
  {
    id: 'commercial_invoice',
    label: 'Certified commercial invoice',
    issuer: 'Supplier — original, with company stamp or signature',
    rule: { kind: 'always' },
    verified: true,
  },
  {
    id: 'customs_declaration',
    label: 'Customs release form',
    issuer: 'Guyana Revenue Authority (GRA)',
    acceptedForms: ['Form C21', 'Form C32 A', 'Form C32 B'],
    rule: { kind: 'always' },
    verified: true,
  },
  {
    id: 'import_license',
    label: 'Import licence certificate',
    issuer: 'Ministry of Tourism, Industry and Commerce',
    rule: { kind: 'always' },
    verified: true,
  },
  {
    id: 'go_invest_concession',
    label: 'GO-Invest concession letter',
    issuer: 'GO-Invest (GRA tax waiver for zero-rated machinery)',
    rule: { kind: 'sector', cargoTypes: ['HEAVY_MACHINERY'] },
    verified: true,
  },
  {
    id: 'ptccd_certificate',
    label: 'PTCCD certificate',
    issuer: 'Pesticide and Toxic Chemicals Control Department',
    rule: { kind: 'sector', cargoTypes: ['CHEMICALS_PHARMA'] },
    verified: true,
  },
  {
    id: 'pharma_import_license',
    label: 'Pharmaceutical / cosmetics import licence',
    issuer: 'Ministry of Trade',
    rule: { kind: 'conditional', condition: 'Pharmaceuticals or cosmetics' },
    verified: true,
  },
  {
    id: 'free_sale_certificate',
    label: 'Certificate of Free Sale',
    issuer: 'US FDA or competent state commerce office — reviewed by GA-FDD',
    rule: { kind: 'sector', cargoTypes: ['FOOD_BEVERAGE'] },
    verified: true,
  },
  {
    id: 'phytosanitary_certificate',
    label: 'Phytosanitary certificate',
    issuer: 'Exporting country — reviewed by GA-FDD',
    rule: { kind: 'sector', cargoTypes: ['FOOD_BEVERAGE'] },
    verified: true,
  },
  {
    id: 'certificate_of_analysis',
    label: 'Certificate of Analysis',
    issuer: 'Accredited lab — reviewed by GA-FDD',
    rule: { kind: 'sector', cargoTypes: ['FOOD_BEVERAGE'] },
    verified: true,
  },
  {
    id: 'certificate_of_origin',
    label: 'Certificate of Origin',
    issuer: 'Exporting country chamber of commerce',
    rule: { kind: 'conditional', condition: 'Requested by GRA for the goods' },
    verified: true,
  },
  {
    id: 'caricom_certificate_of_origin',
    label: 'CARICOM Certificate of Origin',
    issuer: 'CARICOM member state',
    rule: { kind: 'conditional', condition: 'Goods originating in CARICOM' },
    verified: true,
  },
  {
    id: 'certificate_of_inspection',
    label: 'Certificate of Inspection',
    issuer: 'Inspecting agency',
    rule: { kind: 'conditional', condition: 'Required for the goods' },
    verified: true,
  },
  {
    id: 'cg_exemption_letter',
    label: 'CG exemption letter',
    issuer: 'Guyana Revenue Authority (GRA)',
    rule: { kind: 'conditional', condition: 'Exempted items' },
    verified: true,
  },
  {
    id: 'vehicle_cancelled_registration',
    label: 'Cancelled registration (reconditioned vehicle)',
    issuer: 'Previous owner',
    rule: { kind: 'conditional', condition: 'Importing a reconditioned motor vehicle' },
    verified: true,
  },
];

/**
 * Uganda — DRAFT. Not taken from an official source yet; confirm every item with URA or a
 * licensed clearing agent before launch, then flip `verified` to true.
 */
export const ugandaDocuments: DocumentRequirement[] = [
  {
    id: 'bill_of_lading',
    label: 'Bill of Lading / Airway Bill',
    issuer: 'Carrier',
    rule: { kind: 'always' },
    verified: false,
  },
  {
    id: 'commercial_invoice',
    label: 'Commercial invoice',
    issuer: 'Supplier',
    rule: { kind: 'always' },
    verified: false,
  },
  {
    id: 'packing_list',
    label: 'Packing list',
    issuer: 'Supplier',
    rule: { kind: 'always' },
    verified: false,
  },
  {
    id: 'customs_declaration',
    label: 'Customs entry (ASYCUDA World)',
    issuer: 'Uganda Revenue Authority (URA)',
    rule: { kind: 'always' },
    verified: false,
  },
  {
    id: 'certificate_of_origin',
    label: 'Certificate of Origin (EAC / COMESA)',
    issuer: 'Exporting country',
    rule: { kind: 'conditional', condition: 'Claiming preferential duty' },
    verified: false,
  },
  {
    id: 'certificate_of_conformity',
    label: 'Certificate of Conformity (PVoC)',
    issuer: 'Uganda National Bureau of Standards (UNBS)',
    rule: { kind: 'conditional', condition: 'Goods under UNBS standards' },
    verified: false,
  },
  {
    id: 'phytosanitary_certificate',
    label: 'Phytosanitary / import permit',
    issuer: 'Ministry of Agriculture (MAAIF)',
    rule: { kind: 'sector', cargoTypes: ['FOOD_BEVERAGE'] },
    verified: false,
  },
  {
    id: 'pharma_import_license',
    label: 'Drug import permit',
    issuer: 'National Drug Authority (NDA)',
    rule: { kind: 'conditional', condition: 'Pharmaceuticals' },
    verified: false,
  },
  {
    id: 'chemical_import_permit',
    label: 'Chemical import permit',
    issuer: 'Relevant regulator — to confirm',
    rule: { kind: 'sector', cargoTypes: ['CHEMICALS_PHARMA'] },
    verified: false,
  },
];

/** Documents a load must carry, split into required and conditional (optional) lists. */
export function documentsFor(catalog: DocumentRequirement[], cargo: Pick<CargoDetails, 'type' | 'requiresGoInvestWaiver'>) {
  const required: DocumentRequirement[] = [];
  const conditional: DocumentRequirement[] = [];
  for (const doc of catalog) {
    const { rule } = doc;
    if (rule.kind === 'always') required.push(doc);
    else if (rule.kind === 'sector' && rule.cargoTypes.includes(cargo.type)) {
      // The concession letter only applies when the shipper claims the zero-rated waiver.
      if (doc.id === 'go_invest_concession' && !cargo.requiresGoInvestWaiver) continue;
      required.push(doc);
    } else if (rule.kind === 'conditional') conditional.push(doc);
  }
  return { required, conditional };
}
