'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Product } from 'lib/shopify/types';

interface CollectionFiltersProps {
  products: Product[];
  currentFilters: any;
}

export default function CollectionFilters({ products, currentFilters }: CollectionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract unique vendors from products
  const vendors = useMemo(() => {
    const vendorSet = new Set(products.map(p => p.vendor).filter(Boolean));
    return Array.from(vendorSet).sort();
  }, [products]);

  // Calculate price range
  const priceRange = useMemo(() => {
    const prices = products.map(p => parseFloat(p.priceRange.minVariantPrice.amount));
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }, [products]);

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === '' || value === 'all') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (filterType: string, value: string) => {
    const queryString = createQueryString({ [filterType]: value });
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between border-b border-neutral-200 pb-4">
      <div className="flex flex-wrap gap-4">
        {/* Sort */}
        <div className="relative">
          <select
            value={currentFilters.sortBy || 'newest'}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-2 pr-8 text-sm focus:border-primary focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title-asc">Name: A to Z</option>
            <option value="title-desc">Name: Z to A</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Vendor Filter */}
        {vendors.length > 1 && (
          <div className="relative">
            <select
              value={currentFilters.vendor || 'all'}
              onChange={(e) => handleFilterChange('vendor', e.target.value)}
              className="appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-2 pr-8 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Brands</option>
              {vendors.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* Capacity Filter */}
        <div className="relative">
          <select
            value={currentFilters.capacity || 'all'}
            onChange={(e) => handleFilterChange('capacity', e.target.value)}
            className="appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-2 pr-8 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Sizes</option>
            <option value="small">Under 4 oz</option>
            <option value="medium">4-12 oz</option>
            <option value="large">12-20 oz</option>
            <option value="xl">Over 20 oz</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Price:</span>
          <select
            value={currentFilters.priceRange ? `${currentFilters.priceRange.min}-${currentFilters.priceRange.max}` : 'all'}
            onChange={(e) => handleFilterChange('price', e.target.value)}
            className="appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-2 pr-8 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">All Prices</option>
            <option value="0-5">Under $5</option>
            <option value="5-10">$5 - $10</option>
            <option value="10-20">$10 - $20</option>
            <option value="20-50">$20 - $50</option>
            <option value="50-999">Over $50</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {Object.keys(currentFilters).some(key => currentFilters[key] && currentFilters[key] !== 'all') && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-primary hover:text-primary/80"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}