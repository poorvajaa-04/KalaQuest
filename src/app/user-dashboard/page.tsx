'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserDashboardPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card className="parchment">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">User Dashboard</CardTitle>
              <CardDescription>Manage your account and explore artisan crafts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80">
                Welcome back! Browse the marketplace, manage your profile, and track your orders.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/account">My Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Quick Links</CardTitle>
              <CardDescription>Jump back into your journey.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/artisans">Discover Artisans</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/plan-visit">Plan a Visit</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/inbox">Open Inbox</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
