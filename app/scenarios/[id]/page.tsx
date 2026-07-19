import { notFound } from 'next/navigation';
import { SimulatorPlayer } from '@/components/SimulatorPlayer/SimulatorPlayer';

interface ScenarioPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const { id } = await params;

  if (id !== 'bls-01') {
    notFound();
  }

  return <SimulatorPlayer />;
}
