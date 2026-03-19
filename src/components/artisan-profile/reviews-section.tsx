import { Star } from "lucide-react";

import type { ArtisanReview } from "@/types/artisan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ReviewsSectionProps = {
  reviews?: ArtisanReview[];
  isLoading?: boolean;
};

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rating;
        return (
          <Star
            key={`${rating}-${index}`}
            className={`h-4 w-4 ${filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
          />
        );
      })}
    </div>
  );
}

export function ReviewsSection({ reviews = [], isLoading = false }: ReviewsSectionProps) {
  if (isLoading) {
    return (
      <Card className="parchment">
        <CardHeader>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={`reviews-skeleton-${index}`} className="border-border/80 bg-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[85%]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="parchment">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Reviews</CardTitle>
        <CardDescription>What visitors and buyers say about this artisan&apos;s work.</CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review, index) => (
              <Card
                key={`${review.reviewerName}-${review.date}-${index}`}
                className="border-border/80 bg-card transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-base font-semibold">{review.reviewerName}</CardTitle>
                    {renderStars(review.rating)}
                  </div>
                  <CardDescription>{new Date(review.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/85">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/80 bg-background/80">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No reviews yet for this artisan.
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
