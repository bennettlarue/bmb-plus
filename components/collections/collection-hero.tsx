import { DynamicCollection } from 'lib/collections-config';

interface CollectionHeroProps {
  collection: DynamicCollection;
  productCount: number;
}

export default function CollectionHero({ collection, productCount }: CollectionHeroProps) {
  return (
    <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
              {collection.title}
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
              {collection.description}
            </p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {productCount} {productCount === 1 ? 'product' : 'products'} available
            </p>
          </div>
          
          {collection.heroImage && (
            <div className="mt-8 lg:mt-0">
              <img
                src={collection.heroImage}
                alt={collection.title}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}