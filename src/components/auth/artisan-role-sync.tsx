'use client';

import { useEffect } from 'react';

export function ArtisanRoleSync() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('loginRole', 'artisan');
    window.dispatchEvent(new Event('loginRoleChanged'));
  }, []);

  return null;
}
