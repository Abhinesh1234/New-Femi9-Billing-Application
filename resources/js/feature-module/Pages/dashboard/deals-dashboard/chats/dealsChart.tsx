
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

const DealsChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'bar' as const, // 👈 fix here
      height: 385,
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: '#E8E8E8',
      strokeDashArray: 4,
      padding: {
        right: -20
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%'
      }
    },
    colors: ['#0E9384'],
    xaxis: {
      type: 'category' as const,
      categories: [
        'Inpipeline',
        'Follow Up',
        'Schedule',
        'Conversation',
        'Won',
        'Lost'
      ],
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 600
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -13
      }
    }
  };

  const series = [
    {
      name: 'Sales',
      data: [400, 130, 248, 470, 470, 180]
    }
  ];

  return (
    <>
      <Chart options={options} series={series} type="bar" height={385} />
    </>
  );
};

export default DealsChart;
