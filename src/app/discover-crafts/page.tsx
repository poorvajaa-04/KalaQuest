import Link from "next/link";
import { ScrollText } from "lucide-react";

import { PageIntro, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mysteryStories } from "@/lib/data";

export default function DiscoverCraftsPage() {
  return (
    <PageShell className="max-w-6xl">
      <PageIntro
        title="Discover Crafts"
        description="Browse KalaQuest's mystery stories and open the full interactive story for each art form."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mysteryStories.map((story) => (
          <Card key={story.href} className="parchment flex flex-col">
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <ScrollText className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-center font-headline text-2xl">{story.title}</CardTitle>
              <p className="text-center text-sm font-medium text-primary">{story.stateName}</p>
              <CardDescription className="text-center">{story.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex justify-center">
              <Button asChild>
                <Link href={story.href}>Read More</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
