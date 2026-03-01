'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { ArtisanRoleSync } from '@/components/auth/artisan-role-sync';
import { useUser } from '@/firebase/auth/use-user';
import { jobOpportunities, products } from '@/lib/data';
import { cn } from '@/lib/utils';

const stats = [
  {
    title: 'Total Crafts',
    value: '4',
    detail: '2 active, 1 draft, 1 sold',
  },
  {
    title: 'Total Revenue',
    value: '\u20B924,350',
    detail: '+12% this month',
  },
  {
    title: 'Profile Views',
    value: '1,247',
    detail: 'Last 30 days',
  },
  {
    title: 'Avg Rating',
    value: '4.8',
    detail: '40 reviews',
  },
];

const orders = [
  {
    product: 'Azure Floral Vase',
    orderId: 'ORD-001',
    customer: 'Anita M.',
    price: '\u20B9850',
    status: 'Shipped',
  },
  {
    product: 'Carved Elephant Figure',
    orderId: 'ORD-002',
    customer: 'Ravi K.',
    price: '\u20B92,800',
    status: 'Processing',
  },
  {
    product: 'Pashmina Shawl',
    orderId: 'ORD-003',
    customer: 'Meena D.',
    price: '\u20B94,500',
    status: 'Delivered',
  },
];

const statusStyles: Record<string, string> = {
  Shipped: 'bg-amber-100 text-amber-700',
  Processing: 'bg-slate-100 text-slate-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
};

export default function ArtisanDashboardPage() {
  const { user } = useUser();
  const name = user?.displayName || user?.email?.split('@')[0] || 'Artisan';
  const featuredCrafts = products.slice(0, 3);
  const featuredOpportunities = jobOpportunities.slice(0, 3);

  return (
    <AuthGuard>
      <ArtisanRoleSync />
      <div className="min-h-screen bg-[#f8f4ee] text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <header className="mb-10 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Kala Quest</p>
              <h1 className="font-headline text-3xl text-slate-900 md:text-4xl">
                Welcome, {name}
              </h1>
              <p className="text-base text-slate-600">
                Artisan Dashboard — Manage your crafts &amp; orders
              </p>
            </div>
            <div className="border-b border-slate-200 pb-4" />
          </header>

          <section className="grid gap-4 md:grid-cols-2" id="overview">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 flex flex-wrap gap-3">
            {[
              { label: 'MY CRAFTS', href: '#my-crafts' },
              { label: 'ORDERS', href: '#orders' },
              { label: 'MESSAGES', href: '#messages' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white"
              >
                {action.label}
              </a>
            ))}
          </section>

          <section
            className="mt-10 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm"
            id="my-crafts"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">My Crafts</h2>
                <p className="text-sm text-slate-500">
                  Add products from the marketplace to highlight your offerings.
                </p>
              </div>
              <a
                href="/marketplace"
                className="text-sm font-medium text-amber-700 hover:text-amber-800"
              >
                Add from Marketplace
              </a>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {featuredCrafts.map((craft) => (
                <div
                  key={craft.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="h-36 overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={craft.image}
                      alt={craft.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-base font-semibold text-slate-900">{craft.name}</p>
                    <p className="text-sm text-slate-500 line-clamp-2">{craft.description}</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {craft.price.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="mt-10 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm"
            id="orders"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
              <button className="text-sm font-medium text-amber-700" type="button">
                View all
              </button>
            </div>
            <div className="mt-6 divide-y divide-slate-200">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-900">{order.product}</p>
                    <p className="text-sm text-slate-500">
                      {order.orderId} • {order.customer}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-slate-900">{order.price}</p>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        statusStyles[order.status] ?? 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="mt-10 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm"
            id="opportunities"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Opportunities</h2>
                <p className="text-sm text-slate-500">
                  Explore new collaborations and paid commissions.
                </p>
              </div>
              <a
                href="/opportunities"
                className="text-sm font-medium text-amber-700 hover:text-amber-800"
              >
                View all
              </a>
            </div>
            <div className="mt-6 space-y-4">
              {featuredOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {opportunity.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {opportunity.company} • {opportunity.location}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {opportunity.employmentType}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500 line-clamp-2">
                    {opportunity.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            className="mt-10 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm"
            id="messages"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Messages</h2>
                <p className="text-sm text-slate-500">
                  Respond to buyers and manage custom requests.
                </p>
              </div>
              <button className="text-sm font-medium text-amber-700" type="button">
                Open Inbox
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
              No new messages yet. When buyers reach out, conversations will appear here.
            </div>
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
