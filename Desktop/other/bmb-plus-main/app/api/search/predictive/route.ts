import { predictiveSearchProducts } from 'lib/shopify/search';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 4;

  if (!query || query.length < 2) {
    return NextResponse.json({ queries: [], products: [] });
  }

  try {
    const results = await predictiveSearchProducts({
      query,
      limit
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Predictive search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}