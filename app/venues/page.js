'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VenuesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/ceremony-services?category=venues');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <p>Loading function halls and venues...</p>
    </div>
  );
}
