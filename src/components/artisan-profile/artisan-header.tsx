"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MapPin, Sparkles } from "lucide-react";

import type { ArtisanRecord } from "@/types/artisan";
import { ArtisanVerificationBadge } from "@/components/artisan-verification-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ArtisanHeaderProps = {
  artisan?: ArtisanRecord | null;
  chatTrigger?: ReactNode;
  isLoading?: boolean;
  productsAnchorId?: string;
};

function getProfileSummary(storyLong?: string) {
  if (!storyLong) {
    return "The artisan story will appear here once profile details are available.";
  }

  const firstSentence = storyLong.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  if (firstSentence) {
    return firstSentence;
  }

  return storyLong.length > 180 ? `${storyLong.slice(0, 180).trimEnd()}...` : storyLong;
}

export function ArtisanHeader({
  artisan,
  chatTrigger,
  isLoading = false,
  productsAnchorId,
}: ArtisanHeaderProps) {
  if (isLoading) {
    return (
      <Card className="parchment overflow-hidden">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)] lg:items-stretch">
          <Skeleton className="min-h-[280px] rounded-none md:min-h-[340px] lg:min-h-[420px]" />
          <div className="space-y-5 p-5 sm:p-6 md:p-8 lg:p-10">
            <div className="space-y-3">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[75%]" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-36" />
              {chatTrigger ?? <Skeleton className="h-10 w-40" />}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const name = artisan?.name ?? "Unknown Artisan";
  const craftType = artisan?.craftType ?? "Craft details unavailable";
  const location = artisan?.location ?? "Location unavailable";
  const experienceLabel =
    artisan?.experienceYears != null ? `${artisan.experienceYears} years` : "Experience unavailable";
  const coverImage = artisan?.galleryImages[0] || `https://picsum.photos/seed/${artisan?.id || "artisan"}/900/900`;
  const summary = getProfileSummary(artisan?.storyLong);

  return (
    <Card className="parchment overflow-hidden">
      <div className="grid gap-6 md:gap-8 lg:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)] lg:items-stretch">
        <div className="relative min-h-[280px] bg-muted md:min-h-[340px] lg:min-h-[420px]">
          <Image
            src={coverImage}
            alt={`Portrait of ${name}`}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col justify-center p-5 sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-4xl tracking-wide md:text-5xl lg:text-[3.5rem]">{name}</h1>
            {artisan?.verificationStatus ? (
              <ArtisanVerificationBadge status={artisan.verificationStatus} />
            ) : null}
          </div>
          <p className="mt-3 text-lg font-semibold text-primary lg:text-xl">{craftType}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:mt-6">
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </p>
              <p className="mt-2 font-medium">{location}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Experience
              </p>
              <p className="mt-2 font-medium">{experienceLabel}</p>
            </div>
          </div>
          <p className="mt-5 text-base leading-8 text-foreground/80 lg:mt-6">{summary}</p>
          <div className="mt-5 flex flex-wrap gap-3 lg:mt-6">
            {productsAnchorId ? (
              <Button asChild>
                <Link href={`#${productsAnchorId}`}>View Products</Link>
              </Button>
            ) : (
              <Button type="button" disabled>
                View Products
              </Button>
            )}
            {chatTrigger}
          </div>
        </div>
      </div>
    </Card>
  );
}
