"use client";

import { Award, BadgeCheck, Sprout } from "lucide-react";

import type { ArtisanVerificationStatus } from "@/types/artisan";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ArtisanVerificationBadgeProps = {
  status: ArtisanVerificationStatus;
  className?: string;
};

const STATUS_CONFIG: Record<
  ArtisanVerificationStatus,
  {
    label: string;
    tooltip: string;
    className: string;
    Icon: typeof BadgeCheck;
  }
> = {
  verified: {
    label: "Verified",
    tooltip: "Identity and craft verified by KalaQuest",
    className: "border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100",
    Icon: BadgeCheck,
  },
  master: {
    label: "Master",
    tooltip: "Highly experienced artisan with exceptional craftsmanship",
    className: "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-100",
    Icon: Award,
  },
  emerging: {
    label: "Emerging",
    tooltip: "New artisan with promising skills",
    className: "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Icon: Sprout,
  },
};

export function ArtisanVerificationBadge({ status, className }: ArtisanVerificationBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.Icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn("gap-1 rounded-full px-3 py-1 shadow-sm", config.className, className)}
          >
            <Icon className="h-4 w-4" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
