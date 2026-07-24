import { DashboardSidebar } from '@/widgets/dashboard-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      <div className="flex-1 p-4 lg:p-6">{children}</div>
    </div>
  );
}
