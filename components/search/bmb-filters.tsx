'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const GLASS_TYPES = [
  'Beer Glasses',
  'Wine Glasses', 
  'Shot Glasses',
  'Coffee Mugs',
  'Cocktail Glasses'
];

const VENDORS = [
  'Libbey',
  'Arc',
  'Brand My Beverage'
];

const CAPACITY_RANGES = [
  { label: 'Under 4 oz', value: 'small' },
  { label: '4-12 oz', value: 'medium' },
  { label: '12-20 oz', value: 'large' },
  { label: 'Over 20 oz', value: 'xl' }
];

export function BMBFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === '') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (filterType: string, value: string) => {
    const queryString = createQueryString(filterType, value);
    router.push(`/search?${queryString}`);
  };

  return (
    <div className="mb-6 space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
      <h3 className="text-lg font-semibold">Filter Products</h3>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Product Type Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Product Type
          </label>
          <select
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800"
            value={searchParams.get('type') || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            {GLASS_TYPES.map((type) => (
              <option key={type} value={type.toLowerCase()}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Brand
          </label>
          <select
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800"
            value={searchParams.get('vendor') || 'all'}
            onChange={(e) => handleFilterChange('vendor', e.target.value)}
          >
            <option value="all">All Brands</option>
            {VENDORS.map((vendor) => (
              <option key={vendor} value={vendor.toLowerCase()}>
                {vendor}
              </option>
            ))}
          </select>
        </div>

        {/* Capacity Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Capacity
          </label>
          <select
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800"
            value={searchParams.get('capacity') || 'all'}
            onChange={(e) => handleFilterChange('capacity', e.target.value)}
          >
            <option value="all">All Sizes</option>
            {CAPACITY_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {(searchParams.get('type') || searchParams.get('vendor') || searchParams.get('capacity')) && (
        <button
          onClick={() => router.push('/search')}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}