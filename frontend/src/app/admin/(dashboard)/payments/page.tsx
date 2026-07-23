'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { PaymentRequestsList, ManualPaymentForm, OverdueScheduleList } from '@/features/admin-payments';

const tabs = [
  { key: 'requests', label: 'Заявки на оплату' },
  { key: 'manual', label: 'Ручная фиксация' },
  { key: 'overdue', label: 'Просрочки' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('requests');

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Платежи</h1>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && <PaymentRequestsList />}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Зафиксировать платёж вручную</h3>
            <ManualPaymentForm />
          </div>
        </div>
      )}
      {activeTab === 'overdue' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Просроченные платежи</h3>
            <OverdueScheduleList />
          </div>
        </div>
      )}
    </div>
  );
}
