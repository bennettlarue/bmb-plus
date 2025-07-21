import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from 'lib/shopify';
import { HIDDEN_PRODUCT_TAG } from 'lib/constants';
import { DesignStudio } from 'components/design-studio/design-studio';

export async function generateMetadata(props: {
  params: Promise<{ sku: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  
  // For now, we'll use the SKU as the handle - in a real implementation
  // you might need to map SKU to handle or modify the product query
  const product = await getProduct(params.sku);

  if (!product) return notFound();

  return {
    title: `Design Studio - ${product.title}`,
    description: `Customize your ${product.title} with our design studio`,
    robots: {
      index: false, // Design studio pages shouldn't be indexed
      follow: false
    }
  };
}

export default async function DesignStudioPage(props: { 
  params: Promise<{ sku: string }> 
}) {
  const params = await props.params;
  
  // For now, we'll use the SKU as the handle - in a real implementation
  // you might need to map SKU to handle or modify the product query
  const product = await getProduct(params.sku);

  if (!product) return notFound();

  // Don't allow design studio for hidden products
  if (product.tags.includes(HIDDEN_PRODUCT_TAG)) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DesignStudio product={product} />
    </div>
  );
}