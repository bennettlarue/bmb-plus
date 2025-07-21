// Design boundary configurations for different product types
// In the future, this could be loaded from a CMS or API

export interface DesignBoundary {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface ProductSurface {
  id: 'front' | 'back';
  name: string;
  imageUrl?: string;
  boundaries: DesignBoundary[];
}

export interface ProductBoundaryConfig {
  productType: string;
  surfaces: ProductSurface[];
}

// Default boundary configuration - placeholder for all products
export const DEFAULT_BOUNDARY_CONFIG: ProductBoundaryConfig = {
  productType: 'default',
  surfaces: [
    {
      id: 'front',
      name: 'Front',
      boundaries: [
        {
          x: 150,
          y: 100,
          width: 300,
          height: 400,
          label: 'Print Area'
        }
      ]
    },
    {
      id: 'back',
      name: 'Back',
      boundaries: [
        {
          x: 150,
          y: 100,
          width: 300,
          height: 400,
          label: 'Print Area'
        }
      ]
    }
  ]
};

// Get boundary config for a product (placeholder implementation)
export function getBoundaryConfig(productId: string): ProductBoundaryConfig {
  // For now, return default config for all products
  // In the future, this would lookup product-specific boundaries
  return DEFAULT_BOUNDARY_CONFIG;
}

// Check if a point is within any boundary
export function isPointInBoundaries(x: number, y: number, boundaries: DesignBoundary[]): boolean {
  return boundaries.some(boundary => 
    x >= boundary.x && 
    x <= boundary.x + boundary.width && 
    y >= boundary.y && 
    y <= boundary.y + boundary.height
  );
}

// Get the primary boundary (first one) for centering elements
export function getPrimaryBoundary(boundaries: DesignBoundary[]): DesignBoundary | null {
  return boundaries.length > 0 ? boundaries[0]! : null;
}

// Constrain an element position to stay within boundaries
export function constrainToBoundaries(
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  boundaries: DesignBoundary[]
): { x: number; y: number } {
  const primaryBoundary = getPrimaryBoundary(boundaries);
  
  if (!primaryBoundary) {
    return { x, y };
  }

  const constrainedX = Math.max(
    primaryBoundary.x,
    Math.min(primaryBoundary.x + primaryBoundary.width - width, x)
  );

  const constrainedY = Math.max(
    primaryBoundary.y,
    Math.min(primaryBoundary.y + primaryBoundary.height - height, y)
  );

  return { x: constrainedX, y: constrainedY };
}