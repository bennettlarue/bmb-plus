'use client';

import { usePredictiveSearch } from 'hooks/use-predictive-search';
import { Search, ArrowRight, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Price from 'components/price';

export default function EnhancedSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { results, isLoading, error } = usePredictiveSearch(query);


  // Initialize with URL search param only once
  useEffect(() => {
    const urlQuery = searchParams?.get('q') || '';
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, []); // Empty dependency array to run only once

  // Handle search submission
  const handleSubmit = useCallback((searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setIsOpen(false);
    setSelectedIndex(-1);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }, [query, router]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      // Only handle Enter when dropdown is closed
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    const totalItems = (results?.products.length || 0) + (results?.queries.length || 0);

    switch (e.key) {
      case 'ArrowDown':
        if (totalItems > 0) {
          e.preventDefault();
          setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        }
        break;
      case 'ArrowUp':
        if (totalItems > 0) {
          e.preventDefault();
          setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          // Handle selection based on index
          const products = results?.products || [];
          const queries = results?.queries || [];
          
          if (selectedIndex < products.length) {
            const product = products[selectedIndex];
            if (product) {
              router.push(`/product/${product.handle}`);
            }
          } else if (selectedIndex < products.length + queries.length) {
            const query = queries[selectedIndex - products.length];
            if (query) {
              handleSubmit(query.text);
            }
          }
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex, handleSubmit, router, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showResults = isOpen && query.length >= 2;
  const hasResults = results && (results.products.length > 0 || results.queries.length > 0);

  return (
    <div className="relative w-full max-w-[617px]" ref={resultsRef}>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for products..."
            autoComplete="off"
            className="w-full py-1 bg-[#eaeaea] rounded-[10px] pl-8 pr-4 text-[16px] text-[#5b5b5b] placeholder:text-[#5b5b5b] border-0 focus:outline-none focus:ring-0 font-barlow font-normal"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-3 h-3 text-[#5b5b5b]" />
          </div>
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-4 h-4 border-2 border-[#5b5b5b] border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-[620px] overflow-hidden">

          {error && (
            <div className="p-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          {hasResults && (
            <>
              {/* Query Suggestions */}
              {results?.queries && results.queries.length > 0 && (
                <div className="p-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Suggestions
                  </div>
                  {results.queries.slice(0, 3).map((query, index) => {
                    const globalIndex = (results?.products.length || 0) + index;
                    return (
                      <button
                        key={query.text}
                        onClick={() => handleSubmit(query.text)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-neutral-50 rounded ${
                          selectedIndex === globalIndex ? 'bg-neutral-100' : ''
                        }`}
                      >
                        <span dangerouslySetInnerHTML={{ __html: query.styledText || query.text }} />
                        <span className="text-xs text-neutral-500">Query</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Product Results */}
              {results?.products && results.products.length > 0 && (
                <div className="p-3">
                  <div className="text-sm text-neutral-600 mb-2">Products</div>
                  {results.products.slice(0, 4).map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.handle}`}
                      onClick={() => {
                        setIsOpen(false);
                        setSelectedIndex(-1);
                      }}
                      className={`flex items-center gap-3 p-3 hover:bg-neutral-50 rounded ${
                        selectedIndex === index ? 'bg-neutral-100' : ''
                      }`}
                    >
                      <div className="w-12 h-12 relative flex-shrink-0">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText || product.title}
                            fill
                            sizes="48px"
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 rounded flex items-center justify-center">
                            <Search className="w-4 h-4 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-black truncate">
                          {product.title}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {product.vendor}
                        </div>
                        <Price
                          amount={product.priceRange.minVariantPrice.amount}
                          currencyCode={product.priceRange.minVariantPrice.currencyCode}
                          className="text-sm font-medium"
                        />
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}

              {/* View All Results */}
              <div className="p-3 border-t border-neutral-100">
                <button
                  onClick={() => handleSubmit()}
                  className="w-full text-center py-2 text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View all results for "{query}"
                </button>
              </div>
            </>
          )}

          {!isLoading && !hasResults && (
            <div className="p-4 text-center text-neutral-500 text-sm">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}