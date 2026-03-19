"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ArtisanStoryProps = {
  storyLong?: string;
  isLoading?: boolean;
};

export function ArtisanStory({ storyLong, isLoading = false }: ArtisanStoryProps) {
  const [showFullStory, setShowFullStory] = useState(false);

  const safeStory = storyLong?.trim() || "";
  const hasLongStory = safeStory.length > 320;
  const storyPreview = useMemo(() => safeStory.slice(0, 320).trimEnd(), [safeStory]);
  const visibleStory = showFullStory || !hasLongStory ? safeStory : `${storyPreview}...`;

  if (isLoading) {
    return (
      <Card className="parchment">
        <CardHeader>
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[96%]" />
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-9 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="parchment">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Biography</CardTitle>
        <CardDescription>The story behind the artisan and their practice.</CardDescription>
      </CardHeader>
      <CardContent>
        {safeStory ? (
          <>
            <p className="text-base leading-8 text-foreground/85">{visibleStory}</p>
            {hasLongStory ? (
              <Button
                type="button"
                variant="link"
                className="mt-3 px-0 text-accent"
                onClick={() => setShowFullStory((value) => !value)}
              >
                {showFullStory ? "Read Less" : "Read More"}
              </Button>
            ) : null}
          </>
        ) : (
          <p className="text-base text-muted-foreground">No artisan story is available yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
