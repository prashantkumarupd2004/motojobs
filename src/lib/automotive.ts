/**
 * Automotive sector taxonomy — the single source of domain vocabulary for Motojobs.in.
 *
 * CONSTRAINT: this file is imported by `prisma/seed.ts`, which runs under bare `node`
 * relying on native type-stripping. Therefore it must contain ONLY erasable TypeScript
 * (no `enum`, no `namespace`, no parameter properties) and must NEVER import `react`
 * or `lucide-react`. Category icons live in `automotive-icons.ts` for that reason.
 */

export const JOB_CATEGORIES = [
  { id: 'sales', label: 'Sales & Showroom', icon: 'CarFront', blurb: 'Showroom sales, test drives, deliveries' },
  { id: 'service', label: 'Service & Workshop', icon: 'Wrench', blurb: 'Periodic service, repairs, diagnostics' },
  { id: 'spare-parts', label: 'Spare Parts', icon: 'Package', blurb: 'Parts counter, stores, inventory' },
  { id: 'body-shop', label: 'Body Shop & Paint', icon: 'SprayCan', blurb: 'Denting, painting, accident repair' },
  { id: 'ev', label: 'EV & New Energy', icon: 'BatteryCharging', blurb: 'Battery systems, charging infrastructure' },
  { id: 'finance', label: 'Finance & Insurance', icon: 'BadgeIndianRupee', blurb: 'Vehicle loans, insurance, documentation' },
  { id: 'pre-owned', label: 'Pre-Owned Vehicles', icon: 'CarTaxiFront', blurb: 'Evaluation, refurbishment, resale' },
  { id: 'crm', label: 'CRM & Telecalling', icon: 'Headset', blurb: 'Customer relations, follow-ups, PSF calls' },
  { id: 'management', label: 'Dealership Management', icon: 'UserCog', blurb: 'Branch, profit-centre and group roles' },
  { id: 'manufacturing', label: 'OEM & Components', icon: 'Factory', blurb: 'Plant, quality, supply chain, R&D' },
  { id: 'logistics', label: 'Fleet & Logistics', icon: 'Truck', blurb: 'Fleet upkeep, drivers, transport ops' },
  { id: 'support', label: 'Support Functions', icon: 'ClipboardList', blurb: 'HR, accounts, admin at auto businesses' },
] as const;

export type CategoryId = (typeof JOB_CATEGORIES)[number]['id'];

export const ROLES_BY_CATEGORY: Record<CategoryId, string[]> = {
  sales: [
    'Sales Consultant',
    'Senior Sales Executive',
    'Showroom Manager',
    'Team Leader - Sales',
    'Sales Trainee',
    'Delivery Executive',
    'Corporate Sales Executive',
    'Two-Wheeler Sales Executive',
  ],
  service: [
    'Service Advisor',
    'Automobile Technician',
    'Diesel Mechanic',
    'Auto Electrician',
    'Diagnostic Technician',
    'Workshop Manager',
    'Service Manager',
    'Two-Wheeler Mechanic',
    'Wheel Alignment Technician',
    'Quality Control Inspector',
    'Floor Supervisor',
    'Warranty Executive',
  ],
  'spare-parts': [
    'Spare Parts Executive',
    'Parts Manager',
    'Parts Counter Sales Executive',
    'Storekeeper',
    'Inventory Executive',
    'Accessories Sales Executive',
  ],
  'body-shop': [
    'Body Shop Painter',
    'Denter',
    'Body Shop Manager',
    'Body Shop Advisor',
    'Insurance Surveyor Coordinator',
    'Polishing Technician',
  ],
  ev: [
    'EV Technician',
    'Battery Diagnostics Engineer',
    'Charging Infrastructure Technician',
    'EV Sales Consultant',
    'HV Safety Supervisor',
  ],
  finance: [
    'Finance Executive',
    'Insurance Advisor',
    'Loan Documentation Executive',
    'RTO Executive',
    'Finance Manager',
  ],
  'pre-owned': [
    'Used Car Evaluator',
    'Pre-Owned Sales Consultant',
    'Refurbishment Supervisor',
    'Procurement Executive',
    'Pre-Owned Business Manager',
  ],
  crm: [
    'Telecaller / CRE',
    'Customer Relations Manager',
    'Service CRE',
    'Call Centre Executive',
    'Customer Feedback Executive',
  ],
  management: [
    'General Manager - Dealership',
    'Branch Manager',
    'Profit Centre Head',
    'Operations Manager',
    'Area Sales Manager',
    'Territory Service Manager',
    'Dealer Principal',
  ],
  manufacturing: [
    'Production Engineer',
    'Quality Engineer',
    'Design Engineer - Automotive',
    'Maintenance Technician',
    'Supply Chain Executive',
    'Vehicle Testing Engineer',
    'Line Supervisor',
  ],
  logistics: [
    'Fleet Supervisor',
    'Commercial Vehicle Driver',
    'Transport Coordinator',
    'Fleet Maintenance Executive',
    'Yard Incharge',
  ],
  support: [
    'HR Executive - Dealership',
    'Accounts Executive',
    'Showroom Receptionist',
    'Admin Executive',
    'Marketing Executive - Auto',
  ],
};

export const ALL_ROLES: string[] = Object.values(ROLES_BY_CATEGORY).flat();

export const ROLE_TO_CATEGORY: Record<string, CategoryId> = Object.fromEntries(
  (Object.keys(ROLES_BY_CATEGORY) as CategoryId[]).flatMap((cat) =>
    ROLES_BY_CATEGORY[cat].map((role) => [role, cat] as const)
  )
);

export const SKILL_GROUPS = ['Technical', 'EV', 'Software', 'Process', 'Sales', 'Soft'] as const;
export type SkillGroup = (typeof SKILL_GROUPS)[number];

export const AUTOMOTIVE_SKILLS: Array<{ name: string; category: SkillGroup }> = [
  { name: 'Engine Diagnostics', category: 'Technical' },
  { name: 'Engine Overhauling', category: 'Technical' },
  { name: 'Transmission Repair', category: 'Technical' },
  { name: 'Brake System Servicing', category: 'Technical' },
  { name: 'Suspension & Steering', category: 'Technical' },
  { name: 'Wheel Alignment & Balancing', category: 'Technical' },
  { name: 'Auto Electrical Wiring', category: 'Technical' },
  { name: 'AC & HVAC Servicing', category: 'Technical' },
  { name: 'Denting & Painting', category: 'Technical' },
  { name: 'Spray Booth Operation', category: 'Technical' },
  { name: 'Fuel Injection Systems', category: 'Technical' },
  { name: 'BS6 Emission Norms', category: 'Technical' },
  { name: 'OBD Scanner Operation', category: 'Technical' },
  { name: 'Periodic Maintenance Service', category: 'Technical' },
  { name: 'Tyre Fitment', category: 'Technical' },
  { name: 'Two-Wheeler Servicing', category: 'Technical' },
  { name: 'Commercial Vehicle Repair', category: 'Technical' },
  { name: 'Welding & Fabrication', category: 'Technical' },

  { name: 'EV Battery Systems', category: 'EV' },
  { name: 'HV Safety Protocols', category: 'EV' },
  { name: 'Battery Management System (BMS)', category: 'EV' },
  { name: 'EV Motor & Controller Diagnostics', category: 'EV' },
  { name: 'Charging Station Installation', category: 'EV' },
  { name: 'Thermal Management Systems', category: 'EV' },

  { name: 'DMS Software', category: 'Software' },
  { name: 'DBM (Dealer Business Management)', category: 'Software' },
  { name: 'Tally ERP', category: 'Software' },
  { name: 'MS Excel', category: 'Software' },
  { name: 'CRM Software', category: 'Software' },
  { name: 'Vahan / Sarathi Portal', category: 'Software' },

  { name: 'Warranty Claim Processing', category: 'Process' },
  { name: 'Job Card Preparation', category: 'Process' },
  { name: 'Repair Order (RO) Management', category: 'Process' },
  { name: 'Estimation & Costing', category: 'Process' },
  { name: 'Insurance Claim Handling', category: 'Process' },
  { name: 'Spare Parts Inventory Control', category: 'Process' },
  { name: 'PDI (Pre-Delivery Inspection)', category: 'Process' },
  { name: '5S & Workshop Safety', category: 'Process' },
  { name: 'RTO Documentation', category: 'Process' },
  { name: 'CSI / SSI Improvement', category: 'Process' },

  { name: 'Test Drive Handling', category: 'Sales' },
  { name: 'Vehicle Appraisal / Valuation', category: 'Sales' },
  { name: 'Showroom Walk-in Conversion', category: 'Sales' },
  { name: 'Vehicle Finance & Loan Processing', category: 'Sales' },
  { name: 'Insurance Cross-Selling', category: 'Sales' },
  { name: 'Accessories Upselling', category: 'Sales' },
  { name: 'Service Upselling', category: 'Sales' },
  { name: 'Lead Follow-up & PSF Calls', category: 'Sales' },
  { name: 'Exchange & Buyback Handling', category: 'Sales' },

  { name: 'Customer Handling', category: 'Soft' },
  { name: 'Complaint Resolution', category: 'Soft' },
  { name: 'Team Management', category: 'Soft' },
  { name: 'Communication Skills', category: 'Soft' },
  { name: 'Target Orientation', category: 'Soft' },
  { name: 'Negotiation Skills', category: 'Soft' },
];

export const OEM_BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata Motors',
  'Mahindra',
  'Kia',
  'Toyota',
  'Honda Cars',
  'MG Motor',
  'Skoda',
  'Volkswagen',
  'Renault',
  'Nissan',
  'Jeep',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'TVS Motor',
  'Bajaj Auto',
  'Hero MotoCorp',
  'Royal Enfield',
  'Yamaha',
  'Suzuki Motorcycle',
  'Ather Energy',
  'Ola Electric',
  'Ashok Leyland',
  'Eicher Motors',
  'Force Motors',
  'BharatBenz',
] as const;

export const EMPLOYER_TYPES = [
  'Dealership',
  'Authorised Service Centre',
  'Multi-brand Workshop',
  'OEM',
  'Auto Component Manufacturer',
  'Fleet Operator',
  'Used Car Platform',
  'EV Startup',
] as const;

export const QUALIFICATIONS = [
  '10th Pass',
  '12th Pass',
  'ITI - Motor Mechanic Vehicle (MMV)',
  'ITI - Diesel Mechanic',
  'ITI - Auto Electrician',
  'ITI - Mechanic Two & Three Wheeler',
  'ITI - Painter / Welder',
  'Diploma in Automobile Engineering',
  'Diploma in Mechanical Engineering',
  'B.E./B.Tech - Mechanical',
  'B.E./B.Tech - Automobile',
  'B.E./B.Tech - Electrical',
  'Any Graduate',
  'MBA - Sales & Marketing',
  'OEM Certified Technician (L1-L4)',
  'Valid Driving Licence (LMV)',
  'Valid Driving Licence (MCWG)',
  'Valid Driving Licence (HMV)',
] as const;

export const AUTO_HUB_CITIES = [
  'Pune, Maharashtra',
  'Chakan, Maharashtra',
  'Aurangabad, Maharashtra',
  'Mumbai, Maharashtra',
  'Nashik, Maharashtra',
  'Chennai, Tamil Nadu',
  'Hosur, Tamil Nadu',
  'Coimbatore, Tamil Nadu',
  'Gurugram, Haryana',
  'Manesar, Haryana',
  'Faridabad, Haryana',
  'Delhi NCR',
  'Noida, Uttar Pradesh',
  'Sanand, Gujarat',
  'Ahmedabad, Gujarat',
  'Halol, Gujarat',
  'Bengaluru, Karnataka',
  'Dharwad, Karnataka',
  'Hyderabad, Telangana',
  'Jamshedpur, Jharkhand',
  'Pithampur, Madhya Pradesh',
  'Indore, Madhya Pradesh',
  'Rudrapur, Uttarakhand',
  'Pantnagar, Uttarakhand',
  'Jaipur, Rajasthan',
  'Lucknow, Uttar Pradesh',
  'Kolkata, West Bengal',
  'Kochi, Kerala',
  'Bhubaneswar, Odisha',
  'Chandigarh',
] as const;

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Apprenticeship', 'Internship'] as const;

export const WORK_MODES = ['On-site', 'Field', 'Hybrid'] as const;

export const EXPERIENCE_LEVELS = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'] as const;

/** Annual CTC in INR. Auto retail pays far below IT — these are the real bands. */
export const SALARY_BANDS: Record<string, [number, number]> = {
  'Sales Consultant': [180000, 360000],
  'Senior Sales Executive': [300000, 500000],
  'Showroom Manager': [700000, 1400000],
  'Team Leader - Sales': [420000, 720000],
  'Sales Trainee': [144000, 216000],
  'Delivery Executive': [180000, 300000],
  'Corporate Sales Executive': [300000, 550000],
  'Two-Wheeler Sales Executive': [156000, 300000],
  'Service Advisor': [240000, 450000],
  'Automobile Technician': [156000, 300000],
  'Diesel Mechanic': [180000, 340000],
  'Auto Electrician': [180000, 360000],
  'Diagnostic Technician': [240000, 480000],
  'Workshop Manager': [600000, 1100000],
  'Service Manager': [700000, 1300000],
  'Two-Wheeler Mechanic': [132000, 264000],
  'Wheel Alignment Technician': [156000, 288000],
  'Quality Control Inspector': [240000, 450000],
  'Floor Supervisor': [300000, 540000],
  'Warranty Executive': [240000, 420000],
  'Spare Parts Executive': [180000, 336000],
  'Parts Manager': [480000, 900000],
  'Parts Counter Sales Executive': [168000, 300000],
  Storekeeper: [156000, 288000],
  'Inventory Executive': [216000, 400000],
  'Accessories Sales Executive': [180000, 336000],
  'Body Shop Painter': [216000, 420000],
  Denter: [192000, 384000],
  'Body Shop Manager': [540000, 1000000],
  'Body Shop Advisor': [240000, 440000],
  'Insurance Surveyor Coordinator': [264000, 480000],
  'Polishing Technician': [156000, 288000],
  'EV Technician': [240000, 480000],
  'Battery Diagnostics Engineer': [400000, 800000],
  'Charging Infrastructure Technician': [240000, 460000],
  'EV Sales Consultant': [240000, 460000],
  'HV Safety Supervisor': [420000, 780000],
  'Finance Executive': [216000, 400000],
  'Insurance Advisor': [216000, 420000],
  'Loan Documentation Executive': [180000, 330000],
  'RTO Executive': [180000, 336000],
  'Finance Manager': [600000, 1100000],
  'Used Car Evaluator': [264000, 500000],
  'Pre-Owned Sales Consultant': [216000, 420000],
  'Refurbishment Supervisor': [300000, 560000],
  'Procurement Executive': [264000, 500000],
  'Pre-Owned Business Manager': [600000, 1200000],
  'Telecaller / CRE': [144000, 264000],
  'Customer Relations Manager': [420000, 780000],
  'Service CRE': [168000, 300000],
  'Call Centre Executive': [144000, 252000],
  'Customer Feedback Executive': [168000, 300000],
  'General Manager - Dealership': [1200000, 2400000],
  'Branch Manager': [700000, 1400000],
  'Profit Centre Head': [900000, 1800000],
  'Operations Manager': [700000, 1300000],
  'Area Sales Manager': [700000, 1400000],
  'Territory Service Manager': [650000, 1200000],
  'Dealer Principal': [1500000, 3000000],
  'Production Engineer': [350000, 750000],
  'Quality Engineer': [350000, 750000],
  'Design Engineer - Automotive': [500000, 1200000],
  'Maintenance Technician': [216000, 420000],
  'Supply Chain Executive': [300000, 650000],
  'Vehicle Testing Engineer': [450000, 950000],
  'Line Supervisor': [264000, 500000],
  'Fleet Supervisor': [300000, 560000],
  'Commercial Vehicle Driver': [180000, 330000],
  'Transport Coordinator': [240000, 440000],
  'Fleet Maintenance Executive': [264000, 500000],
  'Yard Incharge': [216000, 400000],
  'HR Executive - Dealership': [240000, 450000],
  'Accounts Executive': [216000, 420000],
  'Showroom Receptionist': [156000, 276000],
  'Admin Executive': [180000, 336000],
  'Marketing Executive - Auto': [264000, 500000],
};

export function formatINR(amount: number): string {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function salaryRangeLabel(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Not disclosed';
  if (min && max) return `${formatINR(min)} - ${formatINR(max)} PA`;
  return `${formatINR((min || max) as number)} PA`;
}

/* ------------------------------------------------------------------ *
 * Candidate registration taxonomy
 * ------------------------------------------------------------------ */

/**
 * Drives the conditional branches of the candidate wizard. `id` is persisted on
 * `Candidate.candidateType`, so these values are stable and must not be renamed.
 */
export const CANDIDATE_TYPES = [
  { id: 'FRESHER', label: 'Fresher', blurb: 'No full-time work experience yet' },
  {
    id: 'AUTOMOBILE',
    label: 'Automobile Experience',
    blurb: 'Worked at a dealership, workshop, OEM or EV company',
  },
  {
    id: 'NON_AUTOMOBILE',
    label: 'Non-Automobile Experience',
    blurb: 'Experienced, but from another industry',
  },
] as const;

export type CandidateTypeId = (typeof CANDIDATE_TYPES)[number]['id'];

/** Roles a candidate can express interest in. Superset of the hiring taxonomy. */
export const INTERESTED_ROLES = [
  'Sales Consultant',
  'Senior Sales Executive',
  'Showroom Manager',
  'Team Leader - Sales',
  'Corporate Sales Executive',
  'Two-Wheeler Sales Executive',
  'Delivery Executive',
  'Service Advisor',
  'Automobile Technician',
  'Diesel Mechanic',
  'Auto Electrician',
  'Diagnostic Technician',
  'Workshop Manager',
  'Service Manager',
  'Two-Wheeler Mechanic',
  'Spare Parts Executive',
  'Parts Manager',
  'Storekeeper',
  'Body Shop Painter',
  'Denter',
  'Body Shop Manager',
  'EV Technician',
  'Battery Diagnostics Engineer',
  'EV Sales Consultant',
  'Finance Executive',
  'Insurance Advisor',
  'RTO Executive',
  'Evaluator - Pre-Owned Cars',
  'CRE - Customer Relationship Executive',
  'Telecaller - Automobile',
  'General Manager - Dealership',
  'Branch Manager',
  'Production Engineer',
  'Quality Engineer',
  'Fleet Manager',
  'Driver - Commercial Vehicle',
  'HR Executive - Dealership',
  'Accounts Executive',
  'Marketing Executive - Auto',
] as const;

/** Experience bands shown to candidates. Stored verbatim on the profile. */
export const EXPERIENCE_BANDS = [
  'Less than 1 year',
  '1-2 years',
  '2-5 years',
  '5-8 years',
  '8-12 years',
  '12+ years',
] as const;

export const NOTICE_PERIODS = [
  'Immediate Joiner',
  '15 Days',
  '30 Days',
  '60 Days',
  '90 Days',
  'Serving Notice Period',
] as const;

/** Shown only on the Non-Automobile branch. */
export const INDUSTRIES = [
  'Information Technology',
  'Banking & Financial Services',
  'Insurance',
  'Retail & E-commerce',
  'Manufacturing (Non-Auto)',
  'Construction & Real Estate',
  'Healthcare & Pharma',
  'Education & Training',
  'Hospitality & Travel',
  'Telecom',
  'Logistics & Supply Chain',
  'FMCG',
  'Textiles & Apparel',
  'Media & Advertising',
  'Government / PSU',
  'Agriculture',
  'Other',
] as const;

export const LANGUAGES = [
  'Hindi',
  'English',
  'Marathi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Gujarati',
  'Bengali',
  'Punjabi',
  'Odia',
  'Assamese',
  'Urdu',
  'Konkani',
  'Bhojpuri',
  'Rajasthani',
] as const;

/** Graduation years offered on the Fresher branch, newest first. */
export const PASSING_YEARS: number[] = Array.from({ length: 16 }, (_, i) => 2027 - i);

export const RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const COMPANY_DOCUMENT_TYPES = [
  { id: 'GST_CERTIFICATE', label: 'GST Certificate' },
  { id: 'INCORPORATION', label: 'Certificate of Incorporation' },
  { id: 'PAN', label: 'Company PAN' },
  { id: 'ADDRESS_PROOF', label: 'Address Proof' },
  { id: 'OTHER', label: 'Other' },
] as const;

/**
 * GSTIN: 2-digit state code, 10-char PAN, entity digit, 'Z', checksum.
 * Validates shape only — authoritative verification needs the GSTN API.
 */
export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
