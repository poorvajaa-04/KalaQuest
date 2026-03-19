import Link from "next/link";
import { Bot, Music, Palette, PenSquare, Puzzle } from "lucide-react";

import { PageIntro, PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const labLinks = [
  {
    href: "/music",
    title: "Sounds of Heritage",
    description: "Listen to cultural soundscapes and ambient heritage audio.",
    icon: Music,
  },
  {
    href: "/puzzle",
    title: "Jigsaw Puzzle",
    description: "Assemble a handcrafted artwork puzzle from shuffled pieces.",
    icon: Puzzle,
  },
  {
    href: "/crossword",
    title: "Heritage Crossword",
    description: "Solve clue-based word puzzles built around familiar cultural prompts.",
    icon: PenSquare,
  },
  {
    href: "/coloring",
    title: "Coloring Book",
    description: "Fill interactive mandala and pattern artwork using the existing palette.",
    icon: Palette,
  },
  {
    href: "/chatbot",
    title: "AI Chatbot",
    description: "Use the built-in chatbot and memory tools already available in the app.",
    icon: Bot,
  },
];

export default function CraftLabPage() {
  return (
    <PageShell className="max-w-5xl">
      <PageIntro
        title="Craft Lab"
        description="Jump into the interactive play and experimentation pages already present in KalaQuest."
      />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {labLinks.map((item) => {
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
