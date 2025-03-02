import { Line } from 'react-chartjs-2';
import type { DetectedLesion } from '@shared/schema';
import { useMemo, useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LesionTrackingProps {
  lesion: DetectedLesion;
  imageUrl: string; // Base64 image data
}

export function LesionTracking({ lesion, imageUrl }: LesionTrackingProps) {
  // State management
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  // Generate tracking data
  const trackingData = useMemo(() => {
    const baseSize = lesion.tracking?.initialSize || 0;
    const growthRate = lesion.tracking?.growthRate || 0;
    const lastChecked = new Date(lesion.tracking?.lastChecked || Date.now());
    
    // Generate data points for the last 3 months
    const dataPoints = Array.from({ length: 3 }, (_, i) => {
      const date = new Date(lastChecked);
      date.setMonth(date.getMonth() - i);
      const size = baseSize * (1 + (growthRate * i));
      
      // For the most recent point (i=0), we'll use the actual cropped image
      // For older points, use the placeholder images
      const image = i === 0 ? null : `/tracking/blob${i+1}.png`;
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        size: Number(size.toFixed(2)),
        imageUrl: image
      };
    }).reverse();

    return {
      labels: dataPoints.map(d => d.date),
      datasets: [{
        label: 'Lesion Size (cm²)',
        data: dataPoints.map(d => d.size),
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: dataPoints.map((_, i) => 
          i === selectedPoint ? 'rgb(234, 88, 12)' : 'rgb(255, 255, 255)'
        ),
        pointBorderColor: 'rgb(234, 88, 12)',
        pointBorderWidth: 2
      }],
      dataPoints
    };
  }, [lesion, selectedPoint]);

  // Chart options
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false // Disable built-in tooltips for custom control
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Size (cm²)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    onClick: (event, elements) => {
      if (elements && elements.length > 0) {
        setSelectedPoint(prev => 
          prev === elements[0].index ? null : elements[0].index
        );
      } else {
        // Only clear if not clicking on the image panel
        if (event.target === chartRef.current?.canvas) {
          setSelectedPoint(null);
        }
      }
    },
    interaction: {
      mode: 'point',
      intersect: true
    }
  }), []);

  // Set initial selection to most recent data point
  useEffect(() => {
    setSelectedPoint(trackingData.dataPoints.length - 1);
  }, [trackingData.dataPoints.length]);

  // Handle clicking outside to close image
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSelectedPoint(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!imageUrl || !lesion?.boundingBox) return;

    const cropLesion = async () => {
      try {
        const img = new Image();
        img.onload = () => {
          const { x, y, width, height } = lesion.boundingBox;

          // Convert relative coordinates to absolute pixel values
          const absX = x * img.width;
          const absY = y * img.height;
          const absWidth = width * img.width;
          const absHeight = height * img.height;

          console.log(`Cropping at: x=${absX}, y=${absY}, width=${absWidth}, height=${absHeight}`);

          // Create a canvas and context
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          canvas.width = absWidth;
          canvas.height = absHeight;

          // Draw cropped region
          ctx.drawImage(img, absX, absY, absWidth, absHeight, 0, 0, absWidth, absHeight);

          // Convert to Base64
          const croppedDataUrl = canvas.toDataURL("image/jpeg");
          setCroppedImage(croppedDataUrl);
        };

        img.onerror = (err) => console.error("Failed to load image", err);
        img.src = imageUrl;
      } catch (error) {
        console.error("Error cropping lesion image:", error);
      }
    };

    cropLesion();
  }, [imageUrl, lesion?.boundingBox]);

  // Get the image URL for the selected data point
  const getSelectedImageUrl = () => {
    if (selectedPoint === null) return null;
    
    // For the most recent data point, use the cropped actual image
    if (selectedPoint === trackingData.dataPoints.length - 1) {
      return croppedImage || trackingData.dataPoints[selectedPoint].imageUrl;
    }
    
    // For older data points, use the stored URLs
    return trackingData.dataPoints[selectedPoint].imageUrl;
  };

  return (
    <div ref={containerRef} className="mt-4 p-6 border rounded-lg bg-background relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium">Growth Tracking</h3>
        <div className="text-sm text-gray-500">
          Click on points to view lesion images
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="md:col-span-2 h-64">
          <Line
            ref={chartRef}
            data={trackingData}
            options={options}
          />
        </div>
        
        {/* Image Area - Always visible but shows content conditionally */}
        <div className="md:col-span-1 border rounded-lg shadow-sm p-4 bg-white flex flex-col justify-center items-center">
          {selectedPoint !== null && (selectedPoint === trackingData.dataPoints.length - 1 ? croppedImage : getSelectedImageUrl()) ? (
            <>
              <div className="text-sm font-medium mb-3 text-center">
                {trackingData.labels[selectedPoint]}
              </div>
              <div className="relative mb-3 w-full">
                <img 
                  src={selectedPoint === trackingData.dataPoints.length - 1 ? croppedImage : getSelectedImageUrl()} 
                  alt={`Lesion on ${trackingData.labels[selectedPoint]}`}
                  className="w-full h-auto rounded-md"
                />
                <div className="absolute top-0 left-0 w-full h-full border-2 border-orange-500 rounded-md pointer-events-none"></div>
              </div>
              <div className="text-sm mb-1">
                Size: <span className="font-medium">{trackingData.dataPoints[selectedPoint].size} cm²</span>
              </div>
              {selectedPoint < trackingData.dataPoints.length - 1 && (
                <div className="text-xs text-gray-500">
                  {Math.round((trackingData.dataPoints[trackingData.dataPoints.length - 1].size / 
                    trackingData.dataPoints[selectedPoint].size - 1) * 100)}% growth since this scan
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-center">
              <p>Select a data point to view lesion image</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Time comparison feature */}
      {selectedPoint !== null && selectedPoint < trackingData.dataPoints.length - 1 && (
        <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-md text-sm">
          <div className="font-medium text-orange-800 mb-1">Growth Analysis</div>
          <p className="text-orange-700">
            This lesion has grown by {Math.round((trackingData.dataPoints[trackingData.dataPoints.length - 1].size / 
            trackingData.dataPoints[selectedPoint].size - 1) * 100)}% since {trackingData.labels[selectedPoint]}.
          </p>
        </div>
      )}
    </div>
  );
}