
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

const DealsYearChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'area' as const,
      height: 273,
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    colors: ['#FFA201'],
    dataLabels: { enabled: false },
    stroke: { curve: 'straight' },
    fill: {
      type: 'solid',
      opacity: 0 // removes area background
    },
    markers: {
      size: 5,
      shape: 'circle',
      strokeWidth: 2,
      strokeColors: '#FFA201',
      hover: {
        size: 7
      }
    },
    grid: {
      borderColor: '#E8E8E8',
      strokeDashArray: 4
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yaxis: {
      min: 1,
      max: 6,
      tickAmount: 5,
      labels: {
        offsetX: -15,
        formatter: (val: number) => `${val}K`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    }
  };

  const series = [
    {
      name: 'Deals',
      data: [1, 2, 3, 1.5, 2.2, 4, 3.0, 2.0, 3.0, 1.8, 3.0, 6.0]
    }
  ];

  return (
    <>
      <Chart options={options} series={series} type="area" height={273} />
    </>
  );
};

export default DealsYearChart;
