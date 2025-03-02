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

    // Create heatmap data
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    const maxDistance = Math.max(width, height) / 8; // Reduce spread for more localized heatmap

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
          const dx = x - (lesionX + lesionW / 2);
          const dy = y - (lesionY + lesionH / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Use exponential decay for influence
          let influence = Math.exp(-distance / (maxDistance / 3));

          // Adjust influence based on lesion classification and confidence
          if (lesion.classification === "melanoma") {
            influence *= 1.5; // Higher weight for melanoma
          }
          influence *= lesion.confidence;

          riskScore = Math.max(riskScore, influence);
        });

        // Normalize risk score to [0,1]
        riskScore = Math.min(1, riskScore);

        // Convert risk score to a heatmap color
        const hue = 240 - (240 * riskScore); // 240 (blue) → 0 (red)
        const color = hslToRgb(hue, 100, 50); // Convert HSL to RGB

        // Set pixel color
        const i = (y * width + x) * 4;
        data[i] = color[0]; // Red
        data[i + 1] = color[1]; // Green
        data[i + 2] = color[2]; // Blue
        data[i + 3] = 180; // 70% opacity
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

// Utility function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}
