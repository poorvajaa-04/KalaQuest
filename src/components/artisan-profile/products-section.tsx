import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ProductsSectionProps = {
  artisanId?: string;
  artisanName?: string;
  products?: Product[];
  isLoading?: boolean;
};

export function ProductsSection({
  artisanId,
  artisanName = "this artisan",
  products = [],
  isLoading = false,
}: ProductsSectionProps) {
  if (isLoading) {
    return (
      <section id={artisanId ? `products-${artisanId}` : undefined} className="space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto h-10 w-72 max-w-full" />
          <Skeleton className="mx-auto mt-4 h-4 w-[32rem] max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`products-skeleton-${index}`} className="parchment overflow-hidden">
              <Skeleton className="aspect-video rounded-none" />
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[88%]" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={artisanId ? `products-${artisanId}` : undefined} className="space-y-6">
      <div className="text-center">
        <h2 className="font-headline text-4xl tracking-wide">Products by {artisanName}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
          Available craft pieces currently linked to this artisan in the marketplace.
        </p>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card className="parchment">
          <CardContent className="py-8 text-center text-foreground/75">
            No products are linked to this artisan yet.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
