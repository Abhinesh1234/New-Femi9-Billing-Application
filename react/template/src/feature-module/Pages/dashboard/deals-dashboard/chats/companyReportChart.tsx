
import Chart from 'react-apexcharts';
import type { ApexOptions } from "apexcharts";
const CompanyYearChart = () => {
  const options: ApexOptions = {
    chart: {
      height: 273,
      type: 'line',
      zoom: {
        enabled: false
      }
    },
    colors: ['#FFA201'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yaxis: {
      min: 10,
      max: 60,
      tickAmount: 5,
      labels: {
        formatter: (val:any) => `${val}K`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    }
  };

  const series = [
    {
      name: 'Company',
      data: [15, 20, 17, 40, 22, 40, 30, 15, 55, 30, 20, 25]
    }
  ];

  return (
    <div id="company-year">
      <Chart options={options} series={series} type="line" height={273} />
    </div>
  );
};

export default CompanyYearChart;
