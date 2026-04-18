
import Chart from 'react-apexcharts';
import type { ApexOptions } from "apexcharts";
const CompanyChart = () => {
  const options: ApexOptions  = {
    chart: {
      height: 320,
      type: 'bar',
      toolbar: {
        show: false,
      },
      background: '#fff'
    },
    colors: ['#E04F16'],
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        columnWidth: '10px',
        colors: {
          backgroundBarColors: ['#E8E8E8'],
          backgroundBarOpacity: 1
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: false
    },
    xaxis: {
      categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      labels: {
        style: {
          colors: '#E04F16',
          fontSize: '13px'
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -15,
        show: false
      }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
      padding: {
        left: -8
      }
    },
    legend: {
      show: false
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
      name: 'Company',
      data: [40, 60, 20, 80, 60, 60, 60]
    }
  ];

  return (
    <div id="company-chart">
      <Chart options={options} series={series} type="bar" height={320} />
    </div>
  );
};

export default CompanyChart;
