import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/lib/use-auth';
import { LoginPage } from '@/components/login-page';
import { AppLayout } from '@/components/app-layout';
import { EmployeesListView } from '@/components/employees-list-view';
import { buildHead } from '@/lib/seo';

export const Route = createFileRoute('/employees')({
  head: () =>
    buildHead({
      title: 'Employees',
      description: 'Manage team members and track who has which assets.',
      path: '/employees',
      noindex: true,
    }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <LoginPage />;
  return <AppLayout><EmployeesListView /></AppLayout>;
}
