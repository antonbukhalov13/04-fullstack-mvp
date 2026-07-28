import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credit Policy',
};

export default function CreditPolicyPage() {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Credit Policy
          </h1>
          <div className="mt-8 rounded-xl border border-slate-200 p-8">
            <p className="text-sm text-slate-500">
              Документ в разработке
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
