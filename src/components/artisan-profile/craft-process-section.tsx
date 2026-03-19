import { Circle, Flame, Hammer, Palette, Sparkles, Wrench, type LucideIcon } from "lucide-react";

import type { ArtisanProcessStep } from "@/types/artisan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PROCESS_ICONS: Record<string, LucideIcon> = {
  hammer: Hammer,
  circle: Circle,
  palette: Palette,
  flame: Flame,
  sparkles: Sparkles,
  wrench: Wrench,
};

type CraftProcessSectionProps = {
  craftProcess?: ArtisanProcessStep[];
  isLoading?: boolean;
};

function ProcessStepCard({ step, index }: { step: ArtisanProcessStep; index: number }) {
  const normalizedIconName = (step.icon ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const Icon = PROCESS_ICONS[normalizedIconName] ?? Wrench;

  return (
    <li className="flex gap-4 rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
          Step {index + 1}
        </p>
        <p className="text-base font-medium leading-7 text-foreground/90">{step.step}</p>
      </div>
    </li>
  );
}

export function CraftProcessSection({
  craftProcess = [],
  isLoading = false,
}: CraftProcessSectionProps) {
  if (isLoading) {
    return (
      <Card className="parchment">
        <CardHeader>
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`craft-process-skeleton-${index}`}
                className="flex gap-4 rounded-xl border border-border/70 bg-background/80 p-5 shadow-sm"
              >
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[82%]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="parchment">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Craft Process</CardTitle>
        <CardDescription>How this tradition comes to life, one step at a time.</CardDescription>
      </CardHeader>
      <CardContent>
        {craftProcess.length > 0 ? (
          <ol className="space-y-4">
            {craftProcess.map((step, index) => (
              <ProcessStepCard key={`${index}-${step.step}`} step={step} index={index} />
            ))}
          </ol>
        ) : (
          <p className="text-base text-muted-foreground">
            Craft process details are not available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
