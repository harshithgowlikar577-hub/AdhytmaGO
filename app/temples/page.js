'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TemplesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/ceremony-services?category=temples');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <p>Loading sacred temples...</p>
    </div>
  );
}
