"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/data';
import { placeholderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Check, ShoppingCart } from 'lucide-react';
import { ProductReviewPanel } from '@/components/product-review-panel';
import { useUser } from '@/firebase/auth/use-user';
import { artisans } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const productImage = placeholderImages.find((p) => p.imageUrl === product.image);
  const { addToCart, removeFromCart, cart } = useCart();
  const { user } = useUser();
  const isInCart = cart.some((item) => item.product.id === product.id);
  const { toast } = useToast();
  const router = useRouter();
  const artisan = artisans.find((item) => item.id === product.artisanId);

  const handleMessage = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'Log in to message an artisan.',
      });
      return;
    }
    if (!artisan?.userId && !artisan?.email) {
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
      <div className="relative aspect-video w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          data-ai-hint={productImage?.imageHint || 'handicraft'}
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl h-14">{product.name}</CardTitle>
        <CardDescription className="text-lg font-semibold text-primary">
          Rs {product.price.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-foreground/80 line-clamp-2">{product.description}</p>
        <ProductReviewPanel productId={product.id} productName={product.name} />
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col gap-2">
          <Button
            className={`w-full transition-all ${isInCart ? 'bg-primary text-primary-foreground ring-2 ring-primary/40 hover:bg-primary/90' : ''}`}
            variant={isInCart ? 'default' : 'secondary'}
            onClick={() => (isInCart ? removeFromCart(product.id) : addToCart(product))}
            disabled={!user}
          >
            {isInCart ? <Check className="mr-2 h-4 w-4" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            {!user ? 'Login to Add' : isInCart ? 'Added to Cart' : 'Add to Cart'}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleMessage}>
            Message Artisan
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
