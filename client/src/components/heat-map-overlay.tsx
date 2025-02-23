import { useEffect, useRef } from 'react';
import type { DetectedLesion } from '@shared/schema';

interface HeatMapOverlayProps {
  lesions: DetectedLesion[];
  width: number;
  height: number;
  visible: boolean;
}

export function HeatMapOverlay({ lesions, width, height, visible }: HeatMapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !visible) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient data
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // For each pixel
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let riskScore = 0;

        // Calculate risk influence from each lesion
        lesions.forEach(lesion => {
          const bbox = lesion.boundingBox;
          const lesionX = bbox.x * width;
          const lesionY = bbox.y * height;
          const lesionW = bbox.width * width;
          const lesionH = bbox.height * height;

          // Calculate distance from current pixel to lesion center
          const dx = x - (lesionX + lesionW/2);
          const dy = y - (lesionY + lesionH/2);
          const distance = Math.sqrt(dx*dx + dy*dy);

          // Calculate risk influence based on distance and lesion properties
          let influence = Math.max(0, 1 - distance/(Math.max(width, height)/4));
          
          // Adjust influence based on lesion classification and confidence
          if (lesion.classification === "melanoma") {
            influence *= 1.5; // Higher weight for melanoma
          }
          influence *= lesion.confidence;

          riskScore = Math.max(riskScore, influence);
        });

        // Set pixel color based on risk score
        const i = (y * width + x) * 4;
        if (riskScore > 0) {
          // Red channel increases with risk
          data[i] = Math.min(255, riskScore * 255);
          // Green and blue channels decrease with risk
          data[i + 1] = Math.max(0, 255 * (1 - riskScore));
          data[i + 2] = Math.max(0, 255 * (1 - riskScore));
          data[i + 3] = 128; // 50% opacity
        } else {
          // Transparent if no risk
          data[i + 3] = 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [lesions, width, height, visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
