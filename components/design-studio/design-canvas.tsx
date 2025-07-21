'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { DesignState, AnyDesignElement, TextElement, ImageElement, SymbolElement } from 'lib/design-studio/types';
import { findElementAtPoint } from 'lib/design-studio/utils';

interface ElementControlsProps {
  element: AnyDesignElement;
  onResize: (width: number, height: number) => void;
  onRotate: (rotation: number) => void;
  dispatch: React.Dispatch<any>;
}

function ElementControls({ element, onResize, onRotate, dispatch }: ElementControlsProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startRotation, setStartRotation] = useState(0);

  const handleResizeStart = useCallback((e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    setIsResizing(true);
    
    // Get the canvas container to calculate relative positions
    const canvas = (e.target as HTMLElement).closest('.relative');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const currentStartPos = { x: e.clientX, y: e.clientY };
    const currentStartSize = { width: element.width, height: element.height };
    const currentStartElement = { x: element.x, y: element.y };
    
    setStartPos(currentStartPos);
    setStartSize(currentStartSize);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to canvas
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      let newWidth = currentStartSize.width;
      let newHeight = currentStartSize.height;
      let newX = currentStartElement.x;
      let newY = currentStartElement.y;
      
      // Calculate new size and position based on which corner is being dragged
      switch (corner) {
        case 'se': // bottom-right - mouse follows bottom-right corner
          newWidth = Math.max(20, mouseX - currentStartElement.x);
          newHeight = Math.max(20, mouseY - currentStartElement.y);
          break;
        case 'sw': // bottom-left - mouse follows bottom-left corner
          newWidth = Math.max(20, (currentStartElement.x + currentStartSize.width) - mouseX);
          newHeight = Math.max(20, mouseY - currentStartElement.y);
          newX = Math.min(mouseX, currentStartElement.x + currentStartSize.width - 20);
          break;
        case 'ne': // top-right - mouse follows top-right corner
          newWidth = Math.max(20, mouseX - currentStartElement.x);
          newHeight = Math.max(20, (currentStartElement.y + currentStartSize.height) - mouseY);
          newY = Math.min(mouseY, currentStartElement.y + currentStartSize.height - 20);
          break;
        case 'nw': // top-left - mouse follows top-left corner
          newWidth = Math.max(20, (currentStartElement.x + currentStartSize.width) - mouseX);
          newHeight = Math.max(20, (currentStartElement.y + currentStartSize.height) - mouseY);
          newX = Math.min(mouseX, currentStartElement.x + currentStartSize.width - 20);
          newY = Math.min(mouseY, currentStartElement.y + currentStartSize.height - 20);
          break;
      }
      
      // Update both size and position if needed
      const updates: any = { width: newWidth, height: newHeight };
      if (newX !== currentStartElement.x) updates.x = newX;
      if (newY !== currentStartElement.y) updates.y = newY;
      
      onResize(newWidth, newHeight);
      // We need to also update position for some corners
      if (updates.x !== undefined || updates.y !== undefined) {
        // This is a bit of a hack - we should have an onMove callback too
        dispatch({
          type: 'UPDATE_ELEMENT',
          elementId: element.id,
          updates: updates
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [element, onResize]);

  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    
    // Get the canvas container to calculate relative positions
    const canvas = (e.target as HTMLElement).closest('.relative');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const elementCenter = {
      x: element.x + element.width / 2,
      y: element.y + element.height / 2
    };
    
    // Calculate initial angle from center to mouse
    const startMouseX = e.clientX - canvasRect.left;
    const startMouseY = e.clientY - canvasRect.top;
    const startAngle = Math.atan2(startMouseY - elementCenter.y, startMouseX - elementCenter.x);
    const startAngleDegrees = (startAngle * 180) / Math.PI;
    const initialRotation = element.rotation;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate current mouse position relative to canvas
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // Calculate current angle from center to mouse
      const currentAngle = Math.atan2(mouseY - elementCenter.y, mouseX - elementCenter.x);
      const currentAngleDegrees = (currentAngle * 180) / Math.PI;
      
      // Calculate the rotation delta and apply it to the initial rotation
      const angleDelta = currentAngleDegrees - startAngleDegrees;
      let newRotation = initialRotation + angleDelta;
      
      // Normalize rotation to -180 to 180 degrees
      while (newRotation > 180) newRotation -= 360;
      while (newRotation < -180) newRotation += 360;
      
      onRotate(newRotation);
    };
    
    const handleMouseUp = () => {
      setIsRotating(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [element, onRotate]);

  const handleStyle = {
    position: 'absolute' as const,
    width: '12px',
    height: '12px',
    backgroundColor: '#3b82f6',
    border: '2px solid white',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex + 1,
        pointerEvents: 'none'
      }}
    >
      {/* Corner resize handles */}
      <div
        style={{ ...handleStyle, top: -6, left: -6, cursor: 'nw-resize', pointerEvents: 'auto' }}
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
      <div
        style={{ ...handleStyle, top: -6, right: -6, cursor: 'ne-resize', pointerEvents: 'auto' }}
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      <div
        style={{ ...handleStyle, bottom: -6, left: -6, cursor: 'sw-resize', pointerEvents: 'auto' }}
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />
      <div
        style={{ ...handleStyle, bottom: -6, right: -6, cursor: 'se-resize', pointerEvents: 'auto' }}
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />
      
      {/* Rotation handle */}
      <div
        style={{
          ...handleStyle,
          top: -30,
          left: '50%',
          marginLeft: -6,
          backgroundColor: '#f59e0b',
          cursor: 'crosshair',
          pointerEvents: 'auto'
        }}
        onMouseDown={handleRotateStart}
        title="Rotate"
      />
      
      {/* Rotation line */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          left: '50%',
          width: '2px',
          height: '24px',
          backgroundColor: '#f59e0b',
          marginLeft: -1,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}

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

  const renderElementWithControls = (element: AnyDesignElement) => {
    const isSelected = element.id === state.selectedElementId;
    
    return (
      <div key={element.id}>
        {/* The actual element */}
        {renderElement(element)}
        
        {/* Selection controls - only show for selected element */}
        {isSelected && (
          <ElementControls 
            element={element}
            dispatch={dispatch}
            onResize={(width, height) => {
              dispatch({
                type: 'UPDATE_ELEMENT',
                elementId: element.id,
                updates: { width, height }
              });
            }}
            onRotate={(rotation) => {
              dispatch({
                type: 'UPDATE_ELEMENT',
                elementId: element.id,
                updates: { rotation }
              });
            }}
          />
        )}
      </div>
    );
  };

  const renderElement = (element: AnyDesignElement) => {
    const isSelected = element.id === state.selectedElementId;
    
    const commonProps = {
      style: {
        position: 'absolute' as const,
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
        cursor: 'move',
        userSelect: 'none' as const,
        WebkitUserSelect: 'none' as const,
        MozUserSelect: 'none' as const,
        msUserSelect: 'none' as const,
        WebkitTouchCallout: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
      }
    };

    const selectionStyle = isSelected ? {
      border: '2px dashed #3b82f6',
      borderRadius: '4px'
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
        className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 select-none"
        style={{
          width: state.canvasWidth,
          height: state.canvasHeight,
          backgroundImage: state.productImageSrc ? `url(${state.productImageSrc})` : undefined,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          userSelect: 'none' as const,
          WebkitUserSelect: 'none' as const,
          MozUserSelect: 'none' as const,
          msUserSelect: 'none' as const,
          WebkitTouchCallout: 'none' as const,
          WebkitTapHighlightColor: 'transparent'
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
          .map(renderElementWithControls)}
      </div>

      {/* Canvas info */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Click to add elements • Drag to move • Click outside to deselect
      </div>
    </div>
  );
}