import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ArtisanRoleSync } from "@/components/auth/artisan-role-sync";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ArtisanAccountPage() {
  return (
    <AuthGuard>
      <ArtisanRoleSync />
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex justify-center">
          <Card className="w-full max-w-md parchment">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Artisan Account</CardTitle>
              <CardDescription>Your workspace to manage your artisan profile and activity.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5">
              <p className="text-center text-sm text-foreground/80">
                Manage your crafts, track orders, and set up payouts.
              </p>
              <div className="flex w-full flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/artisan-account/upload">Upload & Sell Crafts</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/artisan-account/payouts">Receive Payments</Link>
                </Button>
              </div>
              <div className="text-center">
                <UserNav />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mx-auto mt-8 max-w-3xl">
          <Card className="parchment">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Sell Your Products</CardTitle>
              <CardDescription>
                Create listings, manage pricing, and keep your crafts visible to buyers.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/70 bg-background/80 p-4">
                <p className="text-sm font-semibold">List New Craft</p>
                <p className="mt-2 text-xs text-foreground/70">
                  Add photos, stories, and pricing to publish a new listing.
                </p>
                <Button asChild variant="link" className="mt-3 px-0 text-accent">
                  <Link href="/artisan-account/upload">Start Listing</Link>
                </Button>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/80 p-4">
                <p className="text-sm font-semibold">Manage Inventory</p>
                <p className="mt-2 text-xs text-foreground/70">
                  Update stock counts and adjust prices for seasonal demand.
                </p>
                <Button asChild variant="link" className="mt-3 px-0 text-accent">
                  <Link href="/artisan-account/upload">Update Inventory</Link>
                </Button>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/80 p-4">
                <p className="text-sm font-semibold">Track Earnings</p>
                <p className="mt-2 text-xs text-foreground/70">
                  Connect your payout method and receive weekly settlements.
                </p>
                <Button asChild variant="link" className="mt-3 px-0 text-accent">
                  <Link href="/artisan-account/payouts">Set Up Payouts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
