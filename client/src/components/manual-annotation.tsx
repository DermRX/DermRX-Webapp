import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ManualAnnotationProps {
  imageUrl: string;
  onAddBox: (box: { x: number; y: number; width: number; height: number }) => void;
  className?: string;
}

export function ManualAnnotation({ imageUrl, onAddBox, className = '' }: ManualAnnotationProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return;

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
    if (currentBox) {
      onAddBox(currentBox);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-10 bg-background/80 rounded-lg p-2">
        <Button variant="outline" size="sm" disabled>
          <Pencil className="h-4 w-4 mr-2" />
          Drawing Mode
        </Button>
      </div>
      
      <div
        ref={containerRef}
        className="relative cursor-crosshair"
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
        
        {currentBox && (
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
