export interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'symbol';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface TextElement extends DesignElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageElement extends DesignElement {
  type: 'image';
  src: string;
  originalWidth: number;
  originalHeight: number;
}

export interface SymbolElement extends DesignElement {
  type: 'symbol';
  symbolId: string;
  color?: string;
}

export type AnyDesignElement = TextElement | ImageElement | SymbolElement;

export interface DesignState {
  elements: AnyDesignElement[];
  selectedElementId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  productImageSrc: string;
}

export interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}

export interface SymbolData {
  id: string;
  name: string;
  svg: string;
  category: 'business' | 'nature' | 'symbols' | 'arrows';
}