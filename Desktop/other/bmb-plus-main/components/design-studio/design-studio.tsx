'use client';

import { useState, useReducer } from 'react';
import { Product } from 'lib/shopify/types';
import { DesignState, AnyDesignElement, Tool } from 'lib/design-studio/types';
import { 
  createTextElement, 
  createImageElement, 
  createSymbolElement,
  updateElement,
  deleteElement,
  selectElement,
  bringToFront,
  sendToBack
} from 'lib/design-studio/utils';
import { DesignCanvas } from './design-canvas';
import { DesignToolbar } from './design-toolbar';
import { PropertyPanel } from './property-panel';
import { 
  PhotoIcon, 
  PencilIcon, 
  FaceSmileIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

type DesignAction = 
  | { type: 'ADD_TEXT'; x: number; y: number; content?: string }
  | { type: 'ADD_IMAGE'; x: number; y: number; src: string; width: number; height: number }
  | { type: 'ADD_SYMBOL'; x: number; y: number; symbolId: string; color?: string }
  | { type: 'UPDATE_ELEMENT'; elementId: string; updates: Partial<AnyDesignElement> }
  | { type: 'DELETE_ELEMENT'; elementId: string }
  | { type: 'SELECT_ELEMENT'; elementId: string | null }
  | { type: 'BRING_TO_FRONT'; elementId: string }
  | { type: 'SEND_TO_BACK'; elementId: string };

function designReducer(state: DesignState, action: DesignAction): DesignState {
  switch (action.type) {
    case 'ADD_TEXT':
      const textElement = createTextElement(action.x, action.y, action.content);
      return {
        ...state,
        elements: [...state.elements, textElement],
        selectedElementId: textElement.id
      };
    
    case 'ADD_IMAGE':
      const imageElement = createImageElement(action.x, action.y, action.src, action.width, action.height);
      return {
        ...state,
        elements: [...state.elements, imageElement],
        selectedElementId: imageElement.id
      };
    
    case 'ADD_SYMBOL':
      const symbolElement = createSymbolElement(action.x, action.y, action.symbolId, action.color);
      return {
        ...state,
        elements: [...state.elements, symbolElement],
        selectedElementId: symbolElement.id
      };
    
    case 'UPDATE_ELEMENT':
      return updateElement(state, action.elementId, action.updates);
    
    case 'DELETE_ELEMENT':
      return deleteElement(state, action.elementId);
    
    case 'SELECT_ELEMENT':
      return selectElement(state, action.elementId);
    
    case 'BRING_TO_FRONT':
      return bringToFront(state, action.elementId);
    
    case 'SEND_TO_BACK':
      return sendToBack(state, action.elementId);
    
    default:
      return state;
  }
}

interface DesignStudioProps {
  product: Product;
}

export function DesignStudio({ product }: DesignStudioProps) {
  const [currentTool, setCurrentTool] = useState<string>('select');
  
  const initialState: DesignState = {
    elements: [],
    selectedElementId: null,
    canvasWidth: 600,
    canvasHeight: 600,
    productImageSrc: product.featuredImage?.url || ''
  };

  const [designState, dispatch] = useReducer(designReducer, initialState);

  const tools: Tool[] = [
    {
      id: 'upload',
      name: 'Upload Image',
      icon: PhotoIcon,
      active: currentTool === 'upload'
    },
    {
      id: 'text',
      name: 'Add Text',
      icon: PencilIcon,
      active: currentTool === 'text'
    },
    {
      id: 'symbols',
      name: 'Symbols',
      icon: FaceSmileIcon,
      active: currentTool === 'symbols'
    }
  ];

  const handleToolSelect = (toolId: string) => {
    setCurrentTool(toolId);
  };

  const handleAddText = () => {
    const x = designState.canvasWidth / 2 - 100; // Center horizontally
    const y = designState.canvasHeight / 2 - 20; // Center vertically
    dispatch({ type: 'ADD_TEXT', x, y, content: 'Your text here' });
    setCurrentTool('select');
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = new Image();
        img.onload = () => {
          const x = designState.canvasWidth / 2 - img.width / 4; // Center, scaled down
          const y = designState.canvasHeight / 2 - img.height / 4;
          dispatch({ 
            type: 'ADD_IMAGE', 
            x, 
            y, 
            src: e.target!.result as string, 
            width: img.width, 
            height: img.height 
          });
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
    setCurrentTool('select');
  };

  const handleSymbolAdd = (symbolId: string, color?: string) => {
    const x = designState.canvasWidth / 2 - 30; // Center horizontally
    const y = designState.canvasHeight / 2 - 30; // Center vertically
    dispatch({ type: 'ADD_SYMBOL', x, y, symbolId, color });
    setCurrentTool('select');
  };

  const selectedElement = designState.elements.find(el => el.id === designState.selectedElementId);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Product</span>
          </button>
          <div className="h-4 w-px bg-gray-300"></div>
          <h1 className="text-xl font-semibold text-gray-900">Design Studio</h1>
          <span className="text-sm text-gray-500">- {product.title}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Save Design
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <PlayIcon className="h-4 w-4" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
          <DesignToolbar 
            tools={tools}
            currentTool={currentTool}
            onToolSelect={handleToolSelect}
            onAddText={handleAddText}
            onImageUpload={handleImageUpload}
            onSymbolAdd={handleSymbolAdd}
          />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center p-8">
          <DesignCanvas 
            state={designState}
            dispatch={dispatch}
            currentTool={currentTool}
          />
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <PropertyPanel 
            selectedElement={selectedElement}
            onElementUpdate={(updates) => {
              if (selectedElement) {
                dispatch({ type: 'UPDATE_ELEMENT', elementId: selectedElement.id, updates });
              }
            }}
            onElementDelete={() => {
              if (selectedElement) {
                dispatch({ type: 'DELETE_ELEMENT', elementId: selectedElement.id });
              }
            }}
            onBringToFront={() => {
              if (selectedElement) {
                dispatch({ type: 'BRING_TO_FRONT', elementId: selectedElement.id });
              }
            }}
            onSendToBack={() => {
              if (selectedElement) {
                dispatch({ type: 'SEND_TO_BACK', elementId: selectedElement.id });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}