"use client";

import Link from "next/link";
import { Palette, Menu, ShoppingCart, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Cart } from "@/components/cart";
import { useUser } from "@/firebase/auth/use-user";
import { UserNav } from "./auth/user-nav";
import { Skeleton } from "./ui/skeleton";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/plan-visit", label: "Plan a Visit" },
  { href: "/mystery-stories", label: "Mystery Stories & Art Forms" },
  { href: "/artisans", label: "Artisans" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/opportunities", label: "Opportunities" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, isLoading } = useUser();
  const [isArtisan, setIsArtisan] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncRole = () => {
      const role = window.localStorage.getItem("loginRole");
      setIsArtisan(role === "artisan");
    };

    syncRole();
    window.addEventListener("storage", syncRole);
    window.addEventListener("loginRoleChanged", syncRole);
    return () => {
      window.removeEventListener("storage", syncRole);
      window.removeEventListener("loginRoleChanged", syncRole);
    };
  }, [user]);

  const visibleNavItems = user && isArtisan
    ? [
        ...navItems,
        { href: "/artisan-dashboard", label: "Artisan Dashboard" },
        { href: "/artisan-account/upload", label: "Sell Products" },
      ]
    : navItems;

  const renderAuthButton = () => {
    if (isLoading) {
      return <Skeleton className="h-10 w-24" />;
    }

    if (user) {
      return <UserNav />;
    }

    return (
      <Button asChild>
        <Link href="/login">
          <User className="mr-2 h-4 w-4" />
          Login
        </Link>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-semibold tracking-wide">Kala Quest</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-6 md:flex">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-foreground/60"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Open Cart</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <Cart />
            </SheetContent>
          </Sheet>

          {renderAuthButton()}

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="p-4">
                  <Link href="/" className="mb-8 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <Palette className="h-6 w-6 text-primary" />
                    <span className="font-headline text-xl font-semibold tracking-wide">Kala Quest</span>
                  </Link>
                  <nav className="flex flex-col gap-6">
                    {visibleNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "text-lg font-medium transition-colors hover:text-primary",
                          pathname === item.href ? "text-primary" : "text-foreground/80"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
