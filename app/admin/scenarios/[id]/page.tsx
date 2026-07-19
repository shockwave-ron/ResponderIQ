import { notFound } from 'next/navigation';
import { AdminReview } from '@/components/AdminReview/AdminReview';

interface AdminScenarioPageProps {
  readonly params: Promise<{ id: string }>;
}

/**
 * Local administrator review — deliberately not linked from anywhere in the
 * learner UI. Being unlinked is not the same as being secure: there is no
 * authentication here, and none is claimed. See AdminReview for the explicit
 * disclaimer shown on the page itself.
 */
export default async function AdminScenarioPage({ params }: AdminScenarioPageProps) {
  const { id } = await params;

  if (id !== 'bls-01') {
    notFound();
  }

  return <AdminReview />;
}
