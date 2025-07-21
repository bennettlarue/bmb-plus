'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { DesignState, AnyDesignElement, TextElement, ImageElement, SymbolElement } from 'lib/design-studio/types';
import { findElementAtPoint } from 'lib/design-studio/utils';

interface DesignCanvasProps {
  state: DesignState;
  dispatch: React.Dispatch<any>;
  currentTool: string;
}

interface DragState {
  isDragging: boolean;
  dragElementId: string | null;
  lastX: number;
  lastY: number;
  startX: number;
  startY: number;
}

export function DesignCanvas({ state, dispatch, currentTool }: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragElementId: null,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0
  });

  const getCanvasPosition = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const { x, y } = getCanvasPosition(e.clientX, e.clientY);
    const clickedElement = findElementAtPoint(state.elements, x, y);

    if (clickedElement) {
      dispatch({ type: 'SELECT_ELEMENT', elementId: clickedElement.id });
      setDragState({
        isDragging: true,
        dragElementId: clickedElement.id,
        lastX: e.clientX,
        lastY: e.clientY,
        startX: x,
        startY: y
      });
    } else {
      dispatch({ type: 'SELECT_ELEMENT', elementId: null });
      
      // Handle tool actions on empty canvas click
      if (currentTool === 'text') {
        dispatch({ type: 'ADD_TEXT', x, y, content: 'Your text here' });
      }
    }
  }, [state.elements, dispatch, currentTool, getCanvasPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.dragElementId) return;

    const deltaX = e.clientX - dragState.lastX;
    const deltaY = e.clientY - dragState.lastY;

    const element = state.elements.find(el => el.id === dragState.dragElementId);
    if (element) {
      dispatch({
        type: 'UPDATE_ELEMENT',
        elementId: dragState.dragElementId,
        updates: {
          x: Math.max(0, Math.min(state.canvasWidth - element.width, element.x + deltaX)),
          y: Math.max(0, Math.min(state.canvasHeight - element.height, element.y + deltaY))
        }
      });
    }

    setDragState(prev => ({
      ...prev,
      lastX: e.clientX,
      lastY: e.clientY
    }));
  }, [dragState, state.elements, state.canvasWidth, state.canvasHeight, dispatch]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragElementId: null,
      lastX: 0,
      lastY: 0,
      startX: 0,
      startY: 0
    });
  }, []);

  const renderElement = (element: AnyDesignElement) => {
    const isSelected = element.id === state.selectedElementId;
    
    const commonProps = {
      key: element.id,
      style: {
        position: 'absolute' as const,
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
        cursor: 'move'
      }
    };

    const selectionStyle = isSelected ? {
      outline: '2px solid #3b82f6',
      outlineOffset: '2px'
    } : {};

    switch (element.type) {
      case 'text':
        const textElement = element as TextElement;
        return (
          <div
            {...commonProps}
            style={{
              ...commonProps.style,
              ...selectionStyle,
              fontSize: textElement.fontSize,
              fontFamily: textElement.fontFamily,
              color: textElement.color,
              fontWeight: textElement.fontWeight,
              fontStyle: textElement.fontStyle,
              textAlign: textElement.textAlign,
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {textElement.content}
          </div>
        );

      case 'image':
        const imageElement = element as ImageElement;
        return (
          <div
            {...commonProps}
            style={{
              ...commonProps.style,
              ...selectionStyle
            }}
          >
            <Image
              src={imageElement.src}
              alt="Uploaded design element"
              fill
              style={{ objectFit: 'contain' }}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        );

      case 'symbol':
        const symbolElement = element as SymbolElement;
        return (
          <div
            {...commonProps}
            style={{
              ...commonProps.style,
              ...selectionStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.min(element.width, element.height) * 0.8,
              color: symbolElement.color
            }}
          >
            {/* For now, just show a placeholder - we'll implement actual symbols later */}
            ⭐
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <div
        ref={canvasRef}
        className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200"
        style={{
          width: state.canvasWidth,
          height: state.canvasHeight,
          backgroundImage: state.productImageSrc ? `url(${state.productImageSrc})` : undefined,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Product background image */}
        {state.productImageSrc && (
          <div className="absolute inset-0">
            <Image
              src={state.productImageSrc}
              alt="Product background"
              fill
              style={{ objectFit: 'contain' }}
              className="pointer-events-none"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        )}

        {/* Design elements */}
        {state.elements
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(renderElement)}
      </div>

      {/* Canvas info */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Click to add elements • Drag to move • Click outside to deselect
      </div>
    </div>
  );
}