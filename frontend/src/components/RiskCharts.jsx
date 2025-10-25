import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1A1A1A',
      titleColor: '#FFFFFF',
      bodyColor: '#A1A1A1',
      borderColor: '#262626',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      titleFont: {
        size: 13,
        weight: '600',
      },
      bodyFont: {
        size: 12,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        color: '#1F1F1F',
      },
      ticks: {
        color: '#737373',
        font: {
          size: 11,
          weight: '500',
        },
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: '#1F1F1F',
        lineWidth: 1,
      },
      ticks: {
        color: '#737373',
        font: {
          size: 11,
        },
      },
      border: {
        display: false,
      },
    },
  },
};

export function RiskCharts({ manufacturerData, riskData }) {
  const defaultManufacturerData = {
    labels: ['Microsoft', 'Adobe', 'Oracle', 'Salesforce', 'SAP', 'VMware', 'Atlassian'],
    datasets: [
      {
        data: [340, 160, 150, 120, 110, 100, 90],
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const defaultRiskData = {
    labels: ['Safe', 'Warning', 'Critical'],
    datasets: [
      {
        data: [1157, 67, 23],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1A1A1A',
        titleColor: '#FFFFFF',
        bodyColor: '#A1A1A1',
        borderColor: '#262626',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: '600',
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    cutout: '70%',
  };

  const barData = manufacturerData || defaultManufacturerData;
  const doughData = riskData || defaultRiskData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <div className="card p-6 hover:bg-card-hover transition-colors duration-200">
        <h3 className="text-lg font-bold text-white mb-6">
          Software by Manufacturer
        </h3>
        <div className="h-64">
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      {/* Doughnut Chart */}
      <div className="card p-6 hover:bg-card-hover transition-colors duration-200">
        <h3 className="text-lg font-bold text-white mb-6">Risk Categories</h3>
        <div className="flex items-center gap-8">
          <div className="h-64 w-64">
            <Doughnut data={doughData} options={doughnutOptions} />
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-4">
            {doughData.labels.map((label, index) => {
              const value = doughData.datasets[0].data[index];
              const color = doughData.datasets[0].backgroundColor[index];
              
              return (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-card"
                      style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
                    />
                    <span className="text-sm font-medium text-gray-400">{label}</span>
                  </div>
                  <span className="text-lg font-bold text-white">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

