import 'server-only';

import { TAGS } from 'lib/constants';
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache';
import { shopifyFetch } from './index';
import { predictiveSearchQuery, predictiveSearchProductsOnlyQuery } from './queries/predictive-search';
import type { Product } from './types';
import type { PredictiveSearchResult, ShopifyPredictiveSearchOperation } from './types/predictive-search';

export async function predictiveSearch({
  query,
  limit = 10,
  types
}: {
  query: string;
  limit?: number;
  types?: string[];
}): Promise<PredictiveSearchResult> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('minutes');

  const res = await shopifyFetch<ShopifyPredictiveSearchOperation>({
    query: predictiveSearchQuery,
    variables: {
      query,
      limit,
      types
    }
  });

  if (!res.body.data.predictiveSearch) {
    return {
      queries: [],
      products: [],
      collections: [],
      pages: [],
      articles: []
    };
  }

  const result = res.body.data.predictiveSearch;
  
  return {
    queries: result.queries || [],
    products: result.products || [],
    collections: result.collections || [],
    pages: result.pages || [],
    articles: result.articles || []
  };
}

export async function predictiveSearchProducts({
  query,
  limit = 4
}: {
  query: string;
  limit?: number;
}): Promise<{ queries: PredictiveSearchResult['queries']; products: Product[] }> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('minutes');

  const res = await shopifyFetch<ShopifyPredictiveSearchOperation>({
    query: predictiveSearchProductsOnlyQuery,
    variables: {
      query,
      limit
    }
  });

  if (!res.body.data.predictiveSearch) {
    return {
      queries: [],
      products: []
    };
  }

  const result = res.body.data.predictiveSearch;
  
  return {
    queries: result.queries || [],
    products: result.products || []
  };
}