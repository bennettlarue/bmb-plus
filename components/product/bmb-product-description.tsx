'use client';

import { useState } from 'react';
import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product, Metafield } from 'lib/shopify/types';
import { VariantSelector } from './variant-selector';

function getMetafieldValue(metafields: Metafield[] | undefined, key: string): string | null {
  if (!metafields || !Array.isArray(metafields)) {
    return null;
  }
  return metafields.find(field => field && field.key === key)?.value || null;
}

interface TieredPricingProps {
  quantities: string[];
  prices: string[];
  currencyCode: string;
}

function TieredPricingCalculator({ quantities, prices, currencyCode }: TieredPricingProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(0);

  return (
    <div className="mb-6 rounded-lg border border-neutral-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">Quantity Pricing</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {quantities.map((qty, index) => (
          <button
            key={index}
            onClick={() => setSelectedQuantity(index)}
            className={`rounded-md border p-2 text-sm transition-colors ${
              selectedQuantity === index
                ? 'border-primary bg-blue-50 text-primary'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="font-medium">{qty} pcs</div>
            <div className="text-xs">
              <Price amount={prices[index] || '0'} currencyCode={currencyCode} />
              <span className="text-neutral-500"> ea</span>
            </div>
          </button>
        ))}
      </div>
      
      {selectedQuantity >= 0 && (
        <div className="mt-4 rounded-md bg-neutral-50 p-3">
          <div className="flex justify-between text-sm">
            <span>Quantity: {quantities[selectedQuantity]} pieces</span>
            <span>Per unit: <Price amount={prices[selectedQuantity] || '0'} currencyCode={currencyCode} /></span>
          </div>
          <div className="mt-1 text-lg font-semibold">
            Total: <Price 
              amount={(parseFloat(prices[selectedQuantity] || '0') * parseInt(quantities[selectedQuantity] || '0')).toFixed(2)} 
              currencyCode={currencyCode} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductSpecsProps {
  size?: string;
  productionTime?: string;
  additionalInfo?: string;
}

function ProductSpecs({ size, productionTime, additionalInfo }: ProductSpecsProps) {
  const [activeTab, setActiveTab] = useState('specs');

  return (
    <div className="mb-6">
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'specs'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Specifications
          </button>
          {additionalInfo && (
            <button
              onClick={() => setActiveTab('customization')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customization'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Customization
            </button>
          )}
        </nav>
      </div>
      
      <div className="py-4">
        {activeTab === 'specs' && (
          <div className="space-y-2 text-sm">
            {size && (
              <div className="flex">
                <span className="w-24 font-medium text-neutral-600">Size:</span>
                <span>{size}</span>
              </div>
            )}
            {productionTime && (
              <div className="flex">
                <span className="w-24 font-medium text-neutral-600">Production:</span>
                <span>{productionTime} working days</span>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'customization' && additionalInfo && (
          <div className="text-sm">
            <Prose 
              className="text-sm leading-relaxed" 
              html={additionalInfo.replace(/\n/g, '<br>')} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function BMBProductDescription({ product }: { product: Product }) {
  const quantities = getMetafieldValue(product.metafields, 'quantities')?.split(';').map(q => q.trim()) || [];
  const retailPrices = getMetafieldValue(product.metafields, 'retailprices')?.split(';').map(p => p.trim()) || [];
  const size = getMetafieldValue(product.metafields, 'size');
  const productionTime = getMetafieldValue(product.metafields, 'production_time');
  const additionalInfo = getMetafieldValue(product.metafields, 'additional_info');

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6">
        <h1 className="mb-2 text-4xl font-medium">{product.title}</h1>
        
        {size && (
          <div className="mb-2">
            <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
              {size}
            </span>
          </div>
        )}
        
        <div className="mr-auto w-auto rounded-full bg-primary p-2 text-sm text-white">
          <span className="text-xs">Starting at </span>
          <Price
            amount={product.priceRange.minVariantPrice.amount}
            currencyCode={product.priceRange.minVariantPrice.currencyCode}
          />
        </div>
      </div>

      {quantities.length > 0 && retailPrices.length > 0 && (
        <TieredPricingCalculator 
          quantities={quantities}
          prices={retailPrices}
          currencyCode={product.priceRange.maxVariantPrice.currencyCode}
        />
      )}

      <VariantSelector options={product.options} variants={product.variants} />
      
      {product.descriptionHtml ? (
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold">Description</h3>
          <Prose
            className="text-sm leading-relaxed dark:text-white/[80%]"
            html={product.descriptionHtml}
          />
        </div>
      ) : null}

      <ProductSpecs 
        size={size || undefined}
        productionTime={productionTime || undefined}
        additionalInfo={additionalInfo || undefined}
      />
      
      <AddToCart product={product} />
    </>
  );
}