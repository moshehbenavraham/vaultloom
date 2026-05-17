import { createFileRoute, Outlet, useMatch } from '@tanstack/react-router';
import { useAuth } from '@/lib/use-auth';
import { LoginPage } from '@/components/login-page';
import { AppLayout } from '@/components/app-layout';
import { AssetDetailView } from '@/components/asset-detail-view';
import { buildHead } from '@/lib/seo';

export const Route = createFileRoute('/assets/$assetId')({
  head: () =>
    buildHead({
      title: 'Asset details',
      description: 'View asset details, assignment history, and depreciation schedule.',
      noindex: true,
    }),
  component: AssetDetailLayout,
});

function AssetDetailLayout() {
  const { assetId } = Route.useParams();
  const { user, loading } = useAuth();

  // Check if a child route (like /edit) is active
  const editMatch = useMatch({ from: '/assets/$assetId/edit', shouldThrow: false });
  const hasChild = !!editMatch;

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <LoginPage />;

  if (hasChild) {
    return <Outlet />;
  }

  return <AppLayout><AssetDetailView assetId={assetId} /></AppLayout>;
}
