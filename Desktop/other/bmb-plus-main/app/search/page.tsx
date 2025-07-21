import Grid from 'components/grid';
import ProductGridItems from 'components/layout/product-grid-items';
import { BMBFilters } from 'components/search/bmb-filters';
import { defaultSort, sorting } from 'lib/constants';
import { getProducts } from 'lib/shopify';

export const metadata = {
  title: 'Search',
  description: 'Search for products in the store.'
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort, q: searchValue, type, vendor, capacity } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;

  // Build filter query
  let filterQuery = searchValue || '';
  if (type && type !== 'all') {
    filterQuery += ` tag:${type}`;
  }
  if (vendor && vendor !== 'all') {
    filterQuery += ` vendor:${vendor}`;
  }

  const products = await getProducts({ sortKey, reverse, query: filterQuery.trim() });
  const resultsText = products.length > 1 ? 'results' : 'result';

  return (
    <>
      <BMBFilters />
      
      {searchValue ? (
        <p className="mb-4">
          {products.length === 0
            ? 'There are no products that match '
            : `Showing ${products.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}
      
      {(type || vendor || capacity) && !searchValue ? (
        <p className="mb-4">
          Showing {products.length} {resultsText} with selected filters
        </p>
      ) : null}
      
      {products.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      ) : null}
    </>
  );
}
