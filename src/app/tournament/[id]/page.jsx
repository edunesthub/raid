import TournamentClient from './TournamentClient';

export async function generateMetadata({ params, searchParams }) {
  const { id } = await params; // Await params in Next.js 15+ (safe to do in 14 too usually if async)
  // Note: searchParams is a promise in recent Next.js versions or just an object. 
  // Safest to await it if it's a promise, but in Next 14 it's an object. 
  // In Next 15 it's a promise. The provided logs say Next 16.1.6.
  // In Next 15+, searchParams is a promise.

  const resolvedSearchParams = await searchParams;
  const p1Name = resolvedSearchParams?.p1Name;
  const p2Name = resolvedSearchParams?.p2Name;
  const tName = resolvedSearchParams?.tName;

  let title = 'RAID Tournament';
  let description = 'Join the battle on RAID Esports Platform';
  let imageUrl = `/api/og?tName=${encodeURIComponent('RAID Tournament')}`;

  if (p1Name && p2Name) {
    title = `${p1Name} vs ${p2Name} | RAID Match`;
    description = `Watch ${p1Name} battle ${p2Name} in ${tName || 'the tournament'}!`;

    // Construct OG Image URL with all params
    const params = new URLSearchParams();
    if (p1Name) params.set('p1Name', p1Name);
    if (p2Name) params.set('p2Name', p2Name);
    if (tName) params.set('tName', tName);
    if (resolvedSearchParams.p1Avatar) params.set('p1Avatar', resolvedSearchParams.p1Avatar);
    if (resolvedSearchParams.p2Avatar) params.set('p2Avatar', resolvedSearchParams.p2Avatar);
    if (resolvedSearchParams.round) params.set('round', resolvedSearchParams.round);

    imageUrl = `/api/og?${params.toString()}`;
  } else if (tName) {
    title = `${tName} | RAID Tournament`;
    description = `Join ${tName} on RAID Esports Platform. Compete and win prizes!`;
    imageUrl = `/api/og?tName=${encodeURIComponent(tName)}&mode=tournament`;
  }

  // Ensure absolute URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://raid-esports.vercel.app'; // Fallback
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
    },
  };
}

export default async function TournamentPage({ params }) {
  // Pass params to client component
  // We need to resolve params because we are in an async component (Next 15+)
  const resolvedParams = await params;
  return <TournamentClient params={Promise.resolve(resolvedParams)} />;
}
