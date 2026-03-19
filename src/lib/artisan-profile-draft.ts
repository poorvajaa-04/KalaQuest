import { z } from 'zod';

import type { Artisan, ArtisanProcessStep, ArtisanRecord } from '@/types/artisan';

const STORAGE_KEY_PREFIX = 'kalaquest:artisan-profile-draft:';

const processStepSchema = z.object({
  step: z.string().trim().min(1, 'Step is required'),
  icon: z.string().trim().min(1).default('sparkles'),
});

const artisanProfileDraftSchema = z.object({
  name: z.string().trim().min(1),
  location: z.string().trim().min(1),
  craftType: z.string().trim().min(1),
  experienceYears: z.number().int().min(0),
  storyLong: z.string().trim().min(1),
  craftProcess: z.array(processStepSchema).default([]),
  galleryImages: z.array(z.string().trim().min(1)).default([]),
});

export type ArtisanProfileDraft = Pick<
  Artisan,
  'name' | 'location' | 'craftType' | 'experienceYears' | 'storyLong' | 'craftProcess' | 'galleryImages'
>;

function getStorageKey(artisanId: string) {
  return `${STORAGE_KEY_PREFIX}${artisanId}`;
}

function normalizeCraftProcess(craftProcess: ArtisanProcessStep[]) {
  return craftProcess.map((step) => ({
    step: step.step.trim(),
    icon: step.icon?.trim() || 'sparkles',
  }));
}

export function createArtisanProfileDraft(artisan: ArtisanRecord): ArtisanProfileDraft {
  return {
    name: artisan.name,
    location: artisan.location,
    craftType: artisan.craftType,
    experienceYears: artisan.experienceYears,
    storyLong: artisan.storyLong,
    craftProcess: normalizeCraftProcess(artisan.craftProcess),
    galleryImages: [...artisan.galleryImages],
  };
}

export function parseArtisanProfileDraft(value: unknown): ArtisanProfileDraft | null {
  const result = artisanProfileDraftSchema.safeParse(value);
  if (!result.success) {
    return null;
  }

  return {
    ...result.data,
    craftProcess: normalizeCraftProcess(result.data.craftProcess),
  };
}

export function loadArtisanProfileDraft(artisanId: string): ArtisanProfileDraft | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(artisanId));
    if (!rawValue) {
      return null;
    }

    return parseArtisanProfileDraft(JSON.parse(rawValue));
  } catch (error) {
    console.warn('Unable to load artisan profile draft:', error);
    return null;
  }
}

export function saveArtisanProfileDraft(artisanId: string, draft: ArtisanProfileDraft) {
  if (typeof window === 'undefined') {
    return;
  }

  const parsedDraft = parseArtisanProfileDraft(draft);
  if (!parsedDraft) {
    throw new Error('Attempted to save an invalid artisan profile draft.');
  }

  window.localStorage.setItem(getStorageKey(artisanId), JSON.stringify(parsedDraft));
}

export function mergeArtisanProfileDraft(
  artisan: ArtisanRecord,
  draft?: ArtisanProfileDraft | null
): ArtisanRecord {
  if (!draft) {
    return artisan;
  }

  return {
    ...artisan,
    ...draft,
    craftProcess: normalizeCraftProcess(draft.craftProcess),
    galleryImages: [...draft.galleryImages],
  };
}
