'use client';

import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';

type LoginRole = 'user' | 'artisan';

const normalizeRole = (value: unknown): LoginRole => {
  const cleaned = String(value ?? '').trim().toLowerCase();
  return cleaned === 'artisan' || cleaned === 'artisian' ? 'artisan' : 'user';
};

export default function DashboardRedirectPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const run = async () => {
      const userSnap = await getDoc(doc(firestore, 'users', user.uid));
      let normalizedRole = normalizeRole(userSnap.exists() ? userSnap.data()?.role : 'user');

      if (normalizedRole !== 'artisan') {
        const artisanSnap = await getDoc(doc(firestore, 'artisans', user.uid));
        if (artisanSnap.exists()) {
          normalizedRole = 'artisan';
        }
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('loginRole', normalizedRole);
        window.dispatchEvent(new Event('loginRoleChanged'));
      }
      router.replace(normalizedRole === 'artisan' ? '/artisan-dashboard' : '/');
    };

    void run();
  }, [firestore, isLoading, router, user]);

  return null;
}
