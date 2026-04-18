import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

const PlanOverviewChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      height: 240,
      type: 'donut',
      toolbar: {
        show: false
      }
    },
    colors: ['#E41F07', '#FFA201', '#2F80ED'],
    labels: ['Enterprise', 'Premium', 'Basic'],
    plotOptions: {
      pie: {
        donut: {
          size: '50%',
          labels: {
            show: false
          }
        }
      }
    },
    stroke: {
      show: true,
      width: 0,
      colors: ['#fff'],
      lineCap: 'round'
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 180
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  const series = [20, 20, 60];

  return (
    <div id="plan-overview">
      <Chart options={options} series={series} type="donut" height={240} />
    </div>
  );
};

export default PlanOverviewChart;
