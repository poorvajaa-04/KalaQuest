import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ArtisanRoleSync } from "@/components/auth/artisan-role-sync";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ArtisanPayoutsPage() {
  return (
    <AuthGuard>
      <ArtisanRoleSync />
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-4xl md:text-5xl">Receive Payments</h1>
          <p className="mt-3 text-base text-foreground/80">
            Add payout details to receive earnings from your craft sales.
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="parchment">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Payout Details</CardTitle>
              <CardDescription>Choose how you want to receive payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payout-name">Account Holder Name</Label>
                    <Input id="payout-name" placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout-email">Email for Payout Alerts</Label>
                    <Input id="payout-email" type="email" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payout-method">Preferred Method</Label>
                    <Input id="payout-method" placeholder="UPI, Bank Transfer, PayPal" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout-phone">Phone Number</Label>
                    <Input id="payout-phone" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout-upi">UPI ID or Wallet Address</Label>
                  <Input id="payout-upi" placeholder="name@upi" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payout-bank">Bank Name</Label>
                    <Input id="payout-bank" placeholder="State Bank of India" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout-account">Account Number</Label>
                    <Input id="payout-account" placeholder="000123456789" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payout-ifsc">IFSC / Routing Code</Label>
                    <Input id="payout-ifsc" placeholder="SBIN0000001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout-tax">Tax ID (Optional)</Label>
                    <Input id="payout-tax" placeholder="PAN / GSTIN" />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" className="w-full sm:w-auto">
                    Save Payout Details
                  </Button>
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Verify Later
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Payout Schedule</CardTitle>
              <CardDescription>Know when funds arrive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/80">
              <p>Standard payouts are processed every Friday.</p>
              <p>Allow 1-3 business days for bank transfer completion.</p>
              <p>Verified accounts receive priority settlement.</p>
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
