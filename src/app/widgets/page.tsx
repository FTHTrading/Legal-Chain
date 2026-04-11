'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WidgetsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/rescue');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--midnight)' }}>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Redirecting to Rescue Apps...</p>
    </div>
  );
}
