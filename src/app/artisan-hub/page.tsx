import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ArtisanRoleSync } from "@/components/auth/artisan-role-sync";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageIntro, PageShell } from "@/components/page-shell";

export default function ArtisanHubPage() {
  return (
    <AuthGuard>
      <ArtisanRoleSync />
      <PageShell>
        <PageIntro
          title="Artisan Hub"
          description="Your starting point for selling crafts and managing payouts."
        />
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          <Card className="parchment">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Sell Products</CardTitle>
              <CardDescription>Create and manage your craft listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/artisan-account/upload">Start Selling</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="parchment">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Receive Payments</CardTitle>
              <CardDescription>Set up your payout details securely.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/artisan-account/payouts">Set Up Payouts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
