import type { Metadata } from 'next';
import { ScrollReveal } from '@/shared/ui';

export const metadata: Metadata = {
  title: 'AML/KYC Policy',
};

export default function AmlKycPage() {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              AML/KYC Policy
            </h1>
            <div className="mt-8 rounded-xl border border-slate-200 p-8 transition-colors duration-300 group hover:border-indigo-300 hover:bg-indigo-100">
              <p className="text-sm text-slate-500 transition-colors duration-300 group-hover:text-indigo-600">
                Документ в разработке
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
