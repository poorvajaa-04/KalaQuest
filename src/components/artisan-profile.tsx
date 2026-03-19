"use client";

import type { Product } from "@/lib/data";
import { useArtisanProfileDraft } from "@/hooks/use-artisan-profile-draft";
import { PageShell } from "@/components/page-shell";
import { ArtisanHeader } from "@/components/artisan-profile/artisan-header";
import { ArtisanStory } from "@/components/artisan-profile/artisan-story";
import { ChatModal } from "@/components/artisan-profile/chat-modal";
import { CraftProcessSection } from "@/components/artisan-profile/craft-process-section";
import { GallerySection } from "@/components/artisan-profile/gallery-section";
import { ProductsSection } from "@/components/artisan-profile/products-section";
import { ReviewsSection } from "@/components/artisan-profile/reviews-section";
import type { ArtisanRecord } from "@/types/artisan";

type ArtisanProfileProps = {
  artisan?: ArtisanRecord | null;
  products?: Product[];
  isLoading?: boolean;
};

export function ArtisanProfile({
  artisan,
  products = [],
  isLoading = false,
}: ArtisanProfileProps) {
  const { artisanProfile } = useArtisanProfileDraft(artisan);
  const activeArtisan = artisanProfile ?? artisan ?? null;

  return (
    <PageShell className="max-w-[92rem]">
      <div className="space-y-10 md:space-y-12 lg:space-y-14">
        <ArtisanHeader
          artisan={activeArtisan}
          isLoading={isLoading}
          productsAnchorId={activeArtisan ? `products-${activeArtisan.id}` : undefined}
          chatTrigger={
            <ChatModal
              artisan={activeArtisan}
              isLoading={isLoading}
              inlineTriggerLabel="Chat with Artisan"
              showFloatingButton
            />
          }
        />

        <ArtisanStory storyLong={activeArtisan?.storyLong} isLoading={isLoading} />

        <CraftProcessSection
          craftProcess={activeArtisan?.craftProcess}
          isLoading={isLoading}
        />

        <GallerySection
          artisanName={activeArtisan?.name}
          craftType={activeArtisan?.craftType}
          galleryImages={activeArtisan?.galleryImages}
          isLoading={isLoading}
        />

        <ProductsSection
          artisanId={activeArtisan?.id}
          artisanName={activeArtisan?.name}
          products={products}
          isLoading={isLoading}
        />

        <ReviewsSection reviews={activeArtisan?.reviews} isLoading={isLoading} />
      </div>
    </PageShell>
  );
}
