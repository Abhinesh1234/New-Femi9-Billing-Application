
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

const DealsReportChart = () => {
  const options:ApexOptions = {
    chart: {
      type: 'bar',
      height: 270,
      toolbar: {
        show: false,
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%'
      }
    },
    colors: ['#5CB85C', '#FC0027'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val:any) {
          return val + " Deals";
        }
      }
    }
  };

  const series = [
    {
      name: 'Won Deals',
      data: [110, 85, 100, 90, 85, 105, 90, 115, 95]
    },
    {
      name: 'Lost Deals',
      data: [45, 55, 50, 55, 40, 60, 55, 60, 66]
    }
  ];

  return (
    <>
      <Chart options={options} series={series} type="bar" height={270} />
    </>
  );
};

export default DealsReportChart;
