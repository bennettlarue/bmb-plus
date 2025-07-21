import { AnyDesignElement, DesignState, TextElement, ImageElement, SymbolElement } from './types';

export function generateElementId(): string {
  return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createTextElement(x: number, y: number, content: string = 'Your text here'): TextElement {
  return {
    id: generateElementId(),
    type: 'text',
    x,
    y,
    width: 200,
    height: 40,
    rotation: 0,
    zIndex: Date.now(),
    content,
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    color: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left'
  };
}

export function createImageElement(x: number, y: number, src: string, originalWidth: number, originalHeight: number): ImageElement {
  const aspectRatio = originalWidth / originalHeight;
  const maxWidth = 300;
  const width = Math.min(maxWidth, originalWidth);
  const height = width / aspectRatio;

  return {
    id: generateElementId(),
    type: 'image',
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex: Date.now(),
    src,
    originalWidth,
    originalHeight
  };
}

export function createSymbolElement(x: number, y: number, symbolId: string, color?: string): SymbolElement {
  return {
    id: generateElementId(),
    type: 'symbol',
    x,
    y,
    width: 60,
    height: 60,
    rotation: 0,
    zIndex: Date.now(),
    symbolId,
    color: color || '#000000'
  };
}

export function updateElement(state: DesignState, elementId: string, updates: Partial<AnyDesignElement>): DesignState {
  return {
    ...state,
    elements: {
      ...state.elements,
      [state.currentSurface]: state.elements[state.currentSurface].map(element =>
        element.id === elementId ? { ...element, ...updates } as AnyDesignElement : element
      )
    }
  };
}

export function deleteElement(state: DesignState, elementId: string): DesignState {
  return {
    ...state,
    elements: {
      ...state.elements,
      [state.currentSurface]: state.elements[state.currentSurface].filter(element => element.id !== elementId)
    },
    selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId
  };
}

export function selectElement(state: DesignState, elementId: string | null): DesignState {
  return {
    ...state,
    selectedElementId: elementId
  };
}

export function bringToFront(state: DesignState, elementId: string): DesignState {
  const currentElements = state.elements[state.currentSurface];
  const maxZIndex = Math.max(...currentElements.map(el => el.zIndex));
  return updateElement(state, elementId, { zIndex: maxZIndex + 1 });
}

export function sendToBack(state: DesignState, elementId: string): DesignState {
  const currentElements = state.elements[state.currentSurface];
  const minZIndex = Math.min(...currentElements.map(el => el.zIndex));
  return updateElement(state, elementId, { zIndex: minZIndex - 1 });
}

export function isPointInElement(x: number, y: number, element: AnyDesignElement): boolean {
  return x >= element.x && 
         x <= element.x + element.width && 
         y >= element.y && 
         y <= element.y + element.height;
}

export function findElementAtPoint(elements: AnyDesignElement[], x: number, y: number): AnyDesignElement | null {
  // Find the topmost element (highest zIndex) at the given point
  const elementsAtPoint = elements.filter(element => isPointInElement(x, y, element));
  if (elementsAtPoint.length === 0) return null;
  
  return elementsAtPoint.reduce((topElement, current) => 
    current.zIndex > topElement.zIndex ? current : topElement
  );
}

// Constrain an element position to stay within boundaries  
export function constrainToBoundaries(
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  boundaries: { x: number; y: number; width: number; height: number }[]
): { x: number; y: number } {
  if (boundaries.length === 0) {
    return { x, y };
  }

  // Use the first boundary as primary constraint
  const boundary = boundaries[0]!;

  const constrainedX = Math.max(
    boundary.x,
    Math.min(boundary.x + boundary.width - width, x)
  );

  const constrainedY = Math.max(
    boundary.y,
    Math.min(boundary.y + boundary.height - height, y)
  );

  return { x: constrainedX, y: constrainedY };
}