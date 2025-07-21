'use client';

import { useState } from 'react';
import { AnyDesignElement, TextElement, ImageElement, SymbolElement } from 'lib/design-studio/types';
import { 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon 
} from '@heroicons/react/24/outline';

interface PropertyPanelProps {
  selectedElement: AnyDesignElement | undefined;
  onElementUpdate: (updates: Partial<AnyDesignElement>) => void;
  onElementDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

export function PropertyPanel({
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onBringToFront,
  onSendToBack
}: PropertyPanelProps) {
  if (!selectedElement) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <EyeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm">Select an element to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={onBringToFront}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Bring to front"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onSendToBack}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Send to back"
            >
              <ArrowDownIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onElementDelete}
              className="p-1 text-red-400 hover:text-red-600"
              title="Delete element"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500 capitalize">
          {selectedElement.type} Element
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Position & Size */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Position & Size</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onElementUpdate({ x: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onElementUpdate({ y: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onElementUpdate({ width: parseFloat(e.target.value) || 1 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onElementUpdate({ height: parseFloat(e.target.value) || 1 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Rotation</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={selectedElement.rotation}
              onChange={(e) => onElementUpdate({ rotation: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {selectedElement.rotation}°
            </div>
          </div>
        </div>

        {/* Type-specific properties */}
        {selectedElement.type === 'text' && (
          <TextProperties 
            element={selectedElement as TextElement}
            onUpdate={onElementUpdate}
          />
        )}

        {selectedElement.type === 'image' && (
          <ImageProperties 
            element={selectedElement as ImageElement}
            onUpdate={onElementUpdate}
          />
        )}

        {selectedElement.type === 'symbol' && (
          <SymbolProperties 
            element={selectedElement as SymbolElement}
            onUpdate={onElementUpdate}
          />
        )}
      </div>
    </div>
  );
}

function TextProperties({ element, onUpdate }: { 
  element: TextElement; 
  onUpdate: (updates: Partial<AnyDesignElement>) => void;
}) {
  return (
    <>
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Text Content</h3>
        <textarea
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Enter your text..."
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Typography</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
            <input
              type="number"
              min="8"
              max="72"
              value={element.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseFloat(e.target.value) || 16 })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={element.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Text Align</label>
            <select
              value={element.textAlign}
              onChange={(e) => onUpdate({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onUpdate({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}
              className={`flex-1 px-2 py-1 text-sm rounded border ${
                element.fontWeight === 'bold' 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => onUpdate({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
              className={`flex-1 px-2 py-1 text-sm rounded border ${
                element.fontStyle === 'italic' 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              Italic
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ImageProperties({ element, onUpdate }: { 
  element: ImageElement; 
  onUpdate: (updates: Partial<AnyDesignElement>) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Image Properties</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Original Size</label>
          <div className="text-sm text-gray-600">
            {element.originalWidth} × {element.originalHeight} px
          </div>
        </div>
        
        <button
          onClick={() => {
            const aspectRatio = element.originalWidth / element.originalHeight;
            const maxSize = 200;
            const width = Math.min(maxSize, element.originalWidth);
            const height = width / aspectRatio;
            onUpdate({ width, height });
          }}
          className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
        >
          Reset to Original Ratio
        </button>
      </div>
    </div>
  );
}

function SymbolProperties({ element, onUpdate }: { 
  element: SymbolElement; 
  onUpdate: (updates: Partial<AnyDesignElement>) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Symbol Properties</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
          <input
            type="color"
            value={element.color || '#000000'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-full h-8 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Symbol ID</label>
          <div className="text-sm text-gray-600">{element.symbolId}</div>
        </div>
      </div>
    </div>
  );
}