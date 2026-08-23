'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PriestsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/ceremony-services?category=priests');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <p>Loading verified priests...</p>
    </div>
  );
}
