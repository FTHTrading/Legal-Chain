export interface MockMatter {
  id: string;
  title: string;
  status: 'active' | 'pending-review' | 'awaiting-response' | 'resolved';
  progress: number;
  steps: { label: string; done: boolean }[];
  updates: { date: string; text: string }[];
  nextAction: string;
}

export const MOCK_MATTER: MockMatter = {
  id: 'MTR-2026-0041',
  title: 'Securities Fraud Defense — State v. Morrison',
  status: 'active',
  progress: 65,
  steps: [
    { label: 'Intake Complete', done: true },
    { label: 'Evidence Gathered', done: true },
    { label: 'Motion Filed', done: true },
    { label: 'Discovery Phase', done: false },
    { label: 'Hearing Scheduled', done: false },
    { label: 'Resolution', done: false },
  ],
  updates: [
    { date: '2026-04-06', text: 'Motion to suppress filed with clerk. Awaiting judge assignment.' },
    { date: '2026-04-03', text: 'All digital evidence catalogued. Chain of custody verified.' },
    { date: '2026-03-28', text: 'Initial intake completed. Case accepted for review.' },
  ],
  nextAction: 'Review and approve discovery request documents',
};

export interface MockTimelineEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  notes: string;
  category: 'communication' | 'document' | 'transaction' | 'incident' | 'testimony';
  isKeyEvidence: boolean;
  fileName?: string;
}

export const MOCK_TIMELINE: MockTimelineEvent[] = [
  {
    id: 'evt-1',
    date: '2026-03-15',
    time: '09:30',
    title: 'Initial Email from Broker',
    notes: 'Received unsolicited offer from secondary broker. Screenshot captured.',
    category: 'communication',
    isKeyEvidence: true,
  },
  {
    id: 'evt-2',
    date: '2026-03-18',
    time: '14:15',
    title: 'Wire Transfer Initiated',
    notes: '$245,000 wire sent to designated account per broker instructions.',
    category: 'transaction',
    isKeyEvidence: true,
    fileName: 'wire-confirmation-031826.pdf',
  },
  {
    id: 'evt-3',
    date: '2026-03-22',
    time: '10:00',
    title: 'Account Access Revoked',
    notes: 'Login credentials stopped working. Unable to access portfolio.',
    category: 'incident',
    isKeyEvidence: true,
  },
  {
    id: 'evt-4',
    date: '2026-03-25',
    time: '16:45',
    title: 'Complaint Filed with SEC',
    notes: 'Formal complaint filed. Reference number SEC-2026-18742.',
    category: 'document',
    isKeyEvidence: false,
    fileName: 'sec-complaint-032526.pdf',
  },
];

export const CHAIN_OPTIONS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'bitcoin', label: 'Bitcoin' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'solana', label: 'Solana' },
  { value: 'xrpl', label: 'XRP Ledger' },
  { value: 'stellar', label: 'Stellar' },
  { value: 'other', label: 'Other' },
] as const;

export const CASE_TYPES = [
  { value: 'false-accusation', label: 'False Accusation' },
  { value: 'urgent-legal-review', label: 'Urgent Legal Review' },
  { value: 'criminal-defense', label: 'Criminal Defense' },
  { value: 'civil-dispute', label: 'Civil Dispute' },
  { value: 'other', label: 'Other' },
] as const;

export const URGENCY_LEVELS = [
  { value: 'standard', label: 'Standard', color: 'text-blue-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-amber-400' },
  { value: 'emergency', label: 'Emergency', color: 'text-red-400' },
] as const;

export const ISSUE_TYPES = [
  { value: 'unpaid-invoice', label: 'Unpaid Invoice' },
  { value: 'breach-of-contract', label: 'Breach of Contract' },
  { value: 'payment-dispute', label: 'Payment Dispute' },
  { value: 'property-damage', label: 'Property Damage' },
  { value: 'other', label: 'Other' },
] as const;

export const EVENT_CATEGORIES = [
  { value: 'communication', label: 'Communication', color: '#60a5fa' },
  { value: 'document', label: 'Document', color: '#a78bfa' },
  { value: 'transaction', label: 'Transaction', color: '#34d399' },
  { value: 'incident', label: 'Incident', color: '#f87171' },
  { value: 'testimony', label: 'Testimony', color: '#fbbf24' },
] as const;
