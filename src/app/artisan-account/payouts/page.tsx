'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ArtisanRoleSync } from "@/components/auth/artisan-role-sync";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useUser } from "@/firebase/auth/use-user";

export default function ArtisanPayoutsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyingLater, setIsVerifyingLater] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    method: "",
    phone: "",
    upi: "",
    bank: "",
    account: "",
    ifsc: "",
    tax: "",
  });

  const isReady = useMemo(() => !isLoading && !!user?.uid, [isLoading, user?.uid]);

  const updateField = (key: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You must be logged in to save payout details.",
      });
      return;
    }

    if (!formState.name.trim() || !formState.email.trim()) {
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Account holder name and email are required.",
      });
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(
        doc(firestore, "users", user.uid, "payouts", "default"),
        {
          userId: user.uid,
          name: formState.name.trim(),
          email: formState.email.trim(),
          method: formState.method.trim(),
          phone: formState.phone.trim(),
          upi: formState.upi.trim(),
          bank: formState.bank.trim(),
          account: formState.account.trim(),
          ifsc: formState.ifsc.trim(),
          tax: formState.tax.trim(),
          status: "submitted",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: "Payout details saved",
        description: "Your payout information has been saved successfully.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error?.message || "Unable to save payout details.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyLater = async () => {
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You must be logged in to update verification status.",
      });
      return;
    }

    setIsVerifyingLater(true);
    try {
      await setDoc(
        doc(firestore, "users", user.uid, "payouts", "default"),
        {
          userId: user.uid,
          status: "pending_verification",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: "Verification pending",
        description: "You can complete verification later from this page.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error?.message || "Unable to update verification status.",
      });
    } finally {
      setIsVerifyingLater(false);
    }
  };

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
                    <Input
                      id="payout-name"
                      placeholder="Your full name"
                      value={formState.name}
                      onChange={updateField("name")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout-email">Email for Payout Alerts</Label>
                    <Input
                      id="payout-email"
                      type="email"
                      placeholder="you@example.com"
                      value={formState.email}
                      onChange={updateField("email")}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payout-method">Preferred Method</Label>
                    <Input
                      id="payout-method"
                      placeholder="UPI, Bank Transfer, PayPal"
                      value={formState.method}
                      onChange={updateField("method")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout-phone">Phone Number</Label>
                    <Input
                      id="payout-phone"
                      placeholder="+91 98765 43210"
                      value={formState.phone}
                      onChange={updateField("phone")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout-upi">UPI ID or Wallet Address</Label>
                  <Input
                    id="payout-upi"
                    placeholder="name@upi"
                    value={formState.upi}
                    onChange={updateField("upi")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payout-bank">Bank Name</Label>
                    <Input
                      id="payout-bank"
                      placeholder="State Bank of India"
                      value={formState.bank}
                      onChange={updateField("bank")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout-account">Account Number</Label>
                    <Input
                      id="payout-account"
                      placeholder="000123456789"
                      value={formState.account}
                      onChange={updateField("account")}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payout-ifsc">IFSC / Routing Code</Label>
                    <Input
                      id="payout-ifsc"
                      placeholder="SBIN0000001"
                      value={formState.ifsc}
                      onChange={updateField("ifsc")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payout-tax">Tax ID (Optional)</Label>
                    <Input
                      id="payout-tax"
                      placeholder="PAN / GSTIN"
                      value={formState.tax}
                      onChange={updateField("tax")}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={handleSave}
                    disabled={!isReady || isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Payout Details"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleVerifyLater}
                    disabled={!isReady || isVerifyingLater}
                  >
                    {isVerifyingLater ? "Updating..." : "Verify Later"}
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
