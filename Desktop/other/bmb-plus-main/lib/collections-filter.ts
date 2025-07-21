import { Product } from './shopify/types';
import { DynamicCollection } from './collections-config';

export function filterProductsForCollection(
  products: Product[],
  collection: DynamicCollection
): Product[] {
  return products.filter(product => {
    const { filters } = collection;
    
    // Check tags
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        product.tags.some(productTag => 
          productTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (hasMatchingTag) return true;
    }
    
    // Check product types
    if (filters.types && filters.types.length > 0) {
      const hasMatchingType = filters.types.some(type =>
        product.productType?.toLowerCase() === type.toLowerCase()
      );
      if (hasMatchingType) return true;
    }
    
    // Check vendors
    if (filters.vendors && filters.vendors.length > 0) {
      const hasMatchingVendor = filters.vendors.some(vendor =>
        product.vendor?.toLowerCase() === vendor.toLowerCase()
      );
      if (hasMatchingVendor) return true;
    }
    
    // Check search query
    if (filters.searchQuery) {
      const searchTerms = filters.searchQuery.toLowerCase().split(' OR ').map(term => term.trim());
      const productText = `${product.title} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
      
      const matchesSearch = searchTerms.some(term => productText.includes(term));
      if (matchesSearch) return true;
    }
    
    // If no filters match, exclude the product
    return false;
  });
}

export interface CollectionFilters {
  priceRange?: { min: number; max: number };
  capacity?: string;
  vendor?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc' | 'newest';
}

export function applyAdditionalFilters(
  products: Product[],
  filters: CollectionFilters
): Product[] {
  let filtered = [...products];
  
  // Filter by vendor
  if (filters.vendor && filters.vendor !== 'all') {
    filtered = filtered.filter(product => 
      product.vendor?.toLowerCase() === filters.vendor?.toLowerCase()
    );
  }
  
  // Filter by capacity (using metafields)
  if (filters.capacity && filters.capacity !== 'all') {
    filtered = filtered.filter(product => {
      const sizeMetafield = product.metafields?.find(field => field.key === 'size');
      if (!sizeMetafield) return false;
      
      const size = sizeMetafield.value.toLowerCase();
      const capacityValue = parseFloat(size);
      
      switch (filters.capacity) {
        case 'small':
          return capacityValue < 4;
        case 'medium':
          return capacityValue >= 4 && capacityValue < 12;
        case 'large':
          return capacityValue >= 12 && capacityValue < 20;
        case 'xl':
          return capacityValue >= 20;
        default:
          return true;
      }
    });
  }
  
  // Filter by price range
  if (filters.priceRange) {
    filtered = filtered.filter(product => {
      const price = parseFloat(product.priceRange.minVariantPrice.amount);
      return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
    });
  }
  
  // Sort products
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => 
          parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount)
        );
        break;
      case 'price-desc':
        filtered.sort((a, b) => 
          parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount)
        );
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
    }
  }
  
  return filtered;
}