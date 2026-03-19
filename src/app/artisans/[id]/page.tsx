import Link from "next/link";

import { ArtisanProfile } from "@/components/artisan-profile";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { artisans, products } from "@/lib/data";

type ArtisanProfilePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return artisans.map((artisan) => ({ id: artisan.id }));
}

export default async function ArtisanProfilePage({ params }: ArtisanProfilePageProps) {
  const { id } = await params;
  const artisan = artisans.find((item) => item.id === id);

  if (!artisan) {
    return (
      <PageShell className="max-w-4xl">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="parchment w-full max-w-xl">
            <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
              <div className="space-y-3">
                <h1 className="font-headline text-4xl tracking-wide">Artisan not found</h1>
                <p className="text-base text-foreground/80">
                  The artisan profile you&apos;re looking for could not be found.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/artisans">Back to Artisans</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  const artisanProducts = products.filter((product) => product.artisanId === artisan.id);

  return <ArtisanProfile artisan={artisan} products={artisanProducts} />;
}
