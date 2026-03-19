'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Circle, Flame, Hammer, Palette, Sparkles, Trash2, Upload, Wrench } from 'lucide-react';

import {
  createArtisanProfileDraft,
  type ArtisanProfileDraft,
} from '@/lib/artisan-profile-draft';
import type { ArtisanProcessStep, ArtisanRecord } from '@/types/artisan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const iconOptions = [
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'hammer', label: 'Hammer', icon: Hammer },
  { value: 'circle', label: 'Circle', icon: Circle },
  { value: 'flame', label: 'Flame', icon: Flame },
  { value: 'palette', label: 'Palette', icon: Palette },
  { value: 'wrench', label: 'Wrench', icon: Wrench },
] as const;

const craftProcessStepSchema = z.object({
  step: z.string().trim().min(1, 'Please describe the step.'),
  icon: z.string().trim().min(1, 'Choose an icon.'),
});

const formSchema = z.object({
  name: z.string().trim().min(2, 'Please enter the artisan name.'),
  location: z.string().trim().min(2, 'Please enter a location.'),
  craftType: z.string().trim().min(2, 'Please enter a craft type.'),
  experienceYears: z.coerce.number().int().min(0, 'Experience cannot be negative.'),
  storyLong: z.string().trim().min(40, 'Please add a fuller artisan story.'),
  craftProcess: z.array(craftProcessStepSchema).min(1, 'Add at least one craft step.'),
  galleryImages: z.array(z.string().trim().min(1)).default([]),
});

type EditArtisanProfileFormValues = z.infer<typeof formSchema>;

type EditArtisanProfileFormProps = {
  artisan: ArtisanRecord;
  onSave: (draft: ArtisanProfileDraft) => void;
  isLoading?: boolean;
};

function makeDefaultStep(step?: ArtisanProcessStep) {
  return {
    step: step?.step ?? '',
    icon: step?.icon ?? 'sparkles',
  };
}

function toFormValues(artisan: ArtisanRecord): EditArtisanProfileFormValues {
  const draft = createArtisanProfileDraft(artisan);
  return {
    ...draft,
    craftProcess: draft.craftProcess.length
      ? draft.craftProcess.map((step) => makeDefaultStep(step))
      : [makeDefaultStep()],
    galleryImages: [...draft.galleryImages],
  };
}

function EditArtisanProfileFormSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-slate-200 bg-[#fcfaf7] shadow-none">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </CardContent>
      </Card>
      <Card className="border-slate-200 bg-[#fcfaf7] shadow-none">
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}

export function EditArtisanProfileForm({
  artisan,
  onSave,
  isLoading = false,
}: EditArtisanProfileFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditArtisanProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(artisan),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'craftProcess',
  });

  const galleryImages = form.watch('galleryImages');
  const craftProcess = form.watch('craftProcess');
  const watchedName = form.watch('name');
  const watchedLocation = form.watch('location');
  const watchedCraftType = form.watch('craftType');
  const watchedStoryLong = form.watch('storyLong');

  useEffect(() => {
    form.reset(toFormValues(artisan));
  }, [artisan, form]);

  const profileHealth = useMemo(() => {
    const completedSections = [
      Boolean(watchedName.trim()),
      Boolean(watchedLocation.trim()),
      Boolean(watchedCraftType.trim()),
      Boolean(watchedStoryLong.trim()),
      galleryImages.length > 0,
      craftProcess.some((step) => step.step.trim()),
    ].filter(Boolean).length;

    return Math.round((completedSections / 6) * 100);
  }, [craftProcess, galleryImages.length, watchedCraftType, watchedLocation, watchedName, watchedStoryLong]);

  const handleAddStep = () => {
    append(makeDefaultStep());
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = galleryImages.filter((_, imageIndex) => imageIndex !== index);
    form.setValue('galleryImages', nextImages, { shouldDirty: true, shouldValidate: true });
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    try {
      const nextImages = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result ?? ''));
              reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
              reader.readAsDataURL(file);
            })
        )
      );

      form.setValue('galleryImages', [...galleryImages, ...nextImages], {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Image upload failed',
        description: 'KalaQuest could not preview one of the selected images.',
      });
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const onSubmit = async (values: EditArtisanProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const draft: ArtisanProfileDraft = {
        ...values,
        craftProcess: values.craftProcess.map((step) => ({
          step: step.step.trim(),
          icon: step.icon.trim() || 'sparkles',
        })),
        galleryImages: values.galleryImages,
      };

      onSave(draft);
      toast({
        title: 'Profile updated',
        description: 'Your artisan profile was saved locally for this mock experience.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Unable to save profile',
        description: 'Please try again in a moment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <EditArtisanProfileFormSkeleton />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-slate-200 bg-[#fcfaf7] shadow-none">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Profile Editor</CardTitle>
          <CardDescription className="text-slate-500">
            Update the public details that shape how buyers discover your work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Artisan name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City, State" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="craftType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Craft Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Pottery, weaving, painting..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Years</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          inputMode="numeric"
                          placeholder="0"
                          value={field.value ?? 0}
                          onChange={(event) => field.onChange(event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="storyLong"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={7}
                        placeholder="Share the artisan story, inspiration, and heritage behind the craft."
                      />
                    </FormControl>
                    <FormDescription>
                      This longer story appears on the public artisan profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Craft Process</h3>
                    <p className="text-sm text-slate-500">
                      Add each step visitors should understand about your craft workflow.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={handleAddStep}>
                    Add Step
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-2xl border border-slate-200 bg-[#fcfaf7] p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]"
                    >
                      <FormField
                        control={form.control}
                        name={`craftProcess.${index}.step`}
                        render={({ field: stepField }) => (
                          <FormItem>
                            <FormLabel>Step {index + 1}</FormLabel>
                            <FormControl>
                              <Input {...stepField} placeholder="Describe this stage of the craft process" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`craftProcess.${index}.icon`}
                        render={({ field: iconField }) => (
                          <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <Select value={iconField.value} onValueChange={iconField.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose icon" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {iconOptions.map((option) => {
                                  const Icon = option.icon;
                                  return (
                                    <SelectItem key={option.value} value={option.value}>
                                      <span className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {option.label}
                                      </span>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="w-full md:w-auto"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {typeof form.formState.errors.craftProcess?.message === 'string' ? (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.craftProcess.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Profile Images</h3>
                    <p className="text-sm text-slate-500">
                      Upload reference images and preview them before saving.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {galleryImages.map((image, index) => (
                      <div
                        key={`${image.slice(0, 24)}-${index}`}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-[#fcfaf7]"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={image}
                            alt={`Gallery preview ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 240px"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
                          <span className="text-xs font-medium text-slate-500">Image {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-[#fcfaf7] p-6 text-center text-sm text-slate-500">
                    No images added yet. Upload a few craft or profile photos to enrich the artisan page.
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving profile...' : 'Save Profile Updates'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-slate-200 bg-[#fcfaf7] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Profile Snapshot</CardTitle>
            <CardDescription className="text-slate-500">
              A quick quality check while you refine your public presence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Profile completeness
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{profileHealth}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    profileHealth >= 80 ? 'bg-emerald-500' : profileHealth >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                  )}
                  style={{ width: `${profileHealth}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Craft Steps</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{craftProcess.length}</p>
                <p className="mt-2 text-sm text-slate-500">Dynamic steps can be added or removed as needed.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Gallery Images</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{galleryImages.length}</p>
                <p className="mt-2 text-sm text-slate-500">Uploaded images preview here before they are saved.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-[#fcfaf7] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Mock Save Behavior</CardTitle>
            <CardDescription className="text-slate-500">
              This form is ready for future backend wiring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Updates are saved locally in this browser for now, so you can validate the profile editing flow
              without affecting the shared seed data.
            </p>
            <p>
              The public artisan profile in KalaQuest reuses these saved values, which makes the mock experience feel
              closer to a real end-to-end profile editor.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
