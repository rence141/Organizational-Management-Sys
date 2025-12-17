// frontend/src/pages/admin/AdminCharts.jsx
import { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminCharts({ users = [], organizations = [] }) {
  const userSignupsData = useMemo(() => {
    const last30Days = Array(30).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: 0
      };
    });

    users.forEach(user => {
      if (!user.createdAt) return;
      const userDate = new Date(user.createdAt).toISOString().split('T')[0];
      const day = last30Days.find(d => d.date === userDate);
      if (day) day.count++;
    });

    return last30Days;
  }, [users]);

  const orgData = useMemo(() => {
    return organizations
      .slice(0, 5)
      .map(org => ({
        name: org.name,
        members: org.memberCount || 0
      }));
  }, [organizations]);

  const lineChartData = {
    labels: userSignupsData.map(d => d.date),
    datasets: [
      {
        label: 'New Users',
        data: userSignupsData.map(d => d.count),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const barChartData = {
    labels: orgData.map(org => org.name),
    datasets: [
      {
        label: 'Members',
        data: orgData.map(org => org.members),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-80">
        <h3 className="text-sm font-medium text-gray-500 mb-2">User Signups (Last 30 Days)</h3>
        <Line data={lineChartData} options={chartOptions} />
      </div>
      
      <div className="h-80">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Top Organizations by Members</h3>
        <Bar 
          data={barChartData} 
          options={{
            ...chartOptions,
            indexAxis: 'y',
          }} 
        />
      </div>
    </div>
  );
}