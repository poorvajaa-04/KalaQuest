import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

type PageIntroProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("container mx-auto px-4 py-8 md:px-6 md:py-12", className)}>
      {children}
    </div>
  );
}

export function PageIntro({
  title,
  description,
  align = "center",
  className,
}: PageIntroProps) {
  const isCentered = align === "center";

  return (
    <div className={cn("mb-12", isCentered ? "text-center" : "text-left", className)}>
      <h1 className="text-4xl md:text-5xl font-headline tracking-wide">{title}</h1>
      {description ? (
        <p
          className={cn(
            "mt-4 text-lg text-foreground/80",
            isCentered ? "mx-auto max-w-2xl" : "max-w-2xl"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
