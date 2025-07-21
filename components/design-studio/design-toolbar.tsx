'use client';

import { useState, useRef } from 'react';
import { Tool } from 'lib/design-studio/types';
import { PhotoIcon, PencilIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { 
  Star, 
  Heart, 
  Check, 
  ArrowRight, 
  ArrowUp, 
  Smile, 
  ThumbsUp, 
  Flame 
} from 'lucide-react';

interface DesignToolbarProps {
  tools: Tool[];
  currentTool: string;
  onToolSelect: (toolId: string) => void;
  onAddText: () => void;
  onImageUpload: (file: File) => void;
  onSymbolAdd: (symbolId: string, color?: string) => void;
}

export function DesignToolbar({ 
  tools, 
  currentTool, 
  onToolSelect,
  onAddText,
  onImageUpload,
  onSymbolAdd
}: DesignToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
    // Reset input so same file can be uploaded again
    event.target.value = '';
  };

  const renderToolPanel = () => {
    switch (currentTool) {
      case 'upload':
        return <ImageUploadPanel onUpload={() => fileInputRef.current?.click()} />;
      case 'text':
        return <TextPanel onAddText={onAddText} />;
      case 'symbols':
        return <SymbolPanel onSymbolAdd={onSymbolAdd} />;
      default:
        return <WelcomePanel />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tool Selection */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Design Tools</h2>
        <div className="space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-md transition-colors ${
                  tool.active 
                    ? 'bg-blue-100 text-blue-700 border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                } border`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Panel */}
      <div className="flex-1 overflow-y-auto">
        {renderToolPanel()}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}

function WelcomePanel() {
  return (
    <div className="p-4">
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <PhotoIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Designing</h3>
        <p className="text-sm text-gray-500 mb-4">
          Choose a tool from above to begin customizing your product.
        </p>
        <div className="text-xs text-gray-400 space-y-1">
          <div>• Upload your own images</div>
          <div>• Add custom text</div>
          <div>• Insert symbols and icons</div>
        </div>
      </div>
    </div>
  );
}

function ImageUploadPanel({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="p-4">
      <h3 className="text-md font-medium text-gray-900 mb-3">Upload Your Artwork</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-3">Upload image from your computer</p>
        
        <button
          onClick={onUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Browse for file
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p className="mb-2">Supported formats:</p>
        <div className="flex flex-wrap gap-1">
          {['JPG', 'JPEG', 'PNG', 'GIF', 'SVG'].map(format => (
            <span key={format} className="bg-gray-100 px-2 py-1 rounded text-xs">
              {format}
            </span>
          ))}
        </div>
        <p className="mt-2">Max file size: 10MB</p>
      </div>
    </div>
  );
}

function TextPanel({ onAddText }: { onAddText: () => void }) {
  return (
    <div className="p-4">
      <h3 className="text-md font-medium text-gray-900 mb-3">Add Text</h3>
      
      <button
        onClick={onAddText}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
      >
        <PencilIcon className="h-4 w-4" />
        <span>Add Text Element</span>
      </button>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quick Text Presets
          </label>
          <div className="space-y-2">
            {[
              { text: 'Your Name Here', style: 'font-medium' },
              { text: 'Company Logo', style: 'font-bold text-lg' },
              { text: 'Event 2025', style: 'font-light' }
            ].map((preset, index) => (
              <button
                key={index}
                onClick={() => onAddText()}
                className="w-full text-left p-2 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <span className={preset.style}>{preset.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SymbolPanel({ onSymbolAdd }: { onSymbolAdd: (symbolId: string, color?: string) => void }) {
  const [selectedSymbol, setSelectedSymbol] = useState('star');
  const [selectedColor, setSelectedColor] = useState('#000000');

  const symbols = [
    { id: 'star', name: 'Star', Icon: Star, category: 'symbols' },
    { id: 'heart', name: 'Heart', Icon: Heart, category: 'symbols' },
    { id: 'check', name: 'Check', Icon: Check, category: 'symbols' },
    { id: 'arrow-right', name: 'Arrow Right', Icon: ArrowRight, category: 'arrows' },
    { id: 'arrow-up', name: 'Arrow Up', Icon: ArrowUp, category: 'arrows' },
    { id: 'smile', name: 'Smile', Icon: Smile, category: 'symbols' },
    { id: 'thumbs-up', name: 'Thumbs Up', Icon: ThumbsUp, category: 'symbols' },
    { id: 'fire', name: 'Fire', Icon: Flame, category: 'symbols' },
  ];

  const handleSymbolClick = (symbolId: string) => {
    setSelectedSymbol(symbolId);
    onSymbolAdd(symbolId, selectedColor);
  };

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    onSymbolAdd(selectedSymbol, color);
  };

  return (
    <div className="p-4">
      <h3 className="text-md font-medium text-gray-900 mb-3">Symbols & Icons</h3>
      
      <div className="grid grid-cols-4 gap-2">
        {symbols.map((symbol) => {
          const IconComponent = symbol.Icon;
          return (
            <button
              key={symbol.id}
              onClick={() => handleSymbolClick(symbol.id)}
              className={`aspect-square flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-2 rounded-md transition-colors ${
                selectedSymbol === symbol.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              title={symbol.name}
            >
              <IconComponent 
                className="h-6 w-6" 
                style={{ color: selectedColor }}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Symbol Color
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            '#000000', '#FFFFFF', '#FF0000', '#00FF00', 
            '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'
          ].map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                selectedColor === color ? 'border-blue-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={`Use ${color}`}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <button
          onClick={() => onSymbolAdd(selectedSymbol, selectedColor)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Add Symbol</span>
        </button>
      </div>
    </div>
  );
}