/**
 * Documents a driver uploads to get verified (KYC). Staff check them against
 * the driver's licence number before marking the driver VERIFIED.
 */
export interface DriverDocumentRequirement {
  id: string;
  label: string;
  /** Who issues it, shown under the label. */
  issuer: string;
  /** What a good photo looks like. */
  hint: string;
  /** false = drafted from general knowledge; confirm with operations before launch. */
  verified: boolean;
}

const selfie: DriverDocumentRequirement = {
  id: 'selfie_with_licence',
  label: 'Photo of you holding your licence',
  issuer: 'Taken now, in good light',
  hint: 'Your face and the licence photo both clearly visible',
  verified: false,
};

export const guyanaDriverDocuments: DriverDocumentRequirement[] = [
  {
    id: 'licence_front',
    label: "Driver's licence (front)",
    issuer: 'Guyana Revenue Authority — Licence Revenue',
    hint: 'All four corners in frame, text readable, no glare',
    verified: false,
  },
  {
    id: 'licence_back',
    label: "Driver's licence (back)",
    issuer: 'Guyana Revenue Authority — Licence Revenue',
    hint: 'Shows the vehicle classes you may drive',
    verified: false,
  },
  {
    id: 'national_id',
    label: 'National ID card or passport',
    issuer: 'GECOM (ID card) or Ministry of Home Affairs (passport)',
    hint: 'The page or side with your photo',
    verified: false,
  },
  selfie,
];

export const ugandaDriverDocuments: DriverDocumentRequirement[] = [
  {
    id: 'licence_front',
    label: 'Driving permit (front)',
    issuer: 'Ministry of Works and Transport',
    hint: 'All four corners in frame, text readable, no glare',
    verified: false,
  },
  {
    id: 'licence_back',
    label: 'Driving permit (back)',
    issuer: 'Ministry of Works and Transport',
    hint: 'Shows the permit classes you hold',
    verified: false,
  },
  {
    id: 'national_id',
    label: 'National ID',
    issuer: 'National Identification and Registration Authority (NIRA)',
    hint: 'The side with your photo and NIN',
    verified: false,
  },
  selfie,
];

/** Decisions staff can make on a driver's documents. */
export const DRIVER_REVIEW_DECISIONS = ['VERIFIED', 'REJECTED'] as const;
export type DriverReviewDecision = (typeof DRIVER_REVIEW_DECISIONS)[number];
