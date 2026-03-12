'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Artisan } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';

type ArtisanCardProps = {
  artisan: Artisan;
};

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const handleMessage = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'Log in to message an artisan.',
      });
      return;
    }
    if (!artisan.userId && !artisan.email) {
      toast({
        variant: 'destructive',
        title: 'Messaging unavailable',
        description: 'This artisan is not yet linked to a messaging account.',
      });
      return;
    }
    const name = encodeURIComponent(artisan.name);
    if (artisan.userId) {
      router.push(`/inbox?recipient=${artisan.userId}&name=${name}`);
      return;
    }
    if (artisan.email) {
      const email = encodeURIComponent(artisan.email);
      router.push(`/inbox?recipientEmail=${email}&name=${name}`);
      return;
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden parchment transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
      <div className="relative aspect-square w-full">
        <Image
          src={artisan.image}
          alt={`Portrait of ${artisan.name}`}
          fill
          className="object-cover"
          data-ai-hint="indian artisan"
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{artisan.name}</CardTitle>
        <CardDescription className="text-primary font-semibold">{artisan.craft}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/80 line-clamp-3">{artisan.bio}</p>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between gap-3">
          <Button asChild variant="link" className="p-0 h-auto text-accent hover:text-accent/80">
            <Link href={`/marketplace?artisanId=${artisan.id}`}>
              View Crafts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleMessage}>
            Message Artisan
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
