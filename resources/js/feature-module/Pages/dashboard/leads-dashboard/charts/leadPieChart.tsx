
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

const LeadPieChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'pie' as const,
      height: 440
    },
    colors: ['#2F80ED', '#27AE60', '#FFA201', '#E41F07'],
    labels: ['Inpipeline', 'Follow Up', 'Schedule Service', 'Conversation'],
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      enabled: false
    },
    responsive: [
      {
        breakpoint: 1199,
        options: {
          chart: {
            height: 350
          },
          legend: {
            position: 'bottom'
          }
        }
      },
      {
        breakpoint: 575,
        options: {
          chart: {
            height: 280
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  const series = [44, 55, 13, 43];

  return (
    
      <Chart options={options} series={series} type="pie" height={440} />

  );
};

export default LeadPieChart;
