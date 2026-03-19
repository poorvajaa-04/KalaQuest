'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  mergeArtisanProfileDraft,
  loadArtisanProfileDraft,
  saveArtisanProfileDraft,
  type ArtisanProfileDraft,
} from '@/lib/artisan-profile-draft';
import type { ArtisanRecord } from '@/types/artisan';

export function useArtisanProfileDraft(artisan?: ArtisanRecord | null) {
  const [draft, setDraft] = useState<ArtisanProfileDraft | null>(null);

  useEffect(() => {
    if (!artisan?.id) {
      setDraft(null);
      return;
    }

    setDraft(loadArtisanProfileDraft(artisan.id));
  }, [artisan?.id]);

  const artisanProfile = useMemo(() => {
    if (!artisan) {
      return null;
    }

    return mergeArtisanProfileDraft(artisan, draft);
  }, [artisan, draft]);

  const saveDraft = (nextDraft: ArtisanProfileDraft) => {
    if (!artisan?.id) {
      return;
    }

    saveArtisanProfileDraft(artisan.id, nextDraft);
    setDraft(nextDraft);
  };

  return {
    artisanProfile,
    draft,
    saveDraft,
  };
}
