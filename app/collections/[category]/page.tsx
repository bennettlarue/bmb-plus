import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Grid from 'components/grid';
import ProductGridItems from 'components/layout/product-grid-items';
import { getProducts } from 'lib/shopify';
import { getCollectionByHandle } from 'lib/collections-config';
import { filterProductsForCollection, applyAdditionalFilters } from 'lib/collections-filter';
import CollectionHero from 'components/collections/collection-hero';
import CollectionFilters from 'components/collections/collection-filters';
import { Suspense } from 'react';

export async function generateMetadata(props: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = getCollectionByHandle(params.category);

  if (!collection) return notFound();

  return {
    title: collection.seo.title,
    description: collection.seo.description,
  };
}

export default async function CollectionPage(props: {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const collection = getCollectionByHandle(params.category);

  if (!collection) return notFound();

  // Get all products
  const allProducts = await getProducts({});
  
  // Filter products for this collection
  let products = filterProductsForCollection(allProducts, collection);
  
  // Apply additional filters from URL params
  const filters = {
    vendor: searchParams?.vendor as string,
    capacity: searchParams?.capacity as string,
    sortBy: searchParams?.sort as any,
    priceRange: searchParams?.price ? {
      min: parseFloat((searchParams.price as string).split('-')[0]),
      max: parseFloat((searchParams.price as string).split('-')[1])
    } : undefined
  };
  
  products = applyAdditionalFilters(products, filters);

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl)">
      <CollectionHero collection={collection} productCount={products.length} />
      
      <div className="px-4 pb-4 pt-8">
        <Suspense fallback={<div className="h-12" />}>
          <CollectionFilters 
            products={products}
            currentFilters={filters}
          />
        </Suspense>
      </div>

      <div className="px-4 pb-16">
        {products.length === 0 ? (
          <p className="py-3 text-lg text-neutral-500">No products found matching your filters.</p>
        ) : (
          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ProductGridItems products={products} />
          </Grid>
        )}
      </div>
    </div>
  );
}