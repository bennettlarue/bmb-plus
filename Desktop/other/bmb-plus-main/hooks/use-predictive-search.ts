import { useEffect, useState } from 'react';
import type { Product } from 'lib/shopify/types';
import type { PredictiveSearchQuerySuggestion } from 'lib/shopify/types/predictive-search';

interface PredictiveSearchResult {
  queries: PredictiveSearchQuerySuggestion[];
  products: Product[];
}

export function usePredictiveSearch(query: string, delay: number = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<PredictiveSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  // Fetch search results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search/predictive?q=${encodeURIComponent(debouncedQuery)}&limit=4`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return { results, isLoading, error };
}