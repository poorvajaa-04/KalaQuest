import Link from "next/link";
import { Compass, Palette, ShoppingBag } from "lucide-react";

import { PageIntro, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const discoverLinks = [
  {
    href: "/mystery-stories",
    title: "Mystery Stories & Art Forms",
    description: "Explore crafts through state-based stories and interactive learning paths.",
    icon: Compass,
  },
  {
    href: "/artisans",
    title: "Meet the Artisans",
    description: "Browse the makers behind the crafts and follow their collections.",
    icon: Palette,
  },
  {
    href: "/marketplace",
    title: "Browse the Marketplace",
    description: "See the currently available craft listings and featured products.",
    icon: ShoppingBag,
  },
];

export default function DiscoverCraftsPage() {
  return (
    <PageShell className="max-w-5xl">
      <PageIntro
        title="Discover Crafts"
        description="Start with the existing discovery experiences already available across KalaQuest."
      />
        <div className="grid gap-6 md:grid-cols-3">
          {discoverLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.href} className="parchment flex flex-col">
                <CardHeader>
                  <div className="mb-4 flex justify-center">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl text-center">{item.title}</CardTitle>
                  <CardDescription className="text-center">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex justify-center">
                  <Button asChild>
                    <Link href={item.href}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
    </PageShell>
  );
}
