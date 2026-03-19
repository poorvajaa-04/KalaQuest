'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Eye,
  LayoutDashboard,
  Package,
  PencilLine,
  Star,
} from 'lucide-react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { ArtisanRoleSync } from '@/components/auth/artisan-role-sync';
import { EditArtisanProfileForm } from '@/components/artisan-dashboard/edit-artisan-profile-form';
import { ArtisanVerificationBadge } from '@/components/artisan-verification-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/firebase/auth/use-user';
import { useArtisanProfileDraft } from '@/hooks/use-artisan-profile-draft';
import type { ArtisanProfileDraft } from '@/lib/artisan-profile-draft';
import { artisans, products } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { ArtisanRecord } from '@/types/artisan';

type SectionId = 'overview' | 'edit-profile' | 'manage-products' | 'reviews';

const dashboardSections: Array<{
  id: SectionId;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: 'overview',
    label: 'Profile Overview',
    shortLabel: 'Overview',
    description: 'Track your core artisan performance at a glance.',
    icon: LayoutDashboard,
  },
  {
    id: 'edit-profile',
    label: 'Edit Profile',
    shortLabel: 'Profile',
    description: 'Review your public artisan profile and important details.',
    icon: PencilLine,
  },
  {
    id: 'manage-products',
    label: 'Manage Products',
    shortLabel: 'Products',
    description: 'Organize listings, stock, and pricing-related actions.',
    icon: Package,
  },
  {
    id: 'reviews',
    label: 'Reviews Received',
    shortLabel: 'Reviews',
    description: 'See what visitors and buyers are saying about your work.',
    icon: Star,
  },
];

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rating;
        return (
          <Star
            key={`${rating}-${index}`}
            className={cn(
              'h-4 w-4',
              filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            )}
          />
        );
      })}
    </div>
  );
}

function SectionShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white/90 shadow-sm">
      <CardHeader className="border-b border-slate-200/80">
        <CardTitle className="font-headline text-2xl text-slate-900">{title}</CardTitle>
        <CardDescription className="text-slate-500">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

function DashboardStatCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="border-dashed border-slate-200 bg-white/80 shadow-none">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-900">{title}</p>
          <p className="max-w-md text-sm text-slate-500">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function OverviewSection({
  artisan,
  artisanProducts,
  averageRating,
  reviewCount,
}: {
  artisan: ArtisanRecord | null;
  artisanProducts: typeof products;
  averageRating: number;
  reviewCount: number;
}) {
  const overviewStats = [
    {
      title: 'Products',
      value: `${artisanProducts.length}`,
      detail: artisanProducts.length > 0 ? 'Active listings in marketplace' : 'No active listings yet',
    },
    {
      title: 'Reviews',
      value: `${reviewCount}`,
      detail: reviewCount > 0 ? 'Community feedback received' : 'No reviews yet',
    },
    {
      title: 'Rating',
      value: reviewCount > 0 ? averageRating.toFixed(1) : '--',
      detail: reviewCount > 0 ? 'Average artisan rating' : 'Rating appears once reviews arrive',
    },
  ];

  return (
    <SectionShell
      title="Profile Overview"
      description="A quick snapshot of your artisan presence, social proof, and activity."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {overviewStats.map((stat) => (
          <DashboardStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            detail={stat.detail}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200 bg-[#fcfaf7] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Current Public Snapshot</CardTitle>
            <CardDescription className="text-slate-500">
              How your profile appears across KalaQuest right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xl font-semibold text-slate-900">
                {artisan?.name || 'Artisan profile not linked yet'}
              </p>
              {artisan?.verificationStatus ? (
                <ArtisanVerificationBadge status={artisan.verificationStatus} />
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Craft Type
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {artisan?.craftType || 'Not available'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Location
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {artisan?.location || 'Not available'}
                </p>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              {artisan?.storyLong
                ? `${artisan.storyLong.slice(0, 220).trimEnd()}${artisan.storyLong.length > 220 ? '...' : ''}`
                : 'Connect this account to an artisan profile to show your story, process, and gallery.'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-[#fcfaf7] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Quick Actions</CardTitle>
            <CardDescription className="text-slate-500">
              Jump into your most common dashboard tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-between">
              <Link href="/artisan-account/upload">
                Add New Product
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={artisan ? `/artisans/${artisan.id}` : '/artisans'}>
                View Public Profile
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/inbox">
                Open Inbox
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function EditProfileSection({
  artisan,
  saveDraft,
}: {
  artisan: ArtisanRecord | null;
  saveDraft: (draft: ArtisanProfileDraft) => void;
}) {
  if (!artisan) {
    return (
      <SectionShell
        title="Edit Profile"
        description="Keep your public artisan identity polished and up to date."
      >
        <EmptyState
          title="No linked artisan profile yet"
          description="This account is not currently connected to a public artisan profile. Once linked, you'll be able to review and refine your story, craft details, and profile quality from here."
          actionHref="/artisans"
          actionLabel="Browse Artisan Profiles"
        />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title="Edit Profile"
      description="Update your public artisan details with responsive editing tools and local mock persistence."
    >
      <EditArtisanProfileForm artisan={artisan} onSave={saveDraft} />
    </SectionShell>
  );
}

function ManageProductsSection({
  artisan,
  artisanProducts,
}: {
  artisan: ArtisanRecord | null;
  artisanProducts: typeof products;
}) {
  return (
    <SectionShell
      title="Manage Products"
      description="See your active marketplace items and jump into listing management."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {artisanProducts.length > 0
              ? `${artisanProducts.length} products currently linked to ${artisan?.name || 'your profile'}.`
              : 'No products are linked to this artisan profile yet.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/artisan-account/upload">Add Product</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/marketplace">View Marketplace</Link>
          </Button>
        </div>
      </div>

      {artisanProducts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {artisanProducts.map((product) => (
            <Card key={product.id} className="border-slate-200 bg-white shadow-none">
              <div className="h-44 overflow-hidden rounded-t-xl bg-slate-100">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="space-y-4 p-5">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                  <p className="line-clamp-3 text-sm text-slate-500">{product.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-900">
                    {product.price.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Active
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <Link href="/artisan-account/upload">Manage</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/marketplace">Preview</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No products yet"
          description="Start listing your craft pieces to showcase them in the marketplace and begin collecting buyer interest."
          actionHref="/artisan-account/upload"
          actionLabel="Create Listing"
        />
      )}
    </SectionShell>
  );
}

function ReviewsSection({
  artisan,
  averageRating,
}: {
  artisan: ArtisanRecord | null;
  averageRating: number;
}) {
  const reviews = artisan?.reviews ?? [];

  return (
    <SectionShell
      title="Reviews Received"
      description="Understand how visitors and buyers are responding to your work."
    >
      {reviews.length > 0 ? (
        <>
          <Card className="mb-6 border-slate-200 bg-[#fcfaf7] shadow-none">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Overall rating</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{averageRating.toFixed(1)}</p>
              </div>
              <div className="space-y-2">
                {renderStars(Math.round(averageRating))}
                <p className="text-sm text-slate-500">
                  Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {reviews.map((review, index) => (
              <Card key={`${review.reviewerName}-${review.date}-${index}`} className="border-slate-200 bg-white shadow-none">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base text-slate-900">{review.reviewerName}</CardTitle>
                      <CardDescription className="mt-1 text-slate-500">
                        {new Date(review.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-slate-600">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No reviews received yet"
          description="Once visitors and buyers leave feedback, you'll be able to review sentiment and rating trends here."
          actionHref={artisan ? `/artisans/${artisan.id}` : '/artisans'}
          actionLabel="View Public Profile"
        />
      )}
    </SectionShell>
  );
}

export default function ArtisanDashboardPage() {
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  const baseArtisan = useMemo(() => {
    if (!user) {
      return null;
    }

    return artisans.find((item) => item.userId === user.uid || item.email === user.email) ?? null;
  }, [user]);
  const { artisanProfile: artisan, saveDraft } = useArtisanProfileDraft(baseArtisan);

  const artisanProducts = useMemo(
    () => (artisan ? products.filter((product) => product.artisanId === artisan.id) : []),
    [artisan]
  );

  const averageRating = useMemo(() => {
    const reviews = artisan?.reviews ?? [];
    if (!reviews.length) {
      return 0;
    }

    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [artisan]);

  const reviewCount = artisan?.reviews.length ?? 0;
  const name = artisan?.name || user?.displayName || user?.email?.split('@')[0] || 'Artisan';

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'edit-profile':
        return <EditProfileSection artisan={artisan} saveDraft={saveDraft} />;
      case 'manage-products':
        return <ManageProductsSection artisan={artisan} artisanProducts={artisanProducts} />;
      case 'reviews':
        return <ReviewsSection artisan={artisan} averageRating={averageRating} />;
      case 'overview':
      default:
        return (
          <OverviewSection
            artisan={artisan}
            artisanProducts={artisanProducts}
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
        );
    }
  };

  return (
    <AuthGuard>
      <ArtisanRoleSync />
      <div className="min-h-screen bg-[#f8f4ee] text-slate-900">
        <div className="container mx-auto max-w-[92rem] px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
          <header className="mb-8 rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-sm md:p-8 lg:mb-10 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">KalaQuest Artisan Studio</p>
                <div className="space-y-2">
                  <h1 className="font-headline text-3xl text-slate-900 md:text-5xl">
                    Welcome back, {name}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600">
                    Manage your artisan presence with a cleaner workspace for profile quality, products, and community feedback.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild className="w-full sm:min-w-[180px]">
                  <Link href="/artisan-account/upload">Add Product</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:min-w-[180px]">
                  <Link href="/inbox">Open Inbox</Link>
                </Button>
              </div>
            </div>
          </header>

          <div className="lg:hidden">
            <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as SectionId)}>
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-white/85 p-2 shadow-sm">
                {dashboardSections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="min-h-[44px] rounded-xl text-xs font-semibold uppercase tracking-[0.16em]"
                  >
                    {section.shortLabel}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <Card className="border-slate-200 bg-white/85 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl text-slate-900">Dashboard</CardTitle>
                    <CardDescription className="text-slate-500">
                      Navigate between your core artisan workspace sections.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dashboardSections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;

                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => setActiveSection(section.id)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all',
                            isActive
                              ? 'border-amber-200 bg-amber-50 text-slate-900 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                              isActive ? 'bg-white text-amber-700' : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="space-y-1">
                            <span className="block text-sm font-semibold">{section.label}</span>
                            <span className="block text-xs leading-5 text-slate-500">{section.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </aside>

            <div>{renderActiveSection()}</div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
