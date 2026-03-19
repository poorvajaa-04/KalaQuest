import Link from "next/link";
import { Compass, ScrollText } from "lucide-react";

import { PageIntro, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const questLinks = [
  {
    href: "/mystery-stories",
    title: "Mystery Stories",
    description: "Follow state-based craft stories and choose your path as a young artisan.",
    icon: ScrollText,
  },
  {
    href: "/adventure",
    title: "Pottery Adventure",
    description: "Step through the pottery studio experience from clay to finished artifact.",
    icon: Compass,
  },
];

export default function QuestsPage() {
  return (
    <PageShell className="max-w-4xl">
      <PageIntro
        title="Quests"
        description="Continue into the existing guided quest experiences already built in KalaQuest."
      />
        <div className="grid gap-6 md:grid-cols-2">
          {questLinks.map((item) => {
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
                    <Link href={item.href}>Open Quest</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
    </PageShell>
  );
}
