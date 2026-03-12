'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ArtisanRoleSync } from "@/components/auth/artisan-role-sync";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useUser } from "@/firebase/auth/use-user";

export default function ArtisanUploadPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isLoading } = useUser();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    story: "",
    materials: "",
    imageNames: [] as string[],
  });

  const isReady = useMemo(() => !isLoading && !!user?.uid, [isLoading, user?.uid]);

  const updateField = (key: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const names = files.map((file) => file.name);
    setFormState((prev) => ({ ...prev, imageNames: names }));
  };

  const validateBase = () => {
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You must be logged in to save a listing.",
      });
      return false;
    }
    if (!formState.name.trim()) {
      toast({
        variant: "destructive",
        title: "Missing craft name",
        description: "Please enter a craft name.",
      });
      return false;
    }
    return true;
  };

  const createListing = async (status: "draft" | "published") => {
    const priceValue = formState.price ? Number(formState.price) : null;
    const stockValue = formState.stock ? Number(formState.stock) : null;

    await addDoc(collection(firestore, "craft_listings"), {
      ownerId: user?.uid,
      status,
      name: formState.name.trim(),
      category: formState.category.trim(),
      price: priceValue,
      stock: stockValue,
      story: formState.story.trim(),
      materials: formState.materials.trim(),
      imageNames: formState.imageNames,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handlePublish = async () => {
    if (!validateBase()) return;
    setIsPublishing(true);
    try {
      await createListing("published");
      toast({
        title: "Listing published",
        description: "Your craft is now publicly listed.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Publish failed",
        description: error?.message || "Unable to publish the listing.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!validateBase()) return;
    setIsSavingDraft(true);
    try {
      await createListing("draft");
      toast({
        title: "Draft saved",
        description: "You can publish this listing later.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error?.message || "Unable to save the draft.",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <AuthGuard>
      <ArtisanRoleSync />
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-4xl md:text-5xl">Upload & Sell Crafts</h1>
          <p className="mt-3 text-base text-foreground/80">
            Share your craft story, set your price, and publish new listings.
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="parchment">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Craft Listing</CardTitle>
              <CardDescription>Fill out the details to publish your craft.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="craft-name">Craft Name</Label>
                  <Input
                    id="craft-name"
                    placeholder="e.g., Handwoven Silk Dupatta"
                    value={formState.name}
                    onChange={updateField("name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="craft-category">Category</Label>
                  <Input
                    id="craft-category"
                    placeholder="Textiles, Pottery, Jewelry, Woodwork"
                    value={formState.category}
                    onChange={updateField("category")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="craft-price">Price (INR)</Label>
                    <Input
                      id="craft-price"
                      type="number"
                      min="0"
                      placeholder="2499"
                      value={formState.price}
                      onChange={updateField("price")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="craft-stock">Available Stock</Label>
                    <Input
                      id="craft-stock"
                      type="number"
                      min="0"
                      placeholder="10"
                      value={formState.stock}
                      onChange={updateField("stock")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="craft-story">Craft Story</Label>
                  <Textarea
                    id="craft-story"
                    rows={4}
                    placeholder="Describe the tradition, techniques, and inspiration behind this craft."
                    value={formState.story}
                    onChange={updateField("story")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="craft-materials">Materials & Care</Label>
                  <Textarea
                    id="craft-materials"
                    rows={3}
                    placeholder="Natural dyes, hand-spun cotton. Hand wash only."
                    value={formState.materials}
                    onChange={updateField("materials")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="craft-images">Upload Photos</Label>
                  <Input id="craft-images" type="file" multiple onChange={handleImageChange} />
                  <p className="text-xs text-foreground/60">
                    Add 3-5 clear photos: front, back, detail close-up, and scale view.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={handlePublish}
                    disabled={!isReady || isPublishing}
                  >
                    {isPublishing ? "Publishing..." : "Publish Listing"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleSaveDraft}
                    disabled={!isReady || isSavingDraft}
                  >
                    {isSavingDraft ? "Saving..." : "Save Draft"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Listing Tips</CardTitle>
              <CardDescription>Improve visibility and trust.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/80">
              <p>Use natural light photos with a clean background.</p>
              <p>Share the cultural story and time invested in the craft.</p>
              <p>Set delivery timelines you can comfortably meet.</p>
              <Button asChild variant="link" className="px-0 text-accent">
                <Link href="/artisan-account">Back to Artisan Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
