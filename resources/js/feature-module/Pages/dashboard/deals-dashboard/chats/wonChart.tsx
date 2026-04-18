
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

const WonChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'bar' as const,
      height: 180,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#27AE60'],
    grid: {
      borderColor: '#E8E8E8',
      strokeDashArray: 4
    },
    xaxis: {
      categories: ['Conversation', 'Follow Up', 'Inpipeline']
    }
  };

  const series = [
    {
      data: [400, 122, 250]
    }
  ];

  return (
    <>
      <Chart options={options} series={series} type="bar" height={180} />
    </>
  );
};

export default WonChart;
