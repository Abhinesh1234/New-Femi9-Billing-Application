import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

const RevenueIncomeChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      height: 260,
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false
      }
    },
    colors: ['#0E9384', '#E8E8E8'],
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusWhenStacked: 'all',
        horizontal: false,
        columnWidth: '24px'
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: {
          colors: '#0E9384',
          fontSize: '13px'
        }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        offsetX: -15,
        style: {
          colors: '#6B7280',
          fontSize: '13px'
        },
        formatter: (value: number) => `${value}K`
      }
    },
    grid: {
      borderColor: 'transparent',
      strokeDashArray: 5,
      padding: {
        left: -8
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val / 10} k`
      }
    },
    fill: {
      opacity: 1
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }
    ]
  };

  const series = [
    {
      name: 'Income',
      data: [40, 30, 45, 80, 85, 90, 80, 80, 80, 85, 20, 80]
    },
    {
      name: 'Expenses (bg)',
      data: Array(12).fill(100)
    }
  ];

  return (
    <div id="revenue-income">
      <Chart options={options} series={series} type="bar" height={260} />
    </div>
  );
};

export default RevenueIncomeChart;
