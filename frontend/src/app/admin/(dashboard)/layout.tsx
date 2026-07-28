import { AdminSidebar } from '@/widgets/admin-sidebar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-4 lg:p-6">{children}</div>
    </div>
  );
}
