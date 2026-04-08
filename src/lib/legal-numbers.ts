export interface LegalNumber {
  id: string;
  vanity: string;
  numeric: string;
  label: string;
  category: 'ai-line' | 'live-demo' | 'law-routing';
  isPrimary: boolean;
  isLiveDemo: boolean;
  routeTarget: string;
  market: string;
  active: boolean;
}

export const LEGAL_NUMBERS: LegalNumber[] = [
  {
    id: 'ai-line-844',
    vanity: '844-NEED',
    numeric: '+1 (844) 669-6333',
    label: 'AI LINE',
    category: 'ai-line',
    isPrimary: true,
    isLiveDemo: false,
    routeTarget: '/rapid-intake',
    market: 'national',
    active: true,
  },
  {
    id: 'live-demo-888',
    vanity: 'LIVE AI',
    numeric: '+1 (888) 855-0209',
    label: 'LIVE AI',
    category: 'live-demo',
    isPrimary: false,
    isLiveDemo: true,
    routeTarget: '/rapid-intake',
    market: 'national',
    active: true,
  },
  {
    id: 'law-888',
    vanity: '888-LAW',
    numeric: '+1 (888) 505-2924',
    label: '888-LAW',
    category: 'law-routing',
    isPrimary: false,
    isLiveDemo: false,
    routeTarget: '/rapid-intake',
    market: 'national',
    active: true,
  },
  {
    id: 'law-833',
    vanity: '833-LAW',
    numeric: '+1 (833) 445-2924',
    label: '833-LAW',
    category: 'law-routing',
    isPrimary: false,
    isLiveDemo: false,
    routeTarget: '/rapid-intake',
    market: 'national',
    active: true,
  },
  {
    id: 'law-888-974',
    vanity: '888-974-LAW',
    numeric: '+1 (888) 974-0529',
    label: '888-974-LAW',
    category: 'law-routing',
    isPrimary: false,
    isLiveDemo: false,
    routeTarget: '/crypto-recovery',
    market: 'crypto',
    active: true,
  },
  {
    id: 'law-888-763',
    vanity: '888-763-LAW',
    numeric: '+1 (888) 763-1529',
    label: '888-763-LAW',
    category: 'law-routing',
    isPrimary: false,
    isLiveDemo: false,
    routeTarget: '/demand-letter',
    market: 'civil',
    active: true,
  },
  {
    id: 'law-888-old',
    vanity: '888-OLD-LAW',
    numeric: '+1 (888) 653-2529',
    label: '888-OLD-LAW',
    category: 'law-routing',
    isPrimary: false,
    isLiveDemo: false,
    routeTarget: '/client-status',
    market: 'legacy',
    active: true,
  },
  {
    id: 'law-888-649',
    vanity: '888-649-LAW',
    numeric: '+1 (888) 649-0529',
    label: '888-649-LAW',
    category: 'law-routing',
    isPrimary: false,
    isLiveDemo: false,
    routeTarget: '/evidence-timeline',
    market: 'evidence',
    active: true,
  },
  {
    id: 'law-888-643',
    vanity: '888-643-LAW',
    numeric: '+1 (888) 643-0529',
    label: '888-643-LAW',
    category: 'law-routing',
    isPrimary: false,
    isLiveDemo: false,
    routeTarget: '/client-status',
    market: 'general',
    active: true,
  },
];

export const AI_LINE = LEGAL_NUMBERS.find(n => n.id === 'ai-line-844')!;
export const LIVE_DEMO_LINE = LEGAL_NUMBERS.find(n => n.id === 'live-demo-888')!;

export function getLawNumbers(ids: string[]): LegalNumber[] {
  return LEGAL_NUMBERS.filter(n => ids.includes(n.id));
}

export function telLink(numeric: string): string {
  return `tel:${numeric.replace(/[^+\d]/g, '')}`;
}
