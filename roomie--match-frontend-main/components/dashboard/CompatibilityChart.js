import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const CompatibilityChart = ({ compatibility }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!compatibility) return;

    const ctx = chartRef.current.getContext('2d');
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Lifestyle', 'Cleanliness', 'Schedule', 'Social', 'Values'],
        datasets: [
          {
            label: 'Compatibility',
            data: [
              compatibility.lifestyle,
              compatibility.cleanliness,
              compatibility.schedule,
              compatibility.social,
              compatibility.values
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              stepSize: 20
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.r}% compatibility`;
              }
            }
          }
        }
      }
    });

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [compatibility]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default CompatibilityChart;