
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
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
import type { DetectedLesion } from '@shared/schema';

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
}

export function LesionTracking({ lesion }: LesionTrackingProps) {
  const trackingData = useMemo(() => {
    const baseSize = lesion.tracking?.initialSize || 0;
    const growthRate = lesion.tracking?.growthRate || 0;
    const lastChecked = new Date(lesion.tracking?.lastChecked || Date.now());
    
    // Generate data points for the last 6 months
    const dataPoints = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(lastChecked);
      date.setMonth(date.getMonth() - i);
      const size = baseSize * (1 + (growthRate * i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        size
      };
    }).reverse();

    return {
      labels: dataPoints.map(d => d.date),
      datasets: [{
        label: 'Lesion Size (cm²)',
        data: dataPoints.map(d => d.size),
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        tension: 0.4
      }]
    };
  }, [lesion]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Growth Tracking</h3>
      <div className="h-[200px]">
        <Line
          data={trackingData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Size (cm²)'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}
