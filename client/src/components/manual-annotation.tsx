import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ManualAnnotationProps {
  imageUrl: string;
  existingBoxes: Array<{ id: string; boundingBox: BoundingBox }>;
  onAddBox: (box: BoundingBox) => void;
  onDeleteBox: (id: string) => void;
  className?: string;
}

export function ManualAnnotation({ 
  imageUrl, 
  existingBoxes, 
  onAddBox, 
  onDeleteBox, 
  className = '' 
}: ManualAnnotationProps) {
  const [drawingMode, setDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!drawingMode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawingMode || !isDrawing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / rect.width;
    const currentY = (e.clientY - rect.top) / rect.height;

    setCurrentBox({
      x: Math.min(startPos.x, currentX),
      y: Math.min(startPos.y, currentY),
      width: Math.abs(currentX - startPos.x),
      height: Math.abs(currentY - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (drawingMode && currentBox) {
      onAddBox(currentBox);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  const handleBoxClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedBoxId(id);
  };

  const handleDeleteSelected = () => {
    if (selectedBoxId) {
      onDeleteBox(selectedBoxId);
      setSelectedBoxId(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between bg-background/80 rounded-lg p-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDrawingMode(!drawingMode)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            {drawingMode ? "Disable" : "Enable"} Drawing Mode
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteSelected}
            disabled={!selectedBoxId}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {drawingMode 
            ? "Click and drag to draw new regions" 
            : "Enable drawing mode to annotate"}
        </p>
      </div>

      <div
        ref={containerRef}
        className={`relative ${drawingMode ? "cursor-crosshair" : "cursor-default"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDrawing(false);
          setCurrentBox(null);
        }}
      >
        <img
          src={imageUrl}
          alt="Image for annotation"
          className="w-full rounded-lg"
        />

        {existingBoxes.map(({ id, boundingBox }) => (
          <div
            key={id}
            className={`absolute border-2 transition-all duration-75 cursor-pointer
                      ${selectedBoxId === id 
                        ? 'border-primary bg-primary/20' 
                        : 'border-muted-foreground/80 hover:border-primary'}`}
            style={{
              left: `${boundingBox.x * 100}%`,
              top: `${boundingBox.y * 100}%`,
              width: `${boundingBox.width * 100}%`,
              height: `${boundingBox.height * 100}%`,
            }}
            onClick={(e) => handleBoxClick(e, id)}
          />
        ))}

        {currentBox && drawingMode && (
          <div
            className="absolute border-2 border-primary bg-primary/10"
            style={{
              left: `${currentBox.x * 100}%`,
              top: `${currentBox.y * 100}%`,
              width: `${currentBox.width * 100}%`,
              height: `${currentBox.height * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
