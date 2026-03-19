"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type GallerySectionProps = {
  artisanName?: string;
  craftType?: string;
  galleryImages?: string[];
  isLoading?: boolean;
};

export function GallerySection({
  artisanName = "Artisan",
  craftType = "craft",
  galleryImages = [],
  isLoading = false,
}: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedImage = selectedIndex !== null ? galleryImages[selectedIndex] ?? null : null;
  const selectedGalleryIndex = selectedIndex ?? 0;
  const hasMultipleImages = galleryImages.length > 1;

  useEffect(() => {
    setSelectedIndex(null);
  }, [galleryImages]);

  useEffect(() => {
    if (selectedIndex === null || galleryImages.length <= 1) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) => {
          if (current === null) {
            return 0;
          }
          return (current + 1) % galleryImages.length;
        });
      }

      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) => {
          if (current === null) {
            return 0;
          }
          return (current - 1 + galleryImages.length) % galleryImages.length;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryImages.length, selectedIndex]);

  const selectedAlt = useMemo(
    () => `${artisanName} ${craftType} gallery image ${selectedGalleryIndex + 1}`,
    [artisanName, craftType, selectedGalleryIndex]
  );

  const showPreviousImage = () => {
    if (!galleryImages.length) {
      return;
    }

    setSelectedIndex((current) => {
      if (current === null) {
        return 0;
      }
      return (current - 1 + galleryImages.length) % galleryImages.length;
    });
  };

  const showNextImage = () => {
    if (!galleryImages.length) {
      return;
    }

    setSelectedIndex((current) => {
      if (current === null) {
        return 0;
      }
      return (current + 1) % galleryImages.length;
    });
  };

  if (isLoading) {
    return (
      <Card className="parchment">
        <CardHeader>
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`gallery-skeleton-${index}`}
                className="overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm"
              >
                <Skeleton className="aspect-[4/3] rounded-none" />
                <div className="p-3">
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="parchment">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Image Gallery</CardTitle>
        <CardDescription>A closer look at the studio, process, and finished work.</CardDescription>
      </CardHeader>
      <CardContent className="p-5 md:p-6 lg:p-8">
        {galleryImages.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
              {galleryImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className="group overflow-hidden rounded-xl border border-border/70 bg-background text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={image}
                      alt={`${artisanName} ${craftType} gallery image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="flex items-center gap-2 p-3 text-sm text-foreground/75 transition-colors duration-300 group-hover:text-foreground">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Click to enlarge
                  </div>
                </button>
              ))}
            </div>

            <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
              <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden border-border/70 bg-background/95 p-0 backdrop-blur-sm sm:max-w-3xl lg:max-w-5xl">
                <DialogHeader className="sr-only">
                  <DialogTitle>
                    {artisanName} {craftType} gallery image {selectedGalleryIndex + 1}
                  </DialogTitle>
                </DialogHeader>
                {selectedImage ? (
                  <div className="relative">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted sm:aspect-[16/10]">
                      <Image
                        src={selectedImage}
                        alt={selectedAlt}
                        fill
                        className="object-contain transition-all duration-300 ease-out"
                      />
                    </div>

                    {hasMultipleImages ? (
                      <>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 shadow-md backdrop-blur-sm sm:left-4 sm:h-11 sm:w-11"
                          onClick={showPreviousImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                          <span className="sr-only">Previous image</span>
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 shadow-md backdrop-blur-sm sm:right-4 sm:h-11 sm:w-11"
                          onClick={showNextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                          <span className="sr-only">Next image</span>
                        </Button>
                      </>
                    ) : null}

                    <div className="flex items-center justify-between gap-4 border-t border-border/70 bg-background/95 px-4 py-3 text-sm text-foreground/80 sm:px-5">
                      <p className="min-w-0 truncate">
                        {artisanName} {craftType}
                      </p>
                      <p className="shrink-0">
                        {selectedGalleryIndex + 1} / {galleryImages.length}
                      </p>
                    </div>
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <p className="text-base text-muted-foreground">
            No gallery images are available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
